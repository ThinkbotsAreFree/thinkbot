

const
    fs =   require('fs'),
    path = require("path");

// https://lunrjs.com/
const lunr = require("lunr");

// https://eno-lang.org/enolib/javascript/parsing-a-document/
const enolib = require('enolib');

// https://github.com/aichaos/rivescript-js
const Rivescript = require("rivescript");

// http://senecajs.org/
const Seneca = require('seneca');

// https://github.com/steveukx/readdir.js/
const readDir = require("readdir");



// file paths
const
    DATA_PATH =    "data",
    READERS_PATH = "readers";

// list of enodoc readers
const readers = [];

// log
const log = console.log;

// id generator
newId = (function(){
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



// require everything in readers/ folder

var filesArray = readDir.readSync(path.join(__dirname, READERS_PATH), ["**.js"]);

filesArray.forEach(filename => {

    log("requiring", filename);
    readers.push(
        require(path.join(__dirname, READERS_PATH, filename))
    );
});



// prepare main memory

var fields = [];

readers.forEach(reader => {
    reader.addField.forEach(field => {
        if (!fields.includes(field)) {
            log("field", field);
            fields.push(field);
        }
    });
});

var memory = {
    docs: {},
    addDoc: function addDoc(doc) { memory.docs[doc.id] = doc; },
    removeDoc: function removeDoc(doc) { delete memory.docs[doc.id]; },
    updateDoc: function updateDoc(doc) { memory.docs[doc.id] = doc; },
    fetchDoc: function fetchDoc(query, option) {
        return memory.index.search(query, option || {}).map(r => { return {
            id: memory.docs[r.ref].id,
            relation: memory.docs[r.ref].relation,
            score: r.score
        }});
    },
    chat: new Rivescript({ utf8: true })
};



// load rivescript brains

filesArray = readDir.readSync(path.join(__dirname, DATA_PATH), ["**.rive"]);

filesArray.forEach(filename => {

    memory.chat.loadFile(path.join(DATA_PATH, filename)).then(function() {
        memory.chat.sortReplies();
        memory.me = 'me';
    });
});



// read every enothing in data/ folder

filesArray = readDir.readSync(path.join(__dirname, DATA_PATH), ["**.eno"]);

filesArray.forEach(filename => {

    log("importing", filename);

    var prefix = path.join(filename.slice(0, -3));
    prefix = prefix.replace(/\\/g, '.').replace(/\//g, '.');
    
    var input = fs.readFileSync(path.join(__dirname, DATA_PATH, filename), "utf-8");
    
    var enodoc = enolib.parse(input, {
        source: path.join(__dirname, DATA_PATH)
    });

    readers.forEach(reader => {

        reader.read(enodoc, memory, prefix, newId);
    });
});



// create lunr index

memory.index = lunr(function() {

    this.ref("id");
    fields.forEach(f => { this.field(f); });
    Object.keys(memory.docs).forEach(function(docId) {
        log("adding "+docId);
        this.add(memory.docs[docId]);
    }, this);
});






function overview(results) {

    var ref = {};
    results.forEach(result => { ref[result.id] = result; });

    results.forEach(result => {

        var takenTokens = [];
        var tokenCount = -1;
        result.expandedScore = result.score;
            
        while (tokenCount != takenTokens.length) {

            tokenCount = takenTokens.length;

            result.relation = result.relation.split(' ');

            result.expandedRelation = result.relation.map(token => {

                if (ref[token]) {
                    if (!takenTokens.includes(token)) {
                        takenTokens.push(token);
                        result.expandedScore += ref[token].score;
                    }
                    return ref[token].relation;
                }
                else
                    return token;
            }).join(' ');

            result.relation = result.expandedRelation;
        }
    });

    return results;
}



// seneca

var seneca = Seneca().quiet();

var filesArray = readDir.readSync(path.join(__dirname, DATA_PATH), ["**.js"]);

filesArray.forEach(filename => {

    log("plugin "+filename);
    seneca.use(path.join(__dirname, DATA_PATH, filename));
});



log(overview(memory.fetchDoc("ImplicationLink EvaluationLink AndLink")));

setTimeout(function() {

    memory.chat.reply(memory.chat.me, "hello").then(function(reply) {
        log("The bot says: " + reply);
    });

    seneca.act({say:'hello',foo:"bar"}, function(err,res) {
        console.log(res);
    });

}, 1000);

