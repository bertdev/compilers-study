const fs = require("fs");

const filename = process.argv[2].trim();
const content = fs.readFileSync(filename, {encoding: "utf8"}).toString();

console.log(JSON.stringify(parser(tokenizer(content))));

function tokenizer(input) {
  let current = 0;
  const tokens = [];

  while(current < input.length) {
    let char = input[current];

    if (char === "(") {
      tokens.push({
        type: "paren",
        value: "("
      });
      current++;
      continue;
    }

    if (char === ")") {
      tokens.push({
        type: "paren",
        value: ")"
      });
      current++;
      continue;
    }

    const WITHESPACE = /\s/;
    if (WITHESPACE.test(char)) {
      current++;
      continue;
    }

    const NUMBERS = /[0-9]/;
    if (NUMBERS.test(char)) {
      let val = "";
      while(NUMBERS.test(char)) {
        val = `${val}${char}`;
        char = input[++current];
      }
      tokens.push({
        type: "number",
        value: val
      });
      continue;
    }

    if (char === '"') {
      let val = ""
      char = input[++current];
      while(char !== '"') {
        val = `${val}${char}`;
        char = input[++current];
      }
      tokens.push({
        token: "string",
        value: val
      });
      current++;
    } 

    const LETTERS = /[a-z]/i;
    if (LETTERS.test(char)) {
      let val = "";
      while(LETTERS.test(char)) {
        val = `${val}${char}`;
        char = input[++current];
      }
      tokens.push({
        type: "name",
        value: val
      });
      continue;
    }

    throw new SyntaxError("Invalid token: " + char);
  }

  return tokens;
}

function parser(tokens) {
  let current = 0;
  function walk() {
    let token = tokens[current];

    if (token.type === "number") {
      current++;
      return {
        type: "NumberLiteral",
        value: token.value
      };
    }

    if (token.type === "string") {
      current++;
      return {
        type: "StringLiteral",
        value: token.value  
      };
    }

    if (token.type === "paren" && token.value === "(") {
      token = tokens[++current];
      let node = {
        type: "CallExpression",
        value: token.value,
        params: []
      };
      token = tokens[++current];

      while(
        token.type !== "paren" ||
        (token.type === "paren" && token.value !== ")")
      ) {
        node.params.push(walk());
        token = tokens[current];
      }

      current++;
      return node;
    }

    throw new TypeError(token.type);
  }

  let ast = {
    type: "Program",
    body: []
  }

  while(current < tokens.length) {
    ast.body.push(walk());
  }

  return ast;
}


