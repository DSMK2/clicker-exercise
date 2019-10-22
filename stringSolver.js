/* eslint complexity: off*/
function multiply(multiplier, multiplicand) {
  return multiplier * multiplicand;
}

function divide(dividend, divisor) {
  return dividend / divisor;
}

function addition(addend_1, addend_2) {
  return addend_1 + addend_2;
}

function subtraction(minued, subtrahend) {
  return minued - subtrahend;
}

// PEMDAS
function solve(equation) {
  // Break down parenthesis
  var matches = equation.matchAll(/\((.*?)\)/g);
  var matchValue = matches.next();
  var parenthesis = [];
  var solved;
  var newValue;
  var offset = 0;
  var halfA;
  var halfB;
  console.log('working on ' + equation, matches);
  console.log(typeof matches.value !== 'undefined' && !matches.done);

  if (equation.length === 0) {
    return equation;
  }

  while (typeof value !== 'undefined' && !matchValue.done) {
    parenthesis.push({solved: solve(matchValue.value[0]), start: matches.index, originalLength: matchValue.value[0].toString().length});
    matchValue = matches.next();
  }

  // Replace solved parenthesis
  while (parenthesis.length !== 0) {
    solved = parenthesis.pop();
    halfA = equation.substr(offset, solved.start - 1);
    halfB = equation.substr(solved.start + solved.originalLength + 1, equation.length - 1);
    equation = halfA + solved.answer + halfB;
    offset = solved.start + solved.answer.toString().length;
  }

  offset = 0;

  // Solve exponents
  matches = equation.matchAll(/[0-9]+\^[0-9]+/);
  matchValue = matches.next();
  console.log(matchValue);
  while (typeof matchValue.value !== 'undefined' && !matchValue.done) {
    newValue = matchValue.value[0].split('^').map(function(element) {
      return parseFloat(element);
    });
    parenthesis.push({answer: Math.pow(newValue[0], newValue[1]), start: matchValue.value.index, originalLength: matchValue.value[0].toString().length});

    matchValue = matches.next();
  }

  offset = 0;

  // Replace solved exponents
  while (parenthesis.length !== 0) {
    solved = parenthesis.pop();
    halfA = equation.substr(offset, solved.start);
    halfB = equation.substr(solved.start + solved.originalLength, equation.length - 1);
    equation = halfA + solved.answer + halfB;
    offset = solved.start + solved.answer.toString().length;
  }

  // Solve multiplication / division
  var PDRegex = /[0-9]+(\*|\/)[0-9]+/;
  var test = PDRegex.exec(equation);
  while (test) {
    newValue = test[0].split(test[1]);
    solved;
    newValue = newValue.map(function(element) {
      return parseFloat(element);
    });

    switch (test[1]) {
      case '*':
        solved = newValue[0] * newValue[1];
        break;
      case '/':
        solved = newValue[0] / newValue[1];
        break;
    }

    halfA = equation.substr(offset, test.index);
    halfB = equation.substr(test.index + test[0].length, equation.length - 1);
    equation = halfA + solved + halfB;
    offset += test.index + solved.toString().length;

    test = PDRegex.exec(equation);
  }

  // Solve addition/subtraction
  PDRegex = /[0-9]+(\+|\-)[0-9]+/;
  test = PDRegex.exec(equation);
  while (test) {
    newValue = test[0].split(test[1]);
    solved;
    newValue = newValue.map(function(element) {
      return parseFloat(element);
    });

    console.log(newValue);

    switch (test[1]) {
      case '+':
        solved = newValue[0] + newValue[1];
        break;
      case '-':
        solved = newValue[0] - newValue[1];
        break;
    }

    halfA = equation.substr(offset, test.index);
    halfB = equation.substr(test.index + test[0].length, equation.length - 1);
    equation = halfA + solved + halfB;
    offset += test.index + solved.toString().length;

    test = PDRegex.exec(equation);
  }

  return equation;
}

console.log(solve('4^2+(4^(1+2)+1)'), Math.pow(4, 2) + (Math.pow(4, 1 + 2) + 1));
