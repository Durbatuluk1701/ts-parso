export type Tokens = string[];

const token_splitter = (
  strList: string[],
  separators: (string | RegExp)[]
): string[] => {
  return separators.reduce((prevVal, currentSep) => {
    return prevVal.reduce<string[]>(
      (acc, str) => acc.concat(str.split(currentSep)),
      []
    );
  }, strList);
};

export const Tokenizer = (
  str: string,
  separators: (string | RegExp)[]
): Tokens => {
  return token_splitter([str], separators);
};

export const CharTokenizer = (str: string): Tokens => Tokenizer(str, [""]);
