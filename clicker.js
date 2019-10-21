/* eslint no-unused-labels: "off" */
// Let's make a clicker for the s&g
document.addEventListener('DOMContentLoaded', function() {
  var clickGameProperties = {
    paused: false,
    clicks: 0,
    production: 0,
    modifiers: { // Maybe turn this into an object?
      clickers: {
        name: 'Auto-Clicker',
        DOMTarget: undefined,
        count: 0,
        rate: 0.01, // Every Second
        timeNext: 0,
        costStarting: 10,
        costCurrent: 10,
        costGrowth: function(count) {
        }
      },
      farm: {
        name: 'Farm',
        DOMTarget: undefined,
        count: 0,
        rate: 0.1,
        timeNext: 0,
        costStarting: 50,
        costCurrent: 50,
        costGrowth: function(count) {
        }
      },
      factory: {
        name: 'Factory',
        DOMTarget: undefined,
        count: 0,
        rate: 0.15,
        timeNext: 0,
        costStarting: 100,
        costCurrent: 100,
        costGrowth: function(count) {
        }
      }
    },
    modifiersBuy: function(type) {
      clickGameProperties.modifiers[type].count++;
    },
    updateLogic: function(timeNow) {
      var DOMProductCounter = document.getElementById('product-counter');

      // Drain the clicks queue
      if (clickGameProperties.clicks !== 0) {
        clickGameProperties.clicks--;
        clickGameProperties.production++;
      }

      Object.keys(clickGameProperties.modifiers).forEach(function(key) {
        var modifier = clickGameProperties.modifiers[key];

        // Staggered is bad
        /*
        if (timeNow >= modifier.timeNext) {
          clickGameProperties.production += modifier.rate * modifier.count;
          modifier.timeNext = timeNow + (1000 - 1000 * modifier.rate);
        }
        */
      });

      DOMProductCounter.innerHTML = clickGameProperties.production.toFixed(2);
    },
    updateDisplay: function() {
      Object.keys(clickGameProperties.modifiers).forEach(function(key) {
        var modifier = clickGameProperties.modifiers[key];
        var DOMCount = modifier.DOMTarget.querySelector('.click-auto__count');

        DOMCount.innerHTML = modifier.count;
      });
    },
    update: function(timeNow) {
      clickGameProperties.updateLogic(timeNow);
    },
    // Lifted from my game idea server thing
    loopFunction: (function() {
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
          clickGameProperties.update(timeNow);

          timeNext = timeNow + timeLogic;
          // timePrev = timeNow;

          setTimeout(clickGameProperties.loopFunction, timeLogic);
        } else {
          clickGameProperties.updateDisplay();

          setTimeout(clickGameProperties.loopFunction, timeLogic);
        }
      };
    })()
  };
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

      Object.keys(clickGameProperties.modifiers).forEach(function(key) {
        // DOM
        var DOMAutoMenuItem = document.createElement('li');
        var DOMAutoMenuItemWrapper = document.createElement('a');
        var DOMAutoMenuItemCount = document.createElement('span');
        var DOMAutoMenuItemName = document.createElement('span');
        // LOGIC
        var modifier = clickGameProperties.modifiers[key];

        DOMAutoMenuItem.setAttribute('class', 'click-auto__' + key);

        // Create wrapper
        DOMAutoMenuItemWrapper.setAttribute('href', '#');
        DOMAutoMenuItemWrapper.setAttribute('title', modifier.name);

        // Create count
        DOMAutoMenuItemCount.setAttribute('class', 'click-auto__count');
        DOMAutoMenuItemCount.innerHTML = modifier.count;

        // Create name
        DOMAutoMenuItemName.setAttribute('class', 'click-auto__name');
        DOMAutoMenuItemName.innerHTML = '&nbsp;' + modifier.name;

        // Populate wrapper
        DOMAutoMenuItemWrapper.append(DOMAutoMenuItemCount);
        DOMAutoMenuItemWrapper.append(DOMAutoMenuItemName);

        // Populate item
        DOMAutoMenuItem.append(DOMAutoMenuItemWrapper);

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
    clickGameProperties.loopFunction();
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
