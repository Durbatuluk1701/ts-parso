"use strict";
const token_desc_list = [
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
const test_str = "# Testing \n### This is a little header\nand we can have baby text under it";
// We presume that tds is passed in sorted!
const Tokenize_prime = (str, tds) => {
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
        const best_token = {
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
const Tokenize = (str, tds) => {
    return Tokenize_prime(str, tds.sort((a, b) => b.precedence - a.precedence));
};
const output_tokens = Tokenize(test_str, token_desc_list);
console.log("output tokens", output_tokens);
const rule_names = (g) => {
    return g.map((rule) => rule.name);
};
const gram = [
    {
        name: "Head1",
        pattern: ["H1", "STR", "BR"],
        callback: () => { },
    },
    {
        name: "Head2",
        pattern: ["H2", "STR", "BR"],
        callback: () => { },
    },
    {
        name: "Head3",
        pattern: ["H3", "STR", "BR"],
        callback: () => { },
    },
];
// Similar to LL(k) below, but must satisfy rule 'r' or it throws an error
const LL_rule = (k, ts, g, r) => {
    const ruleNames = rule_names(g);
    const runningMatches = [];
    for (let i = 0; i < k; i++) {
        const tokI = ts[i];
        const patternI = r.pattern[i];
        if (tokI.name === patternI) {
            // Token matched
            runningMatches.push(tokI.name);
        }
        else if (patternI in ruleNames) {
            // We need to recurse into it as it is a Grammar Rule
            const recCall = LL(k, ts.slice(i), g); // We slice to get all past where we currently are
            runningMatches.push(...recCall.flat());
        }
        else {
            // Error, this is neither a Token or a Grammar Rule
            throw new Error(`Error, '${patternI}' is neither a Token or a Grammer Rule`);
        }
    }
    return runningMatches;
};
// Parses out with an LL(k) parser and returns updated stream
const LL = (k, ts, g) => {
    if (ts.length === 0) {
        return [];
    }
    const ruleNames = rule_names(g);
    const firstK_Rules = g.map((r) => r.pattern.slice(0, k));
    firstK_Rules.forEach((pattern) => {
        const running_matches = [];
        for (let i = 0; i < k; i++) {
            const tokI = ts[i];
            const patternI = pattern[i];
            if (tokI.name === patternI) {
                // Token matched
                running_matches.push(tokI.name);
            }
            else if (patternI in ruleNames) {
                // We need to recurse into it as it is a Grammar Rule
                const rule = g.find((val) => val.name === patternI);
                if (rule) {
                    // This is guaranteed!
                    const recCall = LL_rule(k, ts.slice(i), g, rule); // We slice to get all past where we currently are
                    running_matches.push(...recCall.flat());
                }
            }
            else {
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
    return [];
};
// This is a LL(1) parser,
const Parser = (tokStream, langGrammar) => { };
const ll_out = LL(4, output_tokens, gram);
console.log(ll_out);
