function BigNumber() {
  this.num = [
    // 0-9
    {
      name: 'ones',
      max: 10,
      count: 0
    },
    // 10-99
    {
      name: 'tens',
      max: 10,
      count: 0
    },
    // 100-999
    {
      name: 'hundred',
      max: 10,
      count: 0
    },
    // 1000-999999
    {
      name: 'thousand',
      max: 1000,
      count: 0
    },
    {
      name: 'million',
      max: 1000,
      count: 0
    },
    {
      name: 'billion',
      max: 1000,
      count: 0
    },
    {
      name: 'trillion',
      max: 1000,
      count: 0
    },
    {
      name: 'quadrillion',
      max: 1000,
      count: 0
    },
    {
      name: 'quintillion',
      max: 1000,
      count: 0
    },
    {
      name: 'sextillion',
      max: 1000,
      count: 0
    }
  ];
}

BigNumber.prototype = {
  set: function(num) {
    var _this = this;
    var index = 3;
    var splitNum = num.toString().split('').reverse().join('').match(/[0-9]{1,3}/g).map(function(element) {
      return element.split('').reverse().join('');
    }).reverse();

    this.num.forEach(function(element) {
      element.count = 0;
    });

    // Start ones to hundred
    splitNum.pop().split('').reverse().forEach(function(value, index) {
      _this.num[index].count = parseInt(value);
    });

    // rest of number
    while (splitNum.length) {
      _this.num[index].count = parseInt(splitNum.pop());
      index++;
    }

    // Increment the numers if they exceed an amount
    this.num.forEach(function(element, index) {
      var next;
      var push = Math.floor(element.count / element.max);

      element.count -= push * element.max;

      if (index + 1 <= _this.num.length - 1) {
        next = _this.num[index + 1];
        next.count += push;
      }
    });

    return this.num;
  },
  getString: function() {
    var resultString = '';
    var numCopy = this.num.slice(0);

    // We get strings under a thousand
    function getCountString(num) {
      var hundreds;
      var tens;
      var ones;
      var underTwentyString = [
        '',
        'one',
        'two',
        'three',
        'four',
        'five',
        'six',
        'seven',
        'eight',
        'nine',
        'ten',
        'eleven',
        'twelve',
        'thirteen',
        'fourteen',
        'fifteen',
        'sixteen',
        'seventeen',
        'eighteen',
        'nineteen'
      ];
      var tenString = [
        '',
        '',
        'twenty',
        'thirty',
        'fourty',
        'fifty',
        'sixty',
        'seventy',
        'eighty',
        'ninety',
        'hundred'
      ];
      var result = '';

      // Nums greater or equal to twenty has their tens place followed by the ones place name
      if (num >= 20) {
        hundreds = Math.floor(num / 100);
        tens = Math.floor((num - hundreds * 100) / 10);
        ones = underTwentyString[num - hundreds * 100 - tens * 10];

        result = (hundreds === 0 ? '' : underTwentyString[hundreds] + ' hundred ') + tenString[tens] + '-' + ones;
      } else {
        result = underTwentyString[num];
      }

      return result;
    }

    console.log(numCopy);

    // Collect the first two places and combine it
    (function() {
      var tensOnes = numCopy.splice(0, 2);
      var result = tensOnes[0].count + tensOnes[1].count * 10;
      console.log(tensOnes);
      numCopy.unshift({name: '', count: result});

      console.log(tensOnes[0].count, tensOnes[1].count, result);
    })();

    numCopy.reverse().forEach(function(element, index) {
      if (element.count === 0) {
        return;
      }
      console.log('count: ' + getCountString(element.count), 'name: ' + element.name);
      resultString += (numCopy.length === index + 1 ? ' and ' : ' ') + getCountString(element.count) + ' ' + element.name;
    });
    console.log(numCopy);
    return resultString;
  }
};

var test = new BigNumber();
test.set(523123);
console.log(test.num);
console.log(test.getString());
