

const
    fs =     require('fs'),
    path =   require("path"),
    graph =  require("./graph.js"),
    search = require("./search.js"),
    newId =  require("./id-gen.js");
    
// https://eno-lang.org/enolib/javascript/parsing-a-document/
const enolib = require('enolib');
const { boolean, color, commaSeparated, date, datetime, email, float, integer, json, latLng, url } =
    require('enotype');
enolib.register({ commaSeparated });

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



// require everything in readers/ folder

var filesArray = readDir.readSync(path.join(__dirname, READERS_PATH), ["**.js"]);

filesArray.forEach(filename => {

    log("requiring", filename);
    readers.push(
        require(path.join(__dirname, READERS_PATH, filename))
    );
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

    log(enodoc.toString());

    readers.forEach(reader => {

        reader.read(enodoc, search, prefix, newId);
    });
});


log("[SEARCH.MEMORY]");
log(search.memory);

res = search.find(["ImplicationLink", "module1.f2"]);

log("[RES]");
log(res);

log("[EXPANDRELATIONS]");
log(search.expandRelations(res));


/*
graph.setLine(["one", "*", "three"], "myFruit1");
graph.setLine(["one", "two"], "myFruit2");
graph.setLine(["one", "*"], "myFruit3");
graph.setLine(["*", "three"], "myFruit4");


graph.removeLine(["one", "two"]);


var test = ["foo", "two", "three"];
log(graph.queryLine(test));
log(test);
*/


