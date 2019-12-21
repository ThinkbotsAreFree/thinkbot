


var foo = "bar";



exports.observedTags = ["addDoc"];



exports.prepare = function(inbox, search, graph) {

    return "[INBOX]"+JSON.stringify(inbox);
}



exports.execute = function(action, id, actionList) {

    console.log("\n"+foo+" => "+action);
}


