

exports.addField = ["relation"];
    
exports.read = function(enodoc, index, prefix, newId) {

    var data = enodoc.section("data");

    var table = {};

    data.elements().forEach(relation => {

        table[relation.stringKey()] = { id: prefix+relation.stringKey() };
    });

    for (var sk in table) {

        table[sk].relation = data.field(sk).optionalStringValue().split(' ');

        for (var r=0; r<table[sk].relation.length; r++) {

            if (table[table[sk].relation[r]])
                table[sk].relation[r] = table[table[sk].relation[r]].id;
        }

        table[sk].relation = table[sk].relation.join(' ');

        index.addDoc(table[sk]);
    }
};
