"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharTokenizer = exports.Tokenizer = void 0;
const token_splitter = (strList, separators) => {
    return separators.reduce((prevVal, currentSep) => {
        return prevVal.reduce((acc, str) => acc.concat(str.split(currentSep)), []);
    }, strList);
};
const Tokenizer = (str, separators) => {
    return token_splitter([str], separators);
};
exports.Tokenizer = Tokenizer;
const CharTokenizer = (str) => (0, exports.Tokenizer)(str, [""]);
exports.CharTokenizer = CharTokenizer;
