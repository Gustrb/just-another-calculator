class Tokenizer {
  constructor(mathCalculation) {
    this.mathCalculation = mathCalculation.toString();

    this.tokens = [];
    this.currentToken = null;
    this.currentTokenIndex = 0;
  }

  tokenize() {
    while (this.currentTokenIndex < this.mathCalculation.length) {
      this.currentToken = this.mathCalculation[this.currentTokenIndex];

      if (this.isNumber(this.currentToken)) {
        this.tokens.push(this.getNumber());

      } else if (this.isOperator(this.currentToken)) {
        this.tokens.push(this.getOperator());

      } else if (this.isParenthesis(this.currentToken)) {
        this.tokens.push(this.getParenthesis());
      } else if (this.isSpace(this.currentToken)) {
        this.noop();
      } else {
        throw new Error('Invalid character found');
      }

      this.currentTokenIndex++;
    }

    return this.tokens;
  }

  isNumber(token) {
    return token.match(/[0-9]/);
  }

  getNumber() {
    let number = '';

    while (this.currentToken && this.isNumber(this.currentToken)) {
      number += this.currentToken;
      this.currentTokenIndex++;
      this.currentToken = this.mathCalculation[this.currentTokenIndex];
    }

    this.currentTokenIndex--;
    return { type: 'number', value: parseInt(number) };
  }

  isOperator(token) {
    return ['+', '-', '*', '/'].includes(token);
  }

  getOperator() {
    return { type: 'operator', value: this.currentToken };
  }

  isParenthesis(token) {
    return ['(', ')'].includes(token);
  }

  getParenthesis() {
    const parenthesis = this.mathCalculation[this.currentTokenIndex];

    return {
      type: parenthesis == '(' ? 'leftParenthesis' : 'rightParenthesis',
      value: this.currentToken
    };
  }

  isSpace(token) {
    return token == ' ';
  }

  noop() {}
}

// Sintaxe:
// expression = term | expression operator term
// term = number | leftParenthesis expression rightParenthesis
// operator = + | - | * | /
// number = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
// leftParenthesis = (
// rightParenthesis = )
class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.currentTokenIndex = 0;
  }

  parse() {
    const node = this.getExpression();

    if (this.currentTokenIndex < this.tokens.length) {
      throw new Error('Invalid syntax');
    }

    return node;
  }

  getExpression() {
    let node = this.getTerm();

    while (this.currentTokenIndex < this.tokens.length) {
      const token = this.tokens[this.currentTokenIndex];

      if (token.type == 'operator' && ['+', '-'].includes(token.value)) {
        this.currentTokenIndex++;
        node = {
          type: 'expression',
          operator: token.value,
          left: node,
          right: this.getTerm()
        };
      } else {
        break;
      }
    }

    return node;
  }

  getTerm() {
    let node = this.getFactor();

    while (this.currentTokenIndex < this.tokens.length) {
      const token = this.tokens[this.currentTokenIndex];

      if (token.type == 'operator' && ['*', '/'].includes(token.value)) {
        this.currentTokenIndex++;
        node = {
          type: 'term',
          operator: token.value,
          left: node,
          right: this.getFactor()
        };
      } else {
        break;
      }
    }

    return node;
  }

  getFactor() {
    const token = this.tokens[this.currentTokenIndex];

    if (token.type == 'number') {
      this.currentTokenIndex++;
      return token;
    } else if (token.type == 'leftParenthesis') {
      this.currentTokenIndex++;
      const node = this.getExpression();

      if (this.tokens[this.currentTokenIndex].type != 'rightParenthesis') {
        throw new Error('Invalid syntax');
      }

      this.currentTokenIndex++;
      return node;
    } else {
      throw new Error('Invalid syntax');
    }
  }
}

class Evaluator {
  // ast é a árvore sintática abstrata,
  // que é o resultado do parser
  constructor(ast) {
    this.ast = ast;
  }

  // Evaluate é mais pra lembrar o eval do JS,
  // que invoca uma instancia do interpretador para uma expressão
  // especifica
  evaluate() {
    return this.evaluateNode(this.ast);
  }

  evaluateNode(node) {
    // Caso o node atual seja simplesmente um número, não
    // é preciso entrar dentro de hierarquia nenhuma e avaliar
    // os filhos, visto que ele não possui filhos.
    if (node.type == 'number') {
      return node.value;
    }

    // Caso o node atual seja uma expressão, é preciso avaliar
    // os filhos da expressão, e então realizar a operação
    if (node.type == 'expression') {
      return this.evaluateExpression(node);
    }

    // Caso o node atual seja uma termo, é preciso avaliar
    // os filhos do termo, e então realizar a operação
    if (node.type == 'term') {
      return this.evaluateTerm(node);
    }
  }

  evaluateExpression(node) {
    // como não se sabe o tipo dos nodes, avaliamos eles como nodes
    // não como expressões ou termos
    const left = this.evaluateNode(node.left);
    const right = this.evaluateNode(node.right);

    // Expressões são ou + ou -
    if (node.operator == '+') {
      return left + right;
    }

    if (node.operator == '-') {
      return left - right;
    }
  }

  evaluateTerm(node) {
    // como não se sabe o tipo dos nodes, avaliamos eles como nodes
    // não como expressões ou termos
    const left = this.evaluateNode(node.left);
    const right = this.evaluateNode(node.right);

    // Expressões são ou * ou /
    if (node.operator == '*') {
      return left * right;
    }

    if (node.operator == '/') {
      return left / right;
    }
  }
}

const button = document.querySelector('#calculator__evaluate');
const input = document.querySelector('#calculator__field');

button.addEventListener('click', () => {
  const fieldContent = input.value;
  evaluateExpression(fieldContent);
});

input.addEventListener('keyup', (e) => {
  if (e.key == 'Enter') {
    const fieldContent = input.value;
    evaluateExpression(fieldContent);
  }
});

function displayResult(result) {
  const resultDiv = document.querySelector('#calculator-result');
  const resultText = document.createTextNode(result);

  resultDiv.innerHTML = '';
  resultDiv.appendChild(resultText);
}

function evaluateExpression(expression) {
  const tokenizer = new Tokenizer(expression);
  const parser = new Parser(tokenizer.tokenize());
  const evaluator = new Evaluator(parser.parse());
  const result = evaluator.evaluate();

  displayResult(result);
}
