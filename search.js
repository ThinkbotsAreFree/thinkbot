module.exports = function(observer, newId) {



    var module = {};



    const memory = {
        invertedIndex: {},
        index: {}
    };



    module.newId = (function(){
        var current = "0";
        var addOne = function(s) {		
            let newNumber = '';
            let continueAdding = true;		
            for (let i = s.length - 1; i>= 0; i--) {			
                if (continueAdding) {				
                    let num = parseInt(s[i], 10) + 1;			
                    if (num < 10) {					
                        newNumber += num;
                        continueAdding = false;					
                    } else {					
                        newNumber += '0';
                        if (i==0) newNumber += '1';
                    }				
                } else {  			
                    newNumber +=s[i];
                }
            }		
            return newNumber.split("").reverse().join("");
        }	
        return function() {
            current = addOne(current);
            return "i"+current;
        };
    })();



    module.addDoc = function(id, doc) {

        if (memory.index[id]) throw "ID already used: "+id;

        observer.signal(
            [ "search", "addDoc", "write" ],
            { docId: id }
        );

        memory.index[id] = doc;

        for (var field in doc) if (field != "id") {

            observer.signal(
                [ "search", "addDoc field", "write" ],
                { docId: id, field: field }
            );

            var line = doc[field];
            if (typeof line == "string") line = line.split(' ');
            if (!Array.isArray(line)) line = [line];
            line.forEach(token => {

                observer.signal(
                    [ "search", "addDoc inverted ref", "write" ],
                    { docId: id, field: field, ref: token }
                );

                if (!memory.invertedIndex[token])
                    memory.invertedIndex[token] = [];

                if (!memory.invertedIndex[token].includes(id))
                    memory.invertedIndex[token].push(id);
            });
        }
    };



    module.removeDoc = function(id) {

        if (!memory.index[id]) throw "Unknown ID: "+id;

        observer.signal(
            [ "search", "removeDoc", "write" ],
            { docId: id }
        );

        var doc = memory.index[id];

        for (var field in doc) {

            observer.signal(
                [ "search", "removeDoc field", "write" ],
                { docId: id, field: field }
            );

            doc[field].forEach(token => {

                observer.signal(
                    [ "search", "removeDoc inverted ref", "write" ],
                    { docId: id, field: field, ref: token }
                );

                memory.invertedIndex[token] = memory.invertedIndex[token].filter(ref => ref != id);
                if (memory.invertedIndex[token].length == 0) delete memory.invertedIndex[token];
            });
        }

        delete memory.index[id];
    };



    module.getDoc = function(id) {

        observer.signal(
            [ "search", "getDoc", "read" ],
            { docId: id }
        );

        return memory.index[id];
    }



    module.getRelation = function(id) {

        observer.signal(
            [ "search", "getRelation", "read" ],
            { docId: id }
        );

        return memory.index[id] ? memory.index[id].relation : [];
    }



    module.getBacklink = function(id) {

        observer.signal(
            [ "search", "getBacklink", "read" ],
            { docId: id }
        );

        return memory.invertedIndex[id];
    }



    module.find = function(rawOrQuery, rawAndQuery) {

        var count = [],
            orQuery = [],
            andQuery = [];

        rawOrQuery.forEach(ref => {
            if (!orQuery.includes(ref)) orQuery.push(ref);
        });

        if (rawAndQuery) rawAndQuery.forEach(ref => {
            if (!orQuery.includes(ref)) orQuery.push(ref);
            if (!andQuery.includes(ref)) andQuery.push(ref);
        });

        orQuery.forEach(token => {

            if (memory.invertedIndex[token])
                count = count.concat(
                    memory.invertedIndex[token]
                );
        });

        var score = {};

        count.forEach(hit => {
            if (!score[hit]) score[hit] = 0;
            score[hit] += 1;
        });

        var results = [],
            found;

        for (var s in score) {

            found = [];
            for (var field in memory.index[s]) {

                if (Array.isArray(memory.index[s][field]))
                    memory.index[s][field].forEach(token => {
                        if (andQuery.includes(token) && !found.includes(token))
                            found.push(token);
                    });
            };
            if (found.length == andQuery.length) results.push({ id: s, score: score[s] });
        }

        results.sort(function(a, b) { return b.score - a.score; });

        observer.signal(
            [ "search", "find", "read" ],
            { orQuery: orQuery, andQuery: andQuery, results: results }
        );

        return results;
    };



    module.expandRelations = function(results) {

        results.forEach(r => r.relation = module.getDoc(r.id).relation);

        var ref = {};
        results.forEach(result => { ref[result.id] = result; });

        var noTop = [];

        results.forEach(result => {

            var takenTokens = [];
            var tokenCount = -1;
            result.expandedScore = result.score;
                
            result.expandedRelation = result.relation.slice(0);

            while (tokenCount != takenTokens.length) {

                tokenCount = takenTokens.length;

                result.expandedRelation = result.expandedRelation.map(token => {

                    if (ref[token]) {
                        if (!takenTokens.includes(token)) {
                            takenTokens.push(token);
                            noTop.push(token);
                            result.expandedScore += ref[token].score;
                        }
                        return ref[token].relation;
                    }
                    else
                        return token;
                });
            }
            result.expandedRelation = result.expandedRelation.flat(Infinity);
        });

        return results.filter(r => !noTop.includes(r.id));
    }



    // relations of list of ids

    module.exploreForward = function(list) {

        var result = [];

        observer.pushActor("exploreForward");

        list.forEach(item => {

            var r = module.getRelation(item);
            if (r) result = result.concat(r);
        });

        observer.popActor();

        observer.signal(
            [ "search", "exploreForward", "read" ],
            { list: list, forward: result }
        );

        return result;
    }



    // backlinks of list of ids

    module.exploreBackward = function(list) {

        var result = [];

        observer.pushActor("exploreBackward");

        list.forEach(item => {

            var bl = module.getBacklink(item);
            if (bl) result = result.concat(bl);
        });

        observer.popActor();

        observer.signal(
            [ "search", "exploreBackward", "read" ],
            { list: list, backward: result }
        );

        return result;
    }



    // all that's contained in relations that contain given tokens, without given tokens
    // tokens neighbourhood = other tokens in same relations
    // neighbourhood(eng1, type) = engine

    module.neighbourhood = function(list) {

        var found = module.find([], list);

        var result = [];

        found.forEach(f => {

            result = result.concat(
                module.getRelation(f.id).filter(token => !list.includes(token))
            );
        });

        observer.signal(
            [ "search", "neighbourhood", "read" ],
            { list: list, neighbourhood: result }
        );

        return result;
    }



    module.link = function(relation) {

        var id = module.newId();
        module.addDoc(id, {
            id: id,
            relation: relation
        });        
    }



    // testing purpose

    module.memory = memory;



    return module;
}