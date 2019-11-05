/* exported Update */

var Update = {
  /**
  * @function updateLogic
  * @description Description pending
  * @param {function} callbackLogic Callback to run to update logic
  * @returns {LogicLoop} LogicLoop instance
  */
  logic: (function() {
    function LogicLoop(callback, options) {
      this.timeLogic = 1000 / options.FPS;
      this.callback = callback;
      this.paused = true;
    }

    LogicLoop.prototype = {
      update: function() {
        var _this = this;
        var timePrev = 0;
        var accumulator = 0;
        var loopFunc = function() {
          var timeNow = performance.now();
          var timeDelta = timeNow - timePrev;

          // Stop updates
          if (_this.paused) {
            return;
          }

          accumulator += timeDelta;

          if (accumulator >= _this.timeLogic) {
            accumulator -= _this.timeLogic;
            // Run update function
            _this.callback(timeNow, timeDelta);
          }

          setTimeout(loopFunc, _this.timeLogic);

          timePrev = timeNow;
        };

        loopFunc();
      },
      start: function() {
        this.paused = false;
        this.update();
      },
      stop: function() {
        this.paused = true;
      }
    };

    return function(callbackLogic, options) {
      var defaults = {
        FPS: 60
      };
      var args = {};

      options = typeof options === 'undefined' ? {} : options;

      Object.keys(defaults).forEach(function(key) {
        args[key] = typeof options[key] !== 'undefined' ? options[key] : defaults[key];
      });

      return new LogicLoop(callbackLogic, args);
    };
  })(),
  /**
  * @function display
  * @description Description pending
  * @returns {DisplayLoop} DisplayLoop instance
  */
  display: (function() {
    function DisplayLoop(callback) {
      this.callback = callback;
      this.paused = true;
    }

    DisplayLoop.prototype = {
      update: function() {
        var _this = this;
        var loopFunc = function() {
          if (_this.paused) {
            return;
          }

          _this.callback();

          requestAnimationFrame(function() {
            _this.update();
          });
        };

        loopFunc();
      },
      start: function() {
        this.paused = false;
        this.update();
      },
      stop: function() {
        this.paused = true;
      }
    };

    return function(callbackDisplay) {
      return new DisplayLoop(callbackDisplay);
    };
  })()
};
