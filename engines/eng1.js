


var foo = "bar";



exports.observedTags = ["addDoc"];



exports.receive = function(inbox) {

    return "[INBOX]"+JSON.stringify(inbox);
}



exports.execute = function(action) {

    console.log("\n"+foo+" => "+action);
}


