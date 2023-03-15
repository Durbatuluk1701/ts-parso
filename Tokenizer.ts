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
  "# Testing \n### This is a little header\nand we can have baby text under it\nmore text can be adding, how it will be parsed\nI am not quite sure";

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
  // const lastToken: Token = {
  //   name: "EMPTY",
  //   match: "",
  // };
  const tokens = Tokenize_prime(
    str,
    tds.sort((a, b) => b.precedence - a.precedence)
  );
  // tokens.push(lastToken);
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

type RuleMatch = {
  rule: GrammarRule;
  name: string;
  match: (RuleMatch | Token)[];
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

const shift_n = (arr: any[], n: number): void => {
  for (let i = 0; i < n; i++) {
    arr.shift();
  }
};

const LL_pattern = (
  k: number,
  ts: Tokens,
  g: Grammar,
  r: GrammarRule,
  p: GrammarPattern,
  final: boolean
): [RuleMatch, number] => {
  /** We are attempting to force match pattern "p" with tokens "ts"
      We have to match "k" tokens, and then if they all match, 
      consume the rest of the pattern.
      
      If we finish our match before "k" tokens, 
      then we can fully consume that as the pattern is applicable

      If we have matched as we reach "k" tokens, 
      then continue going. (If we fail later, the grammar is not LL(k)
      which will not be our fault)
  */

  const ruleNames = rule_names(g);
  const running_rule: RuleMatch = {
    rule: r,
    name: `${r.name} - Pattern: ${p}`,
    match: [],
  };

  // Checking the first "k" tokens
  let patternInd = 0;
  let tokenInd = 0;
  for (; tokenInd < k && patternInd < p.length; patternInd++) {
    const tokI = ts[tokenInd];
    const patternI = p[patternInd];
    if (patternI === "EMPTY") {
      return [running_rule, 0];
    }
    if (tokI.name === patternI) {
      // This match at point 'i'
      running_rule.match.push(tokI);
      tokenInd++;
    } else if (ruleNames.includes(patternI)) {
      // pattern[i] is a separate rule, recurse down to match - FIRST CASE

      // If our pattern is the last in the list, it should consume all
      const consumeAll = final && patternInd === p.length - 1;
      const patRule = get_rule(g, patternI);

      const [matched, matchedInd] = LL_rule(
        k - tokenInd,
        ts.slice(tokenInd),
        g,
        patRule,
        consumeAll
      );
      // Add the matches
      running_rule.match.push(matched);
      // add to i the length of the match
      // TODO: Check spec?
      tokenInd += matchedInd;
    } else {
      throw new Error("No matching pattern in LL_pattern");
    }
  }

  // After this point, we have satisfied our
  // "k" token lookahead, parse the rest of the pattern and continue

  // Checking the first "k" tokens
  for (; patternInd < p.length && tokenInd < ts.length; patternInd++) {
    const tokI = ts[tokenInd];
    const patternI = p[patternInd];
    if (patternI === "EMPTY") {
      return [running_rule, 0];
    }
    if (tokI.name === patternI) {
      // This match at point 'i'
      running_rule.match.push(tokI);
      tokenInd++;
    } else if (ruleNames.includes(patternI)) {
      // pattern[i] is a separate rule, recurse down to match
      // If our pattern is the last in the list, it should consume all
      const consumeAll = final && patternInd === p.length - 1;
      const patRule = get_rule(g, patternI);

      const [matched, matchedInd] = LL_rule(
        k,
        ts.slice(tokenInd),
        g,
        patRule,
        consumeAll
      );
      // Add the matches
      running_rule.match.push(matched);

      tokenInd += matchedInd;
    } else {
      throw new Error("No matching pattern in LL_pattern");
    }
  }

  // We have consumed all the way we need to
  return [running_rule, tokenInd];
};

// Similar to LL(k) below, but must satisfy rule 'r' or it throws an error
const LL_rule = (
  k: number,
  ts: Tokens,
  g: Grammar,
  r: GrammarRule,
  final: boolean
): [RuleMatch, number] => {
  const running_errors: any[] = [];
  // While we still have tokens to consume, try the rules patterns
  for (const pattern of r.pattern) {
    // For each possible pattern
    try {
      // Try to apply that pattern,
      const [patternTry, ind] = LL_pattern(k, ts, g, r, pattern, final);
      // If we have validly reached this point,
      // the entire pattern has been consumed!

      if (final && ind < ts.length) {
        // If this is supposed to consume all, but it didnt
        continue;
        // This cannot be the pattern, so continue
      }
      return [patternTry, ind];
    } catch (e) {
      running_errors.push(e);
    }
  }
  throw new Error(`Rule did not match: ${running_errors}`);
};

// This is a LL(1) parser,
const Parser = (tokStream: Tokens, langGrammar: Grammar): GrammarOuput => {};
debugger;
const [ll_out, ind] = LL_rule(
  4,
  output_tokens,
  gram,
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
  true
);

console.log(JSON.stringify(ll_out));
