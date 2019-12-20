


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

// fancy log
const color = {
    Reset: "\x1b[0m",
    Bright: "\x1b[1m",
    Dim: "\x1b[2m",
    Underscore: "\x1b[4m",
    Blink: "\x1b[5m",
    Reverse: "\x1b[7m",
    Hidden: "\x1b[8m",

    FgBlack: "\x1b[30m",
    FgRed: "\x1b[31m",
    FgGreen: "\x1b[32m",
    FgYellow: "\x1b[33m",
    FgBlue: "\x1b[34m",
    FgMagenta: "\x1b[35m",
    FgCyan: "\x1b[36m",
    FgWhite: "\x1b[37m",

    BgBlack: "\x1b[40m",
    BgRed: "\x1b[41m",
    BgGreen: "\x1b[42m",
    BgYellow: "\x1b[43m",
    BgBlue: "\x1b[44m",
    BgMagenta: "\x1b[45m",
    BgCyan: "\x1b[46m",
    BgWhite: "\x1b[47m"
};
const log = 1 ?
function() {
    console.log.apply(
        null,
        [color.Bright, color.FgBlue, arguments[0], color.Reset, Array.from(arguments).slice(1)].flat()
    );
} : ()=>{};



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

log(
    "[backward]",
    search.exploreBackward(
        search.find([], ["Engine"]).map(r => r.id)
    )
);

