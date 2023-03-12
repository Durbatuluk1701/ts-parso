"use strict";
const token_desc_list = [
    {
        name: "h3",
        description: /###/,
        precedence: 12,
    },
    {
        name: "h2",
        description: /##/,
        precedence: 11,
    },
    {
        name: "h1",
        description: /#/,
        precedence: 10,
    },
    {
        name: "str",
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
console.log("OUTPUT: ", Tokenize(test_str, token_desc_list));
