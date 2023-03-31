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
    name: "UNDER",
    description: /_/,
    precedence: 13,
  },
  {
    name: "GT",
    description: />/,
    precedence: 13,
  },
  {
    name: "TAB",
    description: /\t/,
    precedence: 10,
  },
  {
    name: "BACKTICK",
    description: /`/,
    precedence: 13,
  },
  {
    name: "NUM_DOT",
    description: /\d+./,
    precedence: 13,
  },
  {
    name: "DASH",
    description: /-/,
    precedence: 13,
  },
  {
    name: "LBRACKET",
    description: /\[/,
    precedence: 13,
  },
  {
    name: "RBRACKET",
    description: /\]/,
    precedence: 13,
  },
  {
    name: "LPAREN",
    description: /\(/,
    precedence: 13,
  },
  {
    name: "RPAREN",
    description: /\)/,
    precedence: 13,
  },
  {
    name: "STR",
    description: /[^*_`\n\[\]\(\)]+/,
    precedence: 0,
  },
  {
    name: "BR",
    description: /\n/,
    precedence: 10,
  },
];

const test_str =
  "# Testing \n### This is a little header\nand we can **have baby** text under it\nmore *text* can be adding, how it will be parsed\nI am not quite sure.\n\nLet us see _how_ this works, __this would be bold I think__.\n Now we see that # hashes midway should be preserved.\n> Can we do blockquotes?\n>> How about nested ones\n1. This is some stuff\n2. More stuff\n3. Again another list item\n- Now lets try for an unordered list\n- Can we do it?\n\t- Indented list?!\n\t- Im not sure.\nNow, lets try code inside here `hello my code stuff`\n---\nA horizontal rule might be nice\nHere is a link [Duck Duck Go](https://duckduckgo.com).\n";
const output_tokens = Tokenize(test_str, token_desc_list);
debugger;
console.log("output tokens", output_tokens);

const gram: Grammar = [
  {
    name: "HorizontalRule",
    pattern: [["DASH", "DASH", "DASH"]],
    callback: () => {},
  },
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
    name: "Indent",
    pattern: [["TAB"]],
    callback: () => {},
  },
  {
    name: "BlockQuote",
    pattern: [["GT", "Prog"]],
    callback: () => {},
  },
  {
    name: "OrderedListElem",
    pattern: [["NUM_DOT", "STR", "BR"]],
    callback: () => {},
  },
  {
    name: "UnorderedListElem",
    pattern: [["DASH", "STR", "BR"]],
    callback: () => {},
  },
  {
    name: "BlockQuote",
    pattern: [["GT", "Prog"]],
    callback: () => {},
  },
  {
    name: "Bold",
    pattern: [
      ["STAR", "STAR", "STR", "STAR", "STAR"],
      ["UNDER", "UNDER", "STR", "UNDER", "UNDER"],
    ],
    callback: () => {},
  },
  {
    name: "Code",
    pattern: [["BACKTICK", "STR", "BACKTICK"]],
    callback: () => {},
  },
  {
    name: "Link",
    pattern: [["LBRACKET", "STR", "RBRACKET", "LPAREN", "STR", "RPAREN"]],
    callback: () => {},
  },
  {
    name: "Italic",
    pattern: [
      ["STAR", "STR", "STAR"],
      ["UNDER", "STR", "UNDER"],
    ],
    callback: () => {},
  },
  {
    name: "Text",
    pattern: [
      ["STR", "Text"],
      ["BR", "Text"],
      ["Italic", "Text"],
      ["Bold", "Text"],
      ["Code", "Text"],
      ["Link", "Text"],
      ["EMPTY"],
    ],
    callback: () => {},
  },
  {
    name: "Prog",
    pattern: [
      ["EMPTY"],
      ["HorizontalRule", "Prog"],
      ["Head1", "Prog"],
      ["Head2", "Prog"],
      ["Head3", "Prog"],
      ["Indent", "Prog"],
      ["BlockQuote", "Prog"],
      ["OrderedListElem", "Prog"],
      ["UnorderedListElem", "Prog"],
      ["Text", "Prog"],
    ],
    callback: () => {},
  },
];

const progRule = gram.find((val) => val.name === "Prog");

const parseOut = progRule ? Parser(1, output_tokens, gram, progRule) : "";

console.log(JSON.stringify(parseOut));
