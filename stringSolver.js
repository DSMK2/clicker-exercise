/* eslint complexity: off*/
/**
* @function solveEquation
* @description Solves a equation given as a string in left to right PEMDAS order
* @param {string} equation Equation to solve
* @returns {number} The answer
*/
function solveEquation(equation) {
  // Break down parenthesis
  var regexPAR = /\((.*?)\)/;
  var regexEXP = /[0-9]+(\^)[0-9]+/;
  var regexPD = /[0-9]+(\*|\/)[0-9]+/;
  var regexAS = /[0-9]+(\+|-)[0-9]+/;
  var newValue;
  var test;

  /**
  * @function spliceSolvedParts
  * @description Splices solved parts into an equation
  * @param {string} equation Equation to splice into
  * @param {string} solvedPart Solved part to spice into equation
  * @param {string} unsolvedPart Unsolved part used to determine part to splice into
  * @param {number} startIndex Starting index of the solved/unsolved part
  * @returns {string} equation with solvedPart spliced in
  */
  function spliceSolvedParts(equation, solvedPart, unsolvedPart, startIndex) {
    var halfA = equation.substr(0, startIndex);
    var halfB = equation.substr(startIndex + unsolvedPart.length, equation.length - 1);
    equation = halfA + solvedPart + halfB;
    return equation;
  }

  /**
  * @function solveOperator
  * @description Solves for operator based on regex
  * @param {Regex} regex Regular expression to use
  * @param {string} equation Equation to modify
  * @returns {string} Solved equation for given operator
  */
  function solveOperator(regex, equation) {
    var solved;

    test = regex.exec(equation);
    while (test) {
      newValue = test[0].split(test[1]).map(function(element) {
        return parseFloat(element);
      });

      switch (test[1]) {
        case '^':
          solved = Math.pow(newValue[0], newValue[1]);
          break;
        case '*':
          solved = newValue[0] * newValue[1];
          break;
        case '/':
          solved = newValue[0] / newValue[1];
          break;
        case '+':
          solved = newValue[0] + newValue[1];
          break;
        case '-':
          solved = newValue[0] - newValue[1];
          break;
      }

      equation = spliceSolvedParts(equation, solved, test[0], test.index);
      test = regex.exec(equation);
    }

    return equation;
  }

  // No empty string allowed
  if (equation.length === 0) {
    return equation;
  }

  // Solve Parenthesis
  test = regexPAR.exec(equation);
  while (test) {
    equation = spliceSolvedParts(equation, solve(test[1]), test[0], test.index);
    test = regexPAR.exec(equation);
  }

  // Solve exponents
  equation = solveOperator(regexEXP, equation);

  // Solve multiplication / division
  equation = solveOperator(regexPD, equation);

  // Solve addition/subtraction
  equation = solveOperator(regexAS, equation);

  return equation;
}
