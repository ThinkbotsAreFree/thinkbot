# thinkbot!

thinkbot's like a chatbot, except it thinks instead of chatting.

## running it

for now, you'd just
- download the zip
- type "npm install"
- type "node main"

## files & folders

there's a `data/` folder and a `readers/` folder.

the `data/` folder contains eno documents, while `readers/` contains javascript modules that are called to load eno docs in memory, when program starts.

## readers

here is a minimal reader example:

```javascript
exports.addField = ["keywords"];
    
exports.read = function(enodoc, index, prefix, newId) {

    index.addDoc({
        id: newId(),
        keywords: enodoc.section("meta").field("keywords").requiredStringValue(),
        enodoc: enodoc
    });
};
```

fields specified in `addField` will be added as searchable by elasticlunr. the `read` function will be called against each enodoc found in the `data/` folder, with the following arguments:

- `enodoc` is the current enodoc
- `index` is the elasticlunr index
- `prefix` is an id-prefix for creating filename-related ids
- `newId` is a function that returns an unused id

here is another example, which loads relations. this one uses prefix to create ids:

```javascript
exports.addField = ["relation"];
    
exports.read = function(enodoc, index, prefix, newId) {

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

        index.addDoc(table[sk]);
    }
};
```
