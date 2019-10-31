/* eslint no-unused-labels: "off" */
/* globals ClickerModifier */
// Let's make a clicker for the s&g
document.addEventListener('DOMContentLoaded', function() {
  var globals = {
    FPS: 60
  };

  function ClickGame() {
    if (ClickGame.main instanceof ClickGame) {
      return ClickGame.main;
    }

    this.clicks = 0;

    this.production = 0;
    this.productionRate = 0;
    this.productionTotal = 0;

    this.modifiers = {
      clickers: {
        name: 'Auto-Clicker',
        count: 0,
        rate: 0.01, // Every Second
        cost: 10,
        growth: '<cost> + <rate> * <count>^2',
        manager: undefined
      },
      farm: {
        name: 'Farm',
        count: 0,
        rate: 0.1,
        cost: 50,
        growth: '<cost> + <rate> * <count>^2',
        manager: undefined
      },
      factory: {
        name: 'Factory',
        count: 0,
        rate: 0.2,
        cost: 100,
        growth: '<cost> + <rate> * <count>^2',
        manager: undefined
      },
      office: {
        name: 'Office',
        count: 0,
        rate: 0.5,
        cost: 200,
        growth: '<cost> + <rate> * <count>^2',
        manager: undefined
      }
    };
  }

  ClickGame.prototype = {
    /**
    * @function getData
    * @description Gets current state of the click game and returns an Object
    * @returns {object} Data object containing snapshot of click game
    */
    getData: function() {
      var _this = this;
      var result = {};

      Object.keys(this.modifiers).forEach(function(key) {
        result[key] = _this.modifiers[key].manager.getData();
      });

      result['production'] = this.production;
      result['productionTotal'] = this.productionTotal;

      return result;
    },
    /**
    * @function loadData
    * @description Sets data for Click Game and modifiers
    * @param {object} data JSON data
    * @returns {undefined}
    */
    loadData: function(data) {
      var _this = this;

      this.production = data.production;
      this.productionTotal = data.productionTotal;

      Object.keys(this.modifiers).forEach(function(key) {
        var modifier = _this.modifiers[key];
        modifier.manager.set(data[key].count);
      });
    },
    /**
    * @function modifiersBuy
    * @param {string} type Typeof modifier to buy
    * @returns {undefined}
    */
    modifiersBuy: function(type) {
      var modifier = this.modifiers[type];

      // Must have enough product to buy more modifiers
      if (this.production >= modifier.manager.getCost(0)) {
        this.production -= modifier.manager.getCost(0);
        this.modifiers[type].manager.buy(1);
      }
    },
    /**
    * @function updateLogic
    * @description Updates logic
    * @param  {number} timeNow Current time
    * @param {number} timeDelta Time since last update
    * @returns {undefined}
    */
    updateLogic: function(timeNow, timeDelta) {
      var _this = this;
      var newProduction = 0;

      // Drain the clicks queue
      while (this.clicks !== 0) {
        this.clicks--;
        newProduction++;
      }

      // Update based on each modifier
      Object.keys(this.modifiers).forEach(function(key) {
        var modifier = _this.modifiers[key];

        newProduction += modifier.manager.produce(timeDelta);
      });

      this.production += newProduction;
      this.productionTotal += newProduction;
      this.productionRate = newProduction * 1000 / timeDelta;
    },
    /**
    * @function updateDisplay
    * @descriptions Updates display
    * @returns {undefined}
    */
    updateDisplay: function() {
      var _this = this;
      var DOMProductCounter = document.getElementById('product-counter');
      var DOMRate = document.getElementById('product-rate');

      // Update each auto-something
      Object.keys(this.modifiers).forEach(function(key) {
        var modifier = _this.modifiers[key];
        var DOMCount = modifier.DOMTarget.querySelector('.click-auto__count');
        var DOMCost = modifier.DOMTarget.querySelector('.click-auto__cost');

        DOMCount.innerHTML = modifier.manager.count;
        DOMCost.innerHTML = modifier.manager.getCost(0);

        if (_this.production < modifier.manager.getCost(0)) {
          modifier.DOMTarget.classList.add('expensive');
        } else {
          modifier.DOMTarget.classList.remove('expensive');
        }
      });

      DOMProductCounter.innerHTML = this.production.toFixed(2);
      DOMRate.innerHTML = this.productionRate.toFixed(2);
    },
    /**
    * @function reset
    * @description Resets modifiers + production count
    * @returns {undefined}
    */
    reset: function() {
      var _this = this;
      this.production = 0;
      this.clicks = 0;

      Object.keys(this.modifiers).forEach(function(key) {
        var modifier = _this.modifiers[key];

        modifier.manager.reset();
      });
    }
  };

  ClickGame.main = new ClickGame();

  /**
  * @function updateLogic
  * @description Updates game logic
  * @returns {undefined}
  */
  var updateLogic = (function() {
    var timeLogic = 1000 / globals.FPS;
    var timePrev = 0;
    var accumulator = 0;

    return function() {
      var timeNow = performance.now();
      var timeDelta = timeNow - timePrev;

      accumulator += timeDelta;

      if (accumulator >= timeLogic) {
        accumulator -= timeLogic;
        // Run update function
        ClickGame.main.updateLogic(timeNow, timeDelta);
      }

      setTimeout(updateLogic, timeLogic);

      timePrev = timeNow;
    };
  })();

  /**
  * @function updateDisplay
  * @description Updates display
  * @returns {undefined}
  */
  function updateDisplay() {
    // Move to request animation frame
    ClickGame.main.updateDisplay();

    requestAnimationFrame(updateDisplay);
  }

  var cookieHelper = {
    get: function() {
      var cookies = {};

      document.cookie.split('; ').forEach(function(element) {
        var cookie = element.split('=');
        cookies[cookie[0]] = cookies[cookie[1]];
      });
      return cookies;
    },
    set: function(name, value, cookieProps) {
      var defaults = {
        'path': undefined,
        'domain': undefined,
        'max-age': undefined,
        'expires': undefined,
        'secure': undefined,
        'samesite': undefined
      };
      var options = {};
      var cookieString = '';

      // Cookie must have a name
      if (typeof name !== 'string' || name.trim().length === 0) {
        return;
      }

      // Cookie must have a value
      if (typeof value === 'undefined') {
        return;
      }

      options[name] = value;

      // Build
      if (typeof cookieProps === 'object') {
        Object.keys(defaults).forEach(function(key) {
          if (typeof cookieProps[key] !== 'undefined') {
            options[key] = cookieProps[key];
          }
        });
      }

      Object.keys(options).forEach(function(key) {
        cookieString += (cookieString.length ? '; ' : '') + key + '=' + options[key];
      });

      document.cookie = cookieString;
    }
  };

  init: {
    // Get previous session
    (function() {
      var cookie = cookieHelper.get();
    })();

    // Populate auto clicker menu w/modifier
    (function() {
      var DOMAutoMenu = document.querySelector('.click-auto__menu');

      // Init each modifier
      Object.keys(ClickGame.main.modifiers).forEach(function(key) {
        // DOM
        var DOMAutoMenuItem = document.createElement('li');
        var DOMAutoMenuItemWrapper = document.createElement('a');
        var DOMAutoMenuItemCount = document.createElement('div');
        var DOMAutoMenuItemCost = document.createElement('div');
        var DOMAutoMenuItemName = document.createElement('div');
        // LOGIC
        var modifier = ClickGame.main.modifiers[key];

        modifier.manager = new ClickerModifier(modifier.name, modifier.count, modifier.rate, modifier.cost, modifier.growth);

        DOMAutoMenuItem.setAttribute('class', 'click-auto__' + key);

        // Create wrapper
        DOMAutoMenuItemWrapper.setAttribute('href', '#');
        DOMAutoMenuItemWrapper.setAttribute('title', modifier.name);

        // Create count
        DOMAutoMenuItemCount.setAttribute('class', 'click-auto__count');
        DOMAutoMenuItemCount.innerHTML = modifier.count;

        // Create cost
        DOMAutoMenuItemCost.setAttribute('class', 'click-auto__cost');
        DOMAutoMenuItemCost.innerHTML = modifier.cost;

        // Create name
        DOMAutoMenuItemName.setAttribute('class', 'click-auto__name');
        DOMAutoMenuItemName.innerHTML = modifier.name;

        // Populate wrapper
        DOMAutoMenuItem.append(DOMAutoMenuItemCount);
        DOMAutoMenuItem.append(DOMAutoMenuItemCost);
        DOMAutoMenuItem.append(DOMAutoMenuItemName);

        // Populate item
        //DOMAutoMenuItem.append(DOMAutoMenuItemWrapper);

        // Attach event listener
        DOMAutoMenuItem.addEventListener('click', function(e) {
          e.preventDefault();
          ClickGame.main.modifiersBuy(key);
        });

        modifier.DOMTarget = DOMAutoMenuItem;

        DOMAutoMenu.append(DOMAutoMenuItem);
      });
    })();

    // Kick off logic loop
    updateLogic(ClickGame.main.updateLogic, ClickGame.main.updateDisplay);

    // Kick off display loop
    updateDisplay();
  }

  // Define the main clicker element
  events: {
    // Resets the clicker
    document.querySelector('.menu__item[data-type="new"]').addEventListener('click', function(e) {
      e.preventDefault();

      ClickGame.main.reset();
    });

    // Saves clicker progress
    document.querySelector('.menu__item[data-type="save"]').addEventListener('click', function(e) {
      var data = JSON.stringify(ClickGame.main.getData());
      var encoded = encodeURI(btoa(data));

      e.preventDefault();

      cookieHelper.set('saveData', encoded);

      // btoa -> atob
      document.querySelector('.popup__item--save textarea').value = encoded;

      document.querySelector('.popup').classList.add('popup--active');
      document.querySelector('.popup__item--save').classList.add('popup__item--active');
    });

    // Loads clicker progress
    document.querySelector('.menu__item[data-type="load"]').addEventListener('click', function(e) {
      e.preventDefault();

      document.querySelector('.popup').classList.add('popup--active');
      document.querySelector('.popup__item--load').classList.add('popup__item--active');
    });

    document.querySelector('.popup__item--load button').addEventListener('click', function(e) {
      var data = document.querySelector('.popup__item--load textarea').value.trim();
      var decoded = atob(decodeURI(data));

      e.preventDefault();

      document.querySelector('.popup').classList.remove('popup--active');
      [].slice.call(document.querySelectorAll('.popup__item')).forEach(function(DOMElement) {
        DOMElement.classList.remove('popup__item--active');
      });

      ClickGame.main.loadData(JSON.parse(decoded));
    });

    // About
    document.querySelector('.menu__item[data-type="about"]').addEventListener('click', function(e) {
      e.preventDefault();

      document.querySelector('.popup').classList.add('popup--active');
      document.querySelector('.popup__item--about').classList.add('popup__item--active');
    });

    // Close popups
    window.addEventListener('keydown', function(e) {
      switch (e.which) {
        case 27:
          document.querySelector('.popup').classList.remove('popup--active');
          [].slice.call(document.querySelectorAll('.popup__item')).forEach(function(DOMElement) {
            DOMElement.classList.remove('popup__item--active');
          });
          break;
      }
    });

    window.addEventListener('blur', function() {
      var data = JSON.stringify(ClickGame.main.getData());
      var encoded = encodeURI(btoa(data));

      // Whenever the window blurs save content to cookie
      cookieHelper.set('saveData', encoded);
      console.log('Game Saved');
    });

    document.querySelector('.clicker-side').addEventListener('click', function(e) {
      e.preventDefault();
      // Pile on clicks
      ClickGame.main.clicks++;
    });
  }
});
