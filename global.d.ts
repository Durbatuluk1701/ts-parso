type Token = {
  name: string;
  match: string;
};

type Tokens = Token[];

interface TokenDescription {
  name: string;
  description: RegExp;
  precedence: number;
}

type GrammarOuput = any;

type GrammarPattern = string[];

type GrammarRule = {
  name: string;
  pattern: GrammarPattern[]; // TODO: Should really be using an abstraction here to be more clear
  callback: (args: any) => GrammarOuput;
};

type RuleMatch = {
  rule: GrammarRule;
  name: string;
  match: (RuleMatch | Token)[];
};

type Grammar = GrammarRule[];
