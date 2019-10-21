/* eslint no-unused-labels: "off" */
/* globals ClickerModifier */
// Let's make a clicker for the s&g
document.addEventListener('DOMContentLoaded', function() {
  var clickGameProperties = {
    paused: false,
    clicks: 0,
    production: 0,
    // Starting values
    modifiers: {
      clickers: {
        name: 'Auto-Clicker',
        count: 0,
        rate: 0.01, // Every Second
        cost: 10,
        growth: function(count) {
          return 10 + 0.01 * Math.pow(count, 2);
        },
        manager: undefined
      },
      farm: {
        name: 'Farm',
        count: 0,
        rate: 0.1,
        cost: 50,
        growth: function(count) {
          return 50 + 0.1 * Math.pow(count, 2);
        },
        manager: undefined
      },
      factory: {
        name: 'Factory',
        count: 0,
        rate: 0.2,
        cost: 100,
        growth: function(count) {
          return 100 + 0.2 * Math.pow(count, 2);
        },
        manager: undefined
      },
      office: {
        name: 'Office',
        count: 0,
        rate: 0.5,
        cost: 200,
        growth: function(count) {
          return 200 + 0.2 * Math.pow(count, 2);
        },
        manager: undefined
      }
    },
    modifiersBuy: function(type) {
      var modifier = clickGameProperties.modifiers[type];

      if (clickGameProperties.production >= modifier.manager.getCost(0)) {
        clickGameProperties.production -= modifier.manager.getCost(0);
        clickGameProperties.modifiers[type].manager.buy(1);
      }
    },
    updateLogic: function(timeNow, timeDelta) {
      var DOMProductCounter = document.getElementById('product-counter');

      // Drain the clicks queue
      if (clickGameProperties.clicks !== 0) {
        clickGameProperties.clicks--;
        clickGameProperties.production++;
      }

      Object.keys(clickGameProperties.modifiers).forEach(function(key) {
        var modifier = clickGameProperties.modifiers[key];

        clickGameProperties.production += modifier.manager.produce(timeDelta);
      });

      DOMProductCounter.innerHTML = clickGameProperties.production.toFixed(2);
    },
    updateDisplay: function() {
      // Update each auto-something
      Object.keys(clickGameProperties.modifiers).forEach(function(key) {
        var modifier = clickGameProperties.modifiers[key];
        var DOMCount = modifier.DOMTarget.querySelector('.click-auto__count');
        var DOMCost = modifier.DOMTarget.querySelector('.click-auto__cost');

        DOMCount.innerHTML = modifier.manager.count;
        DOMCost.innerHTML = modifier.manager.getCost(0).toFixed(2);

        if (clickGameProperties.production < modifier.manager.getCost(0)) {
          modifier.DOMTarget.classList.add('expensive');
        } else {
          modifier.DOMTarget.classList.remove('expensive');
        }
      });
    },
    update: function(timeNow, timeDelta) {
      clickGameProperties.updateLogic(timeNow, timeDelta);
    }
  };
  var updateFunction = (function() {
    var FPS = 60;
    var timeLogic = 1000 / FPS;
    var timeNextRaw = performance.now(); // Wow this was affected by spectre
    var timeNext = timeNextRaw + timeLogic;
    var timePrev = timeNextRaw + timeLogic;

    return function() {
      var timeNow = performance.now();
      var timeDelta = timeNow - timePrev;

      if (timeNow >= timeNext) {
        // Run update function
        clickGameProperties.updateLogic(timeNow, timeDelta);

        timeNext = timeNow + timeLogic;

        setTimeout(updateFunction, timeLogic);
      } else {
        clickGameProperties.updateDisplay();

        setTimeout(updateFunction, timeLogic);
      }

      timePrev = timeNow;
    };
  })();
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

      document.cookie = options.join(';');
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
      Object.keys(clickGameProperties.modifiers).forEach(function(key) {
        // DOM
        var DOMAutoMenuItem = document.createElement('li');
        var DOMAutoMenuItemWrapper = document.createElement('a');
        var DOMAutoMenuItemCount = document.createElement('div');
        var DOMAutoMenuItemCost = document.createElement('div');
        var DOMAutoMenuItemName = document.createElement('div');
        // LOGIC
        var modifier = clickGameProperties.modifiers[key];

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
          clickGameProperties.modifiersBuy(key);
        });

        modifier.DOMTarget = DOMAutoMenuItem;

        DOMAutoMenu.append(DOMAutoMenuItem);
      });
    })();

    // Kick off game loop
    updateFunction(clickGameProperties.updateLogic, clickGameProperties.updateDisplay);
  }

  // Define the main clicker element
  events: {
    document.getElementById('the_button').addEventListener('click', function(e) {
      e.preventDefault();
      // Pile on clicks
      clickGameProperties.clicks++;
    });
  }
});
