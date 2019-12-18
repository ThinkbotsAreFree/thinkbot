# thinkbot

thinkbot's like a chatbot, except it thinks instead of chatting.

## libraries used

- [eno](https://eno-lang.org/)
- [lunr](https://github.com/hoelzro/lunr-mutable-indexes)
- [seneca](http://senecajs.org/getting-started/)
- [rivescript](https://www.rivescript.com/docs/tutorial)

## main idea

eno documents are loaded in ram, and indexed by elasticlunr. whatever they contain, the main loop is:
- make a search,
- process fetched data.

thinkbot should be usable in 2 levels of dev: high level (authoring eno data), low level (creating js modules). thinkbot should be modular, both for data and js.

## eno docs

### meta and data sections

the following is a random example of enodoc:

    # meta

    author:   zero
    date:     2019/12/16
    keywords: eno test content

    # data

    f1: ImplicationLink f2 f3
    f2: AndLink f4 f5
    f3: EvaluationLink boring $X
    f4: EvaluationLink young $X
    f5: EvaluationLink beautiful $X

the data lines f1, f2, ...etc. are relations.

a relation has an id, like "f1" or "boring".

a relation is a space-separated list of tokens. tokens can be

- id
- value
- variable

the data section defines a local network of relations between relations. you can consider it's flat lispish, because the first token generally indicates the type of the relation.

variables start with a "$". they represent "named holes" ($ubstitution wildcards), in the relations.

### other sections

there can be other sections, containing other kinds of structured contents.

## instant focus

what's currently in focus is represented by a selection of relations which are considered embedded in a "frame".

frames, like almost everything else, are actually relations: a frame is a (potentially long) list of the ids of relations which are currently in the frame.

frames can stack. a frame can create a new frame on the stack, and manipulate it. it can also execute it, in which case the new frame becomes the current frame, until it terminates itself.

## history

what the system does is recorded in high level format. sequences of actions and events are like seen from the outside. the program is part of the world it observes.

## infinite memory assumption

this is an all-in-ram project, built on the assumption that ram size is infinite. this is because the heart of the system is mainly text-based, and because core data is meant to be hand-crafted, rather than imported from some huge db. although it doesn't mean big db can't be part of modules.


