/* eslint complexity: "off", no-invalid-regexp: ["off"] */
/* globals solveEquation */
function ClickerModifier(name, count, rate, cost, growth) {
  this.name = name;
  this.count = count;
  this.rate = rate;
  this.cost = {
    start: cost,
    growth: growth // Present a function representing a growth equation
  };

  return this;
}

ClickerModifier.prototype = {
  getCost: function(count) {
    var equation = this.cost.growth;
    var answer;
    // <cost> + <rate> * <count> ^ 2
    // Avoiding eval

    equation = equation.replace('<cost>', this.cost.start);
    equation = equation.replace('<rate>', this.rate);
    equation = equation.replace('<count>', this.count);
    equation = equation.replace(/\s/g, '');

    answer = solveEquation(equation);
    return answer;
  },
  buy: function(count) {
    this.count += count;
  },
  sell: function(count) {
    this.count -= count;
  },
  set: function(count) {
    this.count = count;
  },
  produce: function(timeDelta) {
    return timeDelta / 1000 * this.rate * this.count;
  },
  getData: function() {
    return {
      name: this.name,
      count: this.count,
      rate: this.rate,
      cost: {
        start: this.cost.start,
        growth: this.cost.growth
      }
    };
  },
  reset: function() {
    this.count = 0;
  }
};
