# thinkbot

thinkbot's like a chatbot, except it thinks instead of chatting.

## libraries used

- [eno](https://eno-lang.org/)
- [elasticlunr](http://elasticlunr.com/docs/index.html)

## main idea

eno documents are loaded in ram, and indexed by elasticlunr. whatever they contain, the main loop is:
- make a search,
- process fetched data.

thinkbot should be usable in 2 levels of dev: high level (authoring eno data), low level (creating js modules). thinkbot should be modular, both for data and js.

## eno

### content of eno docs

    # meta

    author:   Zero
    date:     2019/12/16
    keywords: eno test content

    # data

    f1: AverageLink $X f2
    f2: ImplicationLink f3 f4
    f3: AndLink f5 f6
    f4: EvaluationLink boring $X
    f5: AndLink f6 f7
    f6: EvaluationLink young $X
    f7: EvaluationLink beautiful $X

