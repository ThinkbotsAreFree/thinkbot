


var actor = [];



var eQueue = [],
    inbox = {};



const eTags = [

    "write",
    "read",

    "search",
        "addDoc",
        "addDoc field",
        "addDoc inverted ref",
        "removeDoc",
        "removeDoc field",
        "removeDoc inverted ref",
        "getDoc",
        "getRelation",
        "getBacklink",
        "find",
        "exploreForward",
        "exploreBackward",
        "neighborhood",

    "graph",
        "setLine",
        "removeLine",
        "queryLine"
];



const
    tagMailingList = {};



exports.pushActor = function(name) {

    actor.push(name.toString());
};



exports.popActor = function() {

    actor.pop();
};



exports.signal = function(eventTags, eventDescription) {

    evObject = {
        time: (new Date()).getTime(),
        actor: actor.slice(0),
        tags: eventTags.slice(0),
        description: JSON.parse(JSON.stringify(eventDescription))
    };

    eQueue.push(evObject);

    eventTags.forEach(tag => {
        
        if (!eTags.includes(tag)) throw "Unknown tag: "+tag;

        if (tagMailingList[tag]) tagMailingList[tag].forEach(engineId => {

            if (!inbox[engineId]) inbox[engineId] = [];
            inbox[engineId].push(evObject);
        });
    });
}



exports.observe = function(eventTags, engineId) {

    eventTags.forEach(tag => {

        if (!tagMailingList[tag]) tagMailingList[tag] = [];
        tagMailingList[tag].push(engineId);
    });  
}



exports.ignore = function(eventTags, engineId) {

    eventTags.forEach(tag => {

        if (!tagMailingList[tag]) throw "Ignore non-observed tag: "+tag;
        tagMailingList[tag] = tagMailingList[tag].filter(id => id != engineId);
    });  
}



exports.dispatch = function(handler) {

    var savedInbox = inbox;
    exports.clean();

    for (var engId in savedInbox) handler(engId, savedInbox[engId]);
};



exports.clean = function() {

    eQueue = [];
    inbox = {};
}



// testing purpose

exports.eQueue = eQueue;