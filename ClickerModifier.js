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
    return this.cost.growth(this.count);
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
  }
};
