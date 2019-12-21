


exports.foo = "bar";



exports.observedTags = ["addDoc"];



exports.prepare = function(inbox, search, graph) {

    return "[INBOX]"+JSON.stringify(inbox[0].actor);
}



exports.execute = function(action, id, actionList) {

    console.log("\n=> ",actionList);
}


