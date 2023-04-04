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
  callback: (r: RuleMatch<T>, context?: any) => T;
};

type RuleMatch<T> = {
  type: "Rule";
  name: string;
  callback: (context?: any) => T;
  match: Match<T>[];
};

type TokenMatch<T> = {
  type: "Token";
  name: string;
  match: string;
};

type Match<T> = RuleMatch<T> | TokenMatch<T>;
// {
//   // rule: GrammarRule<T> | Token;
//   type: "Rule" | "Token";
//   name: string;
//   callback: (context?: any) => T;
//   match: RuleMatch<T>[] | string;
// };

type Grammar<T> = GrammarRule<T>[];
