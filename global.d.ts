type Token = {
  type: "Token";
  name: string;
  match: string;
};

type Tokens = Token[];

interface TokenDescription {
  name: string;
  description: RegExp;
  precedence: number;
}

// type GrammarOuput = any;

type GrammarPattern = string[];

type GrammarRule<T> = {
  type: "Rule";
  name: string;
  pattern: GrammarPattern[]; // TODO: Should really be using an abstraction here to be more clear
  callback: (r: RuleMatch) => T;
};

type RuleMatch<T> = {
  rule: GrammarRule<T> | Token;
  match: RuleMatch<T>[];
};

type Grammar<T> = GrammarRule<T>[];
