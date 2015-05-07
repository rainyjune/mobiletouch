/***
 * A standalone touch library for mobile devices.
 * @author rainyjune <rainyjune@live.cn>
 */

/* global define, Zepto */
(function(factory){
  if (typeof define !== "undefined" && define.cmd) {
    define(function(require, exports, module){
      factory();
    });
  } else {
    factory();
  }
}(function(){
  
  function TouchObject(domElement) {
    this.element = domElement;
    // Put all TouchEvent objects fired in the touchstart event into this array.
    var touchStartTouchList = [];
    
    var elementListeners= [];
    
    this.__defineGetter__("touchStartTouchList", function() {
      return touchStartTouchList;
    });
    this.__defineGetter__("elementListeners", function() {
      return elementListeners;
    });
    
    var isTapLength,
        tapLengthTimeout;
    
    this.horizontalOffset = 20,
    this.verticalOffset = 30;
    
    this.isDebug = true;
    
    this.bindEvents();
  }
  
  TouchObject.prototype.bindEvents = function() {
    var element = this.element;
    
    var mouseStartHandlerBind = mousestartHandler.bind(this);
    var mousemoveHandlerBind = mousemoveHandler.bind(this);
    var mouseEndHandlerBind = mouseEndHandler.bind(this);
    
    element.addEventListener("mousedown", mouseStartHandlerBind, false);
    element.addEventListener("mousemove", mousemoveHandlerBind, false);
    element.addEventListener("mouseup", mouseEndHandlerBind, false);
    element.addEventListener("mouseleave", mouseEndHandlerBind, false);
    
    this.elementListeners.push({
      "eventName": "mousedown",
      "callback": mouseStartHandlerBind
    });
    this.elementListeners.push({
      "eventName": "mousemove",
      "callback": mousemoveHandlerBind
    });
    this.elementListeners.push({
      "eventName": "mouseup",
      "callback": mouseEndHandlerBind
    });
    this.elementListeners.push({
      "eventName": "mouseleave",
      "callback": mouseEndHandlerBind
    });
    
    function mousestartHandler(event) {
      this.touchStartTouchList.push({
        "identifier": 0,
        "pageX": event.pageX,
        "pageY": event.pageY,
        "clientX": event.clientX,
        "clientY": event.clientY,
        "screenX": event.screenX,
        "screenY": event.screenY
      });
      this.trigger("swipeStart", event);
    }
    
    function mousemoveHandler(event) {
      // The 'touch' event not started.
      if (this.touchStartTouchList.length === 0) {
        return false;
      }
      var firstTouchStartEvent = this.touchStartTouchList[0];
      var nowPageX = event.pageX;
      var nowPageY = event.pageY;
      var movedPageX = nowPageX - firstTouchStartEvent.pageX;
      var movedPageY = nowPageY - firstTouchStartEvent.pageY;
      var eventObj = {
        pageX: event.pageX,
        pageY: event.pageY,
        clientX: event.clientX,
        clientY: event.clientY,
        screenX: event.screenX,
        screenY: event.screenY,
        detail: {'movedPageX': movedPageX, 'movedPageY': movedPageY}
      };
      this.trigger("swipeProgress", eventObj);
    }
    
    function mouseEndHandler(event) {
      var firstTouchStartEvent = this.touchStartTouchList[0];
      if (!firstTouchStartEvent) {
        return false;
      }
      this.touchStartTouchList.length = 0;
      
      var touchX = firstTouchStartEvent.clientX,
          nowX = event.clientX,
          touchY = firstTouchStartEvent.clientY,
          nowY = event.clientY;
          
      var movX = Math.abs(touchX - nowX);
      var movY = Math.abs(touchY - nowY);
      
      if (movX > this.horizontalOffset || movY > this.verticalOffset) {
        this.trigger("swipe", event);
        var direction = swipeDirection(touchX, nowX, touchY, nowY);
        this.trigger("swipe" + direction, event);
      } else {
        this.trigger("swipeCancel", event);
      }
    }
  
  };
  
  TouchObject.prototype.addEventListener = function(eventName, callback) {
    EventsObject.on(eventName, callback);
  }
  
  TouchObject.prototype.trigger = function(eventName, customData) {
    EventsObject.trigger(eventName, customData);
  }
  
  TouchObject.prototype.dispose = function() {
    for (var i = 0; i < this.elementListeners.length; i ++) {
      var currentListener = this.elementListeners[i];
      this.element.removeEventListener(currentListener["eventName"], currentListener["callback"]);
    }
  };
  
  window.TouchObject = TouchObject;

  function swipeDirection(x1, x2, y1, y2) {
    return Math.abs(x1 - x2) >= Math.abs(y1 - y2) ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down');
  }
  
  var EventsObject = (function(){
    // Events on and off
    var Events = [];

    function on(event, callback) {
        if (!Events[event]) {
            Events[event] = [];
        }
        Events[event].push(callback);
        return callback;
    }

    function off(event, callback) {
        if (!Events[event]) {
            return ;
        }
        if (callback) {
            var index = Events[event].indexOf(callback);
            if (index !== -1) {
                Events[event].splice(index, 1);
            }
        } else {
            Events[event] = [];
        }
    }

    function trigger (event) {
        if (!Events[event]) {
            return ;
        }
        var args = Array.prototype.slice.call(arguments, 1);
        var callbackArray = Events[event];
        for (var i = callbackArray.length - 1; i >= 0; i--) {
            callbackArray[i].apply(callbackArray[i], args);
        }
    }  
    return {
      "on": on,
      "off": off,
      "trigger": trigger
    }
  })();
  
}));