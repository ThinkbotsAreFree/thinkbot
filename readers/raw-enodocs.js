

exports.addField = ["keywords"];
    
exports.read = function(enodoc, memory, prefix, newId) {

    var id = newId();

    memory.addDoc(id, {
        id: id,
        keywords: enodoc.section("meta").field("keywords").requiredStringValue(),
        enodoc: enodoc
    });

};
