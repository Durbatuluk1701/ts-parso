type Tokens = string[];

const CharTokenizer = (str: string): Tokens => {
  return str.split("");
};

const word_splitter = (strList: string[], separators: RegExp[]): string[] => {
  return separators.reduce((prevVal, currentSep) => {
    return prevVal.reduce<string[]>(
      (acc, str) =>
        acc.concat(str.split(currentSep)).filter((val) => val.trim() !== ""),
      []
    );
  }, strList);
};

const WordTokenizer = (str: string, separators?: RegExp[]): Tokens => {
  const splits: RegExp[] = separators ?? [/\W/];
  return word_splitter([str], splits);
};
