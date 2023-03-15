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
  "# Testing \n### This is a little header\nand we can have baby text under it";

// We presume that tds is passed in sorted!
const Tokenize_prime = (str: string, tds: TokenDescription[]): Tokens => {
  if (str.length === 0) {
    // End of input
    return [];
  }
  const goodMatches = tds
    .map((desc) => {
      return {
        name: desc.name,
        match: str.match(desc.description),
      };
    })
    .filter((val) => val && val.match && val.match.index === 0);
  if (!goodMatches) {
    console.error(`We could not tokenize, error with string '${str}'`);
    return [];
  }
  const optimalMatch = goodMatches[0];
  if (optimalMatch && optimalMatch.match) {
    const best_token: Token = {
      name: optimalMatch.name,
      match: optimalMatch.match[0],
    };
    return [
      best_token,
      ...Tokenize_prime(str.slice(best_token.match.length), tds),
    ];
  }
  throw new Error("Error tokenizing");
};

const Tokenize = (str: string, tds: TokenDescription[]): Tokens => {
  const lastToken: Token = {
    name: "EMPTY",
    match: "",
  };
  const tokens = Tokenize_prime(
    str,
    tds.sort((a, b) => b.precedence - a.precedence)
  );
  tokens.push(lastToken);
  return tokens;
};

const output_tokens = Tokenize(test_str, token_desc_list);
console.log("output tokens", output_tokens);

type GrammarOuput = any;

type GrammarPattern = string[];

type GrammarRule = {
  name: string;
  pattern: GrammarPattern[]; // TODO: Should really be using an abstraction here to be more clear
  callback: (t: Tokens) => GrammarOuput;
};

type Grammar = GrammarRule[];

const rule_names = (g: Grammar): string[] => {
  return g.map((rule) => rule.name);
};

const get_rule = (g: Grammar, r: string): GrammarRule => {
  // FORCING HERE
  return g.find((val) => val.name === r) as GrammarRule;
};

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
    name: "Prog",
    pattern: [
      ["EMPTY"],
      ["Head1", "Prog"],
      ["Head2", "Prog"],
      ["Head3", "Prog"],
      ["STR"],
    ],
    callback: () => {},
  },
];

const LL_pattern = (
  k: number,
  ts: Tokens,
  g: Grammar,
  p: GrammarPattern
): string[] => {
  const ruleNames = rule_names(g);
  const running_matches: string[] = [];
  for (let i = 0; i < k; i++) {
    const tokI = ts[i];
    const patternI = p[i];
    if (!patternI) {
      // We reached the end of the pattern, so return and continue
      return running_matches;
    }
    if (tokI.name === patternI) {
      // This match at point 'i'
      running_matches.push(tokI.name);
    } else if (patternI in ruleNames) {
      // pattern[i] is a separate rule, recurse down to match
      const matched = LL_rule(k - i, ts.slice(i), g, get_rule(g, patternI));
      // Add the matches
      running_matches.push(...matched);
      // add to i the length of the match
      i += matched.length;
    } else {
      throw new Error("No matching pattern in LL_pattern");
    }
  }
  return running_matches;
};

// Similar to LL(k) below, but must satisfy rule 'r' or it throws an error
const LL_rule = (
  k: number,
  ts: Tokens,
  g: Grammar,
  r: GrammarRule
): string[] => {
  for (const pattern of r.pattern) {
    try {
      const patternTry = LL_pattern(k, ts, g, pattern);
      return patternTry;
    } catch (e) {
      console.warn(e);
    }
  }
  throw new Error("No RULE could match in LL_rule");
};

// Parses out with an LL(k) parser and returns updated stream
const LL = (k: number, ts: Tokens, g: Grammar): string[] => {
  if (ts.length === 0) {
    return [];
  }
  debugger;
  console.log(ts);
  for (const rule of g) {
    try {
      const ruleMatch = LL_rule(k, ts, g, rule);
      const rest = LL(k, ts.slice(ruleMatch.length), g);
      ruleMatch.push(...rest);
      return ruleMatch;
    } catch (e) {
      console.warn(e);
    }
  }
  throw new Error("No rule worked");
};

// This is a LL(1) parser,
const Parser = (tokStream: Tokens, langGrammar: Grammar): GrammarOuput => {};

const ll_out = LL(4, output_tokens, gram);
console.log(ll_out);
