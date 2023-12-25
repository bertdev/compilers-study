const example = '((lambda (x) x) "lisp")'

class Parser {
    static parse(input) {
        return this.parenthesize(this.tokenize(input));
    }

    static tokenize(input) {
        return input.replaceAll("(", " ( ")
                    .replaceAll(")", " ) ")
                    .trim()
                    .split(" ")
                    .filter(i => i != "")
    }

    static parenthesize(tokens, list) {
        if (list === undefined) {
            return this.parenthesize(tokens, []);
        } else {
            const token = tokens.shift();
            if (token === undefined) {
                return list.pop();
            } else if (token === "(") {
                list.push(this.parenthesize(tokens, list));
                return this.parenthesize(tokens, list); 
            } else if (token === ")") {
                return list;
            } else {
                return this.parenthesize(tokens, list.concat(this.categorize(token)));
            }
        }
    }

    static categorize(token) {
        if (!isNaN(Number(token))) {
            return {type: "literal", value: Number(token)};
        } else if (token[0] === '"' && token[token.length - 1] === '"') {
            return {type: "literal", value: token.substring(1, token.length -1)};
        } else {
            return {type: "identifier", value: token};
        }
    }
}

class Context {
    constructor(scope, parent) {
        this.scope = scope;
        this.parent = parent;
    }

    get(identifier) {
        if (identifier in this.scope) {
            return this.scope[identifier];
        } else if (this.parent !== undefined) {
            return this.parent.get(identifier);
        }
    }
}

class Interpreter {
    library = {
        first: function(x) {
            return x[0];
        },
        rest: function(x) {
            return x.slice(1);
        },
        print: function(x) {
            console.log(x);
            return x;
        }
    };

    special = {
        lambda: function(input, context) {
            return function () {
                const args = arguments;
                const scope = input[1].reduce((previous, current, index) => {
                    previous[current.value] = args[index];
                    return previous;
                }, {});

                return this.interpret(input[2], new Context(scope, context));
            }
        }.bind(this),
    };


    interpret(input, context) {
        if (context === undefined) {
            return this.interpret(input, new Context(this.library));
        } else if (input instanceof Array) {
            return this.interpretList(input, context);
        } else if (input.type === "identifier") {
            return context.get(input.value);
        } else {
            return this.interpret(input, context);
        }
    }

    interpretList(input, context) {
        if (input.length > 0 && input[0].value in this.special) {
            return this.special[input[0].value](input, context);
        } else {
            const list = input.map(i => this.interpret(i, context));
            if (list[0] instanceof Function) {
                return list[0].apply(undefined, list.slice(1));
            } else {
                return list;
            }
        }
    }
}


const interpreter = new Interpreter();
console.log(interpreter.interpret(Parser.parse(example)));
