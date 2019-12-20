


var actor = '';



var gQueue = [],    // global
    tagQueue = {};  // specific



const eTags = [
    "addDoc",
    "addDoc field",
    "addDoc inverted ref",
    "write",
    "read"
];



exports.setActor = function(name) {

    actor = name.toString();
};



exports.signal = function(eventTags, eventDescription) {

    eventTags.forEach(tag => { if (!eTags.includes(tag)) throw "Unknown tag: "+tag; });

    evObject = {
        time: (new Date()).getTime(),
        actor: actor,
        tags: eventTags.slice(0),
        description: JSON.parse(JSON.stringify(eventDescription))
    };

    gQueue.push(evObject);

    eventTags.forEach(tag => {

        if (!tagQueue[tag]) tagQueue[tag] = [];
        tagQueue[tag].push(evObject);
    });
}



exports.clean = function() {

    gQueue = [];
    tagQueue = {};
}



// testing purpose

exports.gQueue = gQueue;