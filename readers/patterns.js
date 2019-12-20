

exports.addField = ["relation"];
    
exports.read = function(enodoc, search, graph, prefix, newId) {

    // the graph section contains patterns
    var pattern = enodoc.section("graph");

    if (!pattern) return;

    pattern.elements().forEach(io => {

        graph.setLine(
            io.toFieldset().entry('i').requiredCommaSeparatedValue(),
            io.toFieldset().entry('o').requiredCommaSeparatedValue(),
        );
    });

};


