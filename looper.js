module.exports = function(observer, search) {



    var module = {};



    const engines = {};



    function connectObserver(engineId, eventTags) {
        
        observer.observe(eventTags, engineId);

        eventTags.forEach(tag => { search.link(["ObserverSubscription", engineId, tag]); });
    }



    module.register = function(filepath, engine, readDoc) {

        var id = filepath.slice(0, -3).replace(/\\/g, '.').replace(/\//g, '.');

        if (engine.observedTags) connectObserver(id, engine.observedTags);

        engines[id] = engine;

        search.link(["core.ObjectType", id, "core.Engine"]);
    };



    module.step = function() {

        var actions = {};

        observer.dispatch(function(engId, inbox) {

            if (engines[engId].receive) actions[engId] = engines[engId].receive(inbox);
        });

        for (var engId in actions) engines[engId].execute(actions[engId]);
    };



    return module;
}