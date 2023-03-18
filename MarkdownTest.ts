import { Tokenize } from "./Tokenizer";
import { Parser } from "./Parser";

const token_desc_list: TokenDescription[] = [
  {
    name: "H3",
    description: /###/,
    precedence: 12,
  },
  {
    name: "H2",
    description: /##/,
    precedence: 11,
  },
  {
    name: "H1",
    description: /#/,
    precedence: 10,
  },
  {
    name: "STR",
    description: /.+/,
    precedence: 0,
  },
  {
    name: "BR",
    description: /\n/,
    precedence: 10,
  },
];

const test_str =
  "# Testing \n### This is a little header\nand we can have baby text under it\nmore text can be adding, how it will be parsed\nI am not quite sure";

const output_tokens = Tokenize(test_str, token_desc_list);
console.log("output tokens", output_tokens);

const gram: Grammar = [
  {
    name: "Head1",
    pattern: [["H1", "STR", "BR"]],
    callback: () => {},
  },
  {
    name: "Head2",
    pattern: [["H2", "STR", "BR"]],
    callback: () => {},
  },
  {
    name: "Head3",
    pattern: [["H3", "STR", "BR"]],
    callback: () => {},
  },
  {
    name: "Text",
    pattern: [["STR", "Text"], ["BR", "Text"], ["EMPTY"]],
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
