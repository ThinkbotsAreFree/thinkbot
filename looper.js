


const engines = {}



exports.register = function(filepath, engine, readDoc) {

    var id = filepath.slice(0, -3).replace(/\\/g, '.').replace(/\//g, '.');

    engines[id] = engine;

    readDoc(`
        # data

        type: ObjectType, Engine, ${id}
        input: EngineInput, ${id}, inputFrame
        output: EngineOutput, ${id}, outputFrame
        inputFrame
        outputFrame
    `, filepath.slice(0,-2).replace(/\\/g, '.').replace(/\//g, '.'));
}


