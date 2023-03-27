import { Tokenize } from "./Tokenizer";
import { Parser } from "./Parser";

const token_desc_list: TokenDescription[] = [
  {
    name: "HASH",
    description: /#/,
    precedence: 12,
  },
  {
    name: "STAR",
    description: /\*/,
    precedence: 13,
  },
  {
    name: "STR",
    description: /[^*#\n]+/,
    precedence: 0,
  },
  {
    name: "BR",
    description: /\n/,
    precedence: 10,
  },
];

const test_str =
  "# Testing \n### This is a little header\nand we can **have baby** text under it\nmore *text* can be adding, how it will be parsed\nI am not quite sure";
const output_tokens = Tokenize(test_str, token_desc_list);
debugger;
console.log("output tokens", output_tokens);

const gram: Grammar = [
  {
    name: "Head1",
    pattern: [["HASH", "STR", "BR"]],
    callback: () => {},
  },
  {
    name: "Head2",
    pattern: [["HASH", "HASH", "STR", "BR"]],
    callback: () => {},
  },
  {
    name: "Head3",
    pattern: [["HASH", "HASH", "HASH", "STR", "BR"]],
    callback: () => {},
  },
  {
    name: "Bold",
    pattern: [["STAR", "STAR", "STR", "STAR", "STAR"]],
    callback: () => {},
  },
  {
    name: "Italic",
    pattern: [["STAR", "STR", "STAR"]],
    callback: () => {},
  },
  {
    name: "Text",
    pattern: [
      ["STR", "Text"],
      ["BR", "Text"],
      ["Italic", "Text"],
      ["Bold", "Text"],
      ["EMPTY"],
    ],
    callback: () => {},
  },
  {
    name: "Prog",
    pattern: [
      ["EMPTY"],
      ["Head1", "Prog"],
      ["Head2", "Prog"],
      ["Head3", "Prog"],
      ["Text", "Prog"],
    ],
    callback: () => {},
  },
];

const progRule = gram.find((val) => val.name === "Prog");

const parseOut = progRule ? Parser(1, output_tokens, gram, progRule) : "";

console.log(JSON.stringify(parseOut));
