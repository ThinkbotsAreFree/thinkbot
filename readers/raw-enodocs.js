

exports.addField = ["keywords"];
    
exports.read = function(enodoc, index, newId) {

    index.addDoc({
        id: newId(),
        keywords: enodoc.section("meta").field("keywords").requiredStringValue(),
        enodoc: enodoc
    });
};
