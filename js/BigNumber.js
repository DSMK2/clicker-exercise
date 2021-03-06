/* eslint complexity: "off" */
var BigNumber = (function() {
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
    getString: function(shorten) {
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
          ones = underTwentyString[num - hundreds * 100 + -tens * 10];

          console.log(num, tens, ones, num - hundreds * 100, tens >= 1 ? -tens * 10 : -1 * tens * 10);

          var hundredsString = hundreds === 0 ? '' : underTwentyString[hundreds] + ' hundred';
          var tensString = tenString[tens] + (tenString[tens].length !== 0 && ones.length !== 0 ? '-' : '');

          tensString = tensString.length === 0 && ones.length !== 0 ? 'and ' : tensString;

          result = hundredsString + ' ' + tensString + ones;
        } else {
          result = underTwentyString[num];
        }

        return result;
      }

      console.log(numCopy);

      // Collect the first two places and combine it
      if (shorten) {
        (function() {
          var nums = numCopy.reverse().filter(function(element) {
            return element.count !== 0;
          });

          resultString += nums[0].count + '.' + (nums[1].count / 100 * 100) + ' ' + nums[0].name;
        })();
      } else {
        (function() {
          var tensOnes = numCopy.splice(0, 2);
          var result = tensOnes[0].count + tensOnes[1].count * 10;

          numCopy.unshift({name: '', count: result});
        })();
        console.log(numCopy);
        numCopy.reverse().forEach(function(element, index) {
          var onesModifier = '';

          if (element.count === 0) {
            return;
          }

          // We're gonna call these orphaned one's, they will have an 'and' preceeding them
          if (element.name === '' && numCopy[index - 1].name !== 'tens') {
            onesModifier = 'and ';
          }

          resultString += (numCopy[numCopy.length - 2].count !== 0 && numCopy.length === index + 1 ? ' and ' : ' ') + (onesModifier.length === 0 ? ' ' : onesModifier) + getCountString(element.count) + ' ' + element.name;
        });
      }
      console.log(numCopy);
      return resultString;
    }
  };

  return BigNumber;
})();

var test = new BigNumber();
test.set(111050);
console.log(test.num);
console.log(test.getString());
