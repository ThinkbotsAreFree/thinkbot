


var actor = [];



var eQueue = [];



const eTags = [
    "addDoc",
    "addDoc field",
    "addDoc inverted ref",
    "write",
    "read"
];



const
    tagMailingList = {},
    inbox = {};



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

    for (var i in savedInbox) handler(i, savedInbox[i]);
};



exports.clean = function() {

    eQueue = [];
    inbox = {};
}



// testing purpose

exports.eQueue = eQueue;