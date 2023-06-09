"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
/**
 * Gets the name of all rules in a grammar
 * @param g the grammar to get the rules names from
 */
const rule_names = (g) => {
    return g.map((rule) => rule.name);
};
/**
 * Gets a specific grammar rule for from a grammar
 * where the rule name is provided
 * @param g the grammar to get the rule from
 * @param r the name of the rule to find
 * @throws If the rule name r is not in grammar g
 */
const get_rule = (g, r) => {
    const gr = g.find((val) => val.name === r);
    if (gr) {
        return gr;
    }
    throw new Error(`Rule '${r}' does not exist in grammar ${g}`);
};
/**
 * A LL(k) parser for a specific grammar rules pattern
 * @param k the number of lookahead tokens for this parser
 * @param ts the stream of tokens to parse
 * @param g the grammar to use for parsing
 * @param r the top-level grammar rule to attempt to parse
 * @param p the specific pattern to attempt to parse
 * @param final whether or not this parser should consume all remaining tokens
 */
const LL_pattern = (k, ts, g, r, p, final) => {
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
    const running_rule = {
        type: "Rule",
        name: r.name,
        callback: (context) => r.callback(running_rule, context),
        match: [],
    };
    // Checking the first "k" tokens
    let tokenInd = 0;
    for (let patternInd = 0; patternInd < p.length && tokenInd < ts.length; patternInd++) {
        const tokI = ts[tokenInd];
        const patternI = p[patternInd];
        if (patternI === "EMPTY") {
            const emptyMatch = {
                type: "Token",
                name: "EMPTY",
                match: "",
            };
            running_rule.match.push(emptyMatch);
            return [running_rule, 0];
        }
        if (tokI.name === patternI) {
            // This match at point 'i'
            const tokenMatch = {
                type: "Token",
                name: tokI.name,
                match: tokI.match,
            };
            running_rule.match.push(tokenMatch);
            tokenInd++;
        }
        else if (ruleNames.includes(patternI)) {
            // pattern[i] is a separate rule, recurse down to match
            // If our pattern is the last in the list, it should consume all
            const consumeAll = final && patternInd === p.length - 1;
            const patRule = get_rule(g, patternI);
            const matchedRule = LL_rule(k, ts.slice(tokenInd), g, patRule, consumeAll);
            if (matchedRule) {
                // We did not have an undefined traversal.
                // Add the matches
                running_rule.match.push(matchedRule[0]);
                tokenInd += matchedRule[1];
            }
            else {
                if (tokenInd < k) {
                    // Matched rule was undefined, and this is the first "k"
                    // tokens, so we have to bail out
                    return undefined;
                }
                else {
                    throw new Error("We made it 'k' tokens, but it failed afterwards");
                }
            }
        }
        else {
            if (tokenInd < k) {
                // So we didn't consume "k" tokens and failed,
                // so this is not a true error, just a bail out
                return undefined;
            }
            else {
                throw new Error("We made it 'k' tokens, but it failed afterwards");
            }
        }
    }
    // We have consumed all the way we need to
    return [running_rule, tokenInd];
};
/**
 * A LL(k) parser for a specific grammar rule
 * @param k the number of lookahead tokens for this parser
 * @param ts the stream of tokens to parse
 * @param g the grammar to use for parsing
 * @param r the top-level grammar rule to attempt to parse
 * @param final whether or not this parser should consume all remaining tokens
 */
const LL_rule = (k, ts, g, r, final) => {
    // While we still have tokens to consume, try the rules patterns
    for (const pattern of r.pattern) {
        // For each possible pattern
        // Try to apply that pattern,
        const patternReturn = LL_pattern(k, ts, g, r, pattern, final);
        if (patternReturn) {
            const [patternTry, ind] = patternReturn;
            // If we have validly reached this point,
            // the entire pattern has been consumed!
            if (final && ind < ts.length) {
                // If this is supposed to consume all, but it didnt
                continue;
                // This cannot be the pattern, so continue
            }
            return [patternTry, ind];
        }
    }
    if (final) {
        throw new Error("All patterns exhausted, and none validly parsed");
    }
    return undefined;
};
/**
 * Parses the token stream with an LL(k) parser
 * using the provided Grammer and a top-level grammar rule
 * that the token stream must conform to.
 * @param k the number of the LL(k) parser
 * @param tokStream the stream of tokens to parse
 * @param langGrammar the grammar to use for parsing
 * @param topLevelRule the top-level rule that the token stream must conform to
 */
const Parser = (k, tokStream, langGrammar, topLevelRule) => {
    const ruleOut = LL_rule(k, tokStream, langGrammar, topLevelRule, true);
    if (ruleOut) {
        return ruleOut[0];
    }
    throw new Error("Failed to parser!");
};
exports.Parser = Parser;
//# sourceMappingURL=Parser.js.map