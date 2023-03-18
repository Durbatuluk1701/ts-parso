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

export const Tokenize = (str: string, tds: TokenDescription[]): Tokens => {
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
