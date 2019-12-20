


const
    fs =     require('fs'),
    path =   require("path"),
    graph =  require("./graph.js"),
    search = require("./search.js"),
    newId =  require("./id-gen.js"),
    looper = require("./looper.js");
    
// https://eno-lang.org/enolib/javascript/parsing-a-document/
const enolib = require('enolib');
const {
    boolean,
    //color,
    commaSeparated,
    //date,
    //datetime,
    //email,
    //float,
    //integer,
    //json,
    //latLng,
    //url
} = require('enotype');
enolib.register({ boolean, commaSeparated });

// https://github.com/steveukx/readdir.js/
const readDir = require("readdir");



// file paths
const
    DATA_PATH =    "data",
    READERS_PATH = "readers",
    ENGINES_PATH = "engines";

// list of enodoc readers
const readers = [];

// switchable log
const log = 1 ? console.log : ()=>{};



// require everything in readers/ folder

var filesArray = readDir.readSync(path.join(__dirname, READERS_PATH), ["**.js"]);

filesArray.forEach(filename => {

    log("[readers]", filename);
    readers.push(
        require(path.join(__dirname, READERS_PATH, filename))
    );
});

function readDoc(enodoc, prefix) {

    prefix = prefix || newId()+'.';

    if (typeof enodoc == "string") enodoc = enolib.parse(enodoc);

    readers.forEach(reader => {
        reader.read(enodoc, search, graph, prefix, newId);
    });
}



// read every enothing in data/ folder

filesArray = readDir.readSync(path.join(__dirname, DATA_PATH), ["**.eno"]);

filesArray.forEach(filename => {

    log("[data]", filename);

    var prefix = path.join(filename.slice(0, -3));
    prefix = prefix.replace(/\\/g, '.').replace(/\//g, '.');
    
    var input = fs.readFileSync(path.join(__dirname, DATA_PATH, filename), "utf-8");
    
    var enodoc = enolib.parse(input, {
        source: path.join(__dirname, DATA_PATH)
    });

    readDoc(enodoc, prefix);
});



// load everything in engines/ folder

var filesArray = readDir.readSync(path.join(__dirname, ENGINES_PATH), ["**.js"]);

filesArray.forEach(filename => {

    log("[engines]", filename);
    looper.register(
        path.join(filename),
        require(path.join(__dirname, ENGINES_PATH, filename)),
        readDoc
    );
});



/* **** */



log("[search.memory.index]", search.memory.index);
//log(search.memory.invertedIndex);

log(
    "[EngineOutput of eng2]",
    search.getDoc(
        search.find([], ["eng2", "EngineOutput"])[0].id
    ).relation[2]
);


