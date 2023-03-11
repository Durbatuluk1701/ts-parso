"use strict";
const CharTokenizer = (str) => {
    return str.split("");
};
const word_splitter = (strList, separators) => {
    return separators.reduce((prevVal, currentSep) => {
        return prevVal.reduce((acc, str) => acc.concat(str.split(currentSep)).filter((val) => val.trim() !== ""), []);
    }, strList);
};
const WordTokenizer = (str, separators) => {
    const splits = separators !== null && separators !== void 0 ? separators : [/\W/];
    return word_splitter([str], splits);
};
