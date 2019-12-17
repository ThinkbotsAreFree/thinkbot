

const
    fs =   require('fs'),
    path = require("path");

// http://elasticlunr.com/docs/index.html
const elasticlunr = require("elasticlunr");

// https://eno-lang.org/enolib/javascript/parsing-a-document/
const enolib = require('enolib');

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



// requiring everything in readers/ folder

var filesArray = readDir.readSync(path.join(__dirname, READERS_PATH), ["**.js"]);

filesArray.forEach(filename => {

    log("requiring", filename);
    readers.push(
        require(path.join(__dirname, READERS_PATH, filename))
    );
});



// prepare main memory

var index = elasticlunr();
elasticlunr.clearStopWords();

index.setRef('id');

readers.forEach(reader => {

    reader.addField.forEach(field => {

        log("field", field);
        index.addField(field);
    });
});



// read everything in data/ folder

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

        reader.read(enodoc, index, prefix, newId);
    });
});



// test
log(index.search("EvaluationLink", {}));

