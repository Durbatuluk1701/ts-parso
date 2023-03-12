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

type GrammarPattern = string | string[] | GrammarPattern[];

type GrammarRule = {
  name: string;
  pattern: GrammarPattern; // TODO: Should really be using an abstraction here to be more clear
  callback: (t: Tokens) => GrammarOuput;
};

const pat: GrammarPattern = [[["H1", "H2", "H3"], "Prog"], "EMPTY"];

type Grammar = GrammarRule[];

const rule_names = (g: Grammar): string[] => {
  return g.map((rule) => rule.name);
};

const gram: Grammar = [
  {
    name: "Head1",
    pattern: ["H1", "STR", "BR"],
    callback: () => {},
  },
  {
    name: "Head2",
    pattern: ["H2", "STR", "BR"],
    callback: () => {},
  },
  {
    name: "Head3",
    pattern: ["H3", "STR", "BR"],
    callback: () => {},
  },
  {
    name: "Prog",
    pattern: [[["H1", "H2", "H3"], "Prog"], "EMPTY"],
    callback: () => {},
  },
];

// Similar to LL(k) below, but must satisfy rule 'r' or it throws an error
const LL_rule = (
  k: number,
  ts: Tokens,
  g: Grammar,
  r: GrammarRule
): string[] => {
  const ruleNames = rule_names(g);
  const runningMatches = [];
  for (let i = 0; i < k; i++) {
    const tokI = ts[i];
    const patternI = r.pattern[i];
    if (tokI.name === patternI) {
      // Token matched
      runningMatches.push(tokI.name);
    } else if (patternI in ruleNames) {
      // We need to recurse into it as it is a Grammar Rule
      const recCall = LL(k, ts.slice(i), g); // We slice to get all past where we currently are
      runningMatches.push(...recCall.flat());
    } else {
      // Error, this is neither a Token or a Grammar Rule
      throw new Error(
        `Error, '${patternI}' is neither a Token or a Grammer Rule`
      );
    }
  }
  return runningMatches;
};

// Parses out with an LL(k) parser and returns updated stream
const LL = (k: number, ts: Tokens, g: Grammar): string[] => {
  if (ts.length === 0) {
    console.log("End of tokens");
    return [];
  }
  const ruleNames = rule_names(g);
  const firstK_Rules = g.map((r) => r.pattern.slice(0, k));
  firstK_Rules.forEach((pattern) => {
    console.log("k rules", pattern);
    const running_matches: string[] = [];
    for (let i = 0; i < k; i++) {
      const tokI = ts[i];
      const patternI = pattern[i];
      console.log("pattern", patternI, "\nTokenName:", tokI.name);
      if (!patternI) {
        // This occurs when 'k' is longer than the pattern length
        return running_matches;
      }
      if (tokI.name === patternI) {
        // Token matched
        running_matches.push(tokI.name);
      } else if (patternI in ruleNames) {
        // We need to recurse into it as it is a Grammar Rule
        const rule = g.find((val) => val.name === patternI);
        if (rule) {
          // This is guaranteed!
          const recCall = LL_rule(k, ts.slice(i), g, rule); // We slice to get all past where we currently are
          running_matches.push(...recCall.flat());
        }
      } else {
        // Error, this is neither a Token or a Grammar Rule
        // throw new Error(
        //   `Error, '${patternI}' is neither a Token or a Grammer Rule`
        // );
        break;
      }
    }
    // If we get through the whole loop, then we are good to return
    return running_matches;
  });
  // Could not match any rule
  console.error("Could not match any rule");
  return [];
};

// This is a LL(1) parser,
const Parser = (tokStream: Tokens, langGrammar: Grammar): GrammarOuput => {};

const ll_out = LL(4, output_tokens, gram);
console.log(ll_out);
