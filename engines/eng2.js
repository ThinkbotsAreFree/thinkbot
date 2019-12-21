


exports.foo = "bar";



exports.observedTags = ["addDoc"];



exports.receive = function(inbox) {

    return "[INBOX]"+JSON.stringify(inbox[0].actor);
}



exports.execute = function(action) {

    console.log("\n=> "+action);
}


