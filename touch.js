/***
 * A standalone touch library for mobile devices.
 * @author rainyjune <rainyjune@live.cn>
 */

/* global define, Zepto */
((function(){
  
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
  
  TouchObject.prototype.bindMouseEvents = function() {
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
      var touchCopy = this.copyTouch(event);
      this.touchStartTouchList.push(touchCopy);
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
  
  TouchObject.prototype.bindPointerEvents = function() {
    var pointerDownName = window.PointerEvent ? "pointerdown" : "MSPointerDown",
        pointerMoveName = window.PointerEvent ? "pointermove" : "MSPointerMove",
        pointerUpName = window.PointerEvent ? "pointerup" : "MSPointerUp",
        pointerCancelName = window.PointerEvent ? "pointercancel" : "MSPointerCancel";
    
    var pointerDownBind = pointerDown.bind(this),
        pointerMoveBind = pointerMove.bind(this),
        pointerUpBind = pointerUp.bind(this),
        pointerCancelBind = pointerCancel.bind(this);
        
    var element = this.element,
        elementListeners = this.elementListeners;
        
    element.addEventListener(pointerDownName, pointerDownBind, false);
    element.addEventListener(pointerMoveName, pointerMoveBind, false);
    element.addEventListener(pointerUpName, pointerUpBind, false);
    element.addEventListener(pointerCancelName, pointerCancelBind, false);
    
    elementListeners.push({ "eventName": pointerDownName, "callback":  pointerDownBind });
    elementListeners.push({ "eventName": pointerMoveName, "callback": pointerMoveBind });
    elementListeners.push({ "eventName": pointerUpName, "callback": pointerUpBind });
    elementListeners.push({ "eventName": pointerCancelName, "callback": pointerCancelBind });
    
    function pointerDown(event) {
      // event.changedTouches is undefined in IE 11.
      // If there are several touch points at the same time, each of them will fire 
      // the pointerdown event individually.
      var touchCopy = this.copyTouch(event);
      this.touchStartTouchList.push(touchCopy);
      this.trigger("swipeStart", event);
    }
    
    function pointerMove(event) {
      
    }
    
    function pointerUp(event) {
      
    }
    
    function pointerCancel(event) {
      
    }
    
  };
  
  TouchObject.prototype.copyTouch = function(touch) {
    return {
      "identifier": touch.identifier || touch.pointerId || 0,
      "pageX": touch.pageX,
      "pageY": touch.pageY,
      "clientX": touch.clientX,
      "clientY": touch.clientY,
      "screenX": touch.screenX,
      "screenY": touch.screenY
    };
  };
  
  TouchObject.prototype.bindEvents = function() {
    if (window.PointerEvent || window.navigator.msPointerEnabled) {
      this.bindPointerEvents();
    } else if (('ontouchstart' in document.documentElement) || ('ontouchstart' in window)){
      this.bindTouchEvents();
    } else {
      this.bindMouseEvents();
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
    this.elementListeners.length = 0;
  };

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
  
  if (typeof define === "function" && (define.amd || define.cmd)) {
    define(function(){
      return TouchObject;
    });
  } else {
    window.TouchObject = TouchObject;
  }
  
})());