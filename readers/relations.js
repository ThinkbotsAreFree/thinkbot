

exports.addField = ["relation"];
    
exports.read = function(enodoc, memory, prefix, newId) {

    // the data section contains relations
    var data = enodoc.section("data");

    var table = {};

    data.elements().forEach(relation => {

        // assign in-db ids based on prefix
        table[relation.stringKey()] = { id: prefix+relation.stringKey() };
    });

    for (var sk in table) {

        table[sk].relation = data.field(sk).optionalStringValue().split(' ');

        // rewriting local ids
        for (var r=0; r<table[sk].relation.length; r++) {

            if (table[table[sk].relation[r]])
                table[sk].relation[r] = table[table[sk].relation[r]].id;
        }

        table[sk].relation = table[sk].relation.join(' ');

        memory.addDoc(table[sk]);
    }
};


