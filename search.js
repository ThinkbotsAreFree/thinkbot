


const memory = {
    invertedIndex: {},
    index: {}
};



exports.addDoc = function(id, doc) {

    if (memory.index[id]) throw "ID already used: "+id;

    memory.index[id] = doc;

    for (var field in doc) {

        var line = doc[field];
        if (typeof line == "string") line = line.split(' ');
        if (!Array.isArray(line)) line = [line];
        line.forEach(token => {

            if (!memory.invertedIndex[token])
                memory.invertedIndex[token] = [];

            if (!memory.invertedIndex[token].includes(id))
                memory.invertedIndex[token].push(id);
        });
    }
};



exports.removeDoc = function(id) {

    if (!memory.index[id]) throw "ID unknown: "+id;

    var doc = memory.index[id];

    for (var field in doc) {

        doc[field].forEach(token => {

            memory.invertedIndex[token] = memory.invertedIndex[token].filter(ref => ref != id);
            if (memory.invertedIndex[token].length == 0) delete memory.invertedIndex[token];
        });
    }

    delete memory.index[id];
};



exports.getDoc = function(id) {

    return memory.index[id];
}



exports.getRelation = function(id) {

    return memory.index[id].relation;
}



exports.getBacklink = function(id) {

    return memory.invertedIndex[id];
}



exports.find = function(rawOrQuery, rawAndQuery) {

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

    return results;
};



exports.expandRelations = function(results) {

    results.forEach(r => r.relation = exports.getDoc(r.id).relation);

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



exports.memory = memory;