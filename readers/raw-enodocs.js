

exports.addField = ["keywords"];
    
exports.read = function(enodoc, memory, prefix, newId) {

    memory.addDoc({
        id: newId(),
        keywords: enodoc.section("meta").field("keywords").requiredStringValue(),
        enodoc: enodoc
    });
};
