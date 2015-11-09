/***
 * A standalone touch library for mobile devices.
 * @author rainyjune <rainyjune@live.cn>
 * @license MIT
 */

/* global define, Zepto */
((function(){
  /**
   * Represents a touchable object.
   * @constructor
   * @param {DOM} domElement - A DOM element.
   */
  function TouchObject(domElement) {
    this.element = domElement;
    // Put all TouchEvent objects fired in the touchstart event into this array.
    /** @access protected */
    var touchStartTouchList = [];
    
    /** @access protected */
    var elementListeners= [];
    
    /** @access protected */
    var touchType;
    
    /** @access protected */
    var isTouchFixedNeeded = (function(){
      if (isAndroidBrowser()) {
        var androidVersion = getAndroidVersion();
        if (androidVersion === "4.0" || androidVersion === "4.4") {
          return true;
        } else {
          return false;
        }
      }
      return false;
    })();

    Object.defineProperty(this, "isTouchFixedNeeded", {
      get: function() {
        return isTouchFixedNeeded;
      }
    });
    Object.defineProperty(this, "touchType", {
      get: function() {
        return touchType;
      },
      set: function(type) {
        var touchTypes = ["gesture", "pointer", "touch", "mouse"];
        if (touchTypes.indexOf(type) > -1) {
          touchType = type;
        }
      }
    });
    Object.defineProperty(this, "touchStartTouchList", {
      get: function() {
        return touchStartTouchList;
      }
    });
    Object.defineProperty(this, "elementListeners", {
      get: function() {
        return elementListeners;
      }
    });
    
    Object.defineProperty(this, "addAppListener", {
      get: function() {
        return function(type, listener) {
          this.element.addEventListener(type, listener, false);
          this.elementListeners.push({
            "eventName": type,
            "callback": listener
          });
        };
      }
    });
    
    var isTapLength,
        tapLengthTimeout;
    
    function tapStart() {
      isTapLength = true;
      if (tapLengthTimeout) {
        clearTimeout(tapLengthTimeout);
      }
      tapLengthTimeout = setTimeout(function() {
        isTapLength = false;	
      }, 200);
    }

    Object.defineProperty(this, "tapStart", {
      get: function() {
        return tapStart;
      }
    });

    function isTapEvent(startTouchPoint, nowTouchPoint) {
      var startClientX = startTouchPoint.clientX,
          startClientY = startTouchPoint.clientY,
          nowClientX = nowTouchPoint.clientX,
          nowClientY = nowTouchPoint.clientY;

      if (isTapLength && approximatelyEqual(startClientX, nowClientX) && approximatelyEqual(startClientY, nowClientY)) {
        return true;
      }
      return false;
    }

    Object.defineProperty(this, "isTapEvent", {
      get: function() {
        return isTapEvent;
      }
    });
    
    /** @access public */
    this.horizontalOffset = 20,
    
    /** @access public */
    this.verticalOffset = 30;
    
    this.isDebug = false;
    
    this.applyCSS();
    this.bindEvents();
  }
  
  TouchObject.prototype.applyCSS = function() {
    var element = this.element;
    
    // Disable default touch action, such as 
    // scrolling, pinch-zooming or double-tap-zooming.
    element.style.msTouchAction = "none"; // TODO ["auto", "none", "pan-x", "pan-y", "manipulation"]
    //element.style.touchAction = "none";
    
    // Prevent text selection
    element.style.webkitUserSelect = "none";
    element.style.MozUserSelect = "none";
    element.style.msUserSelect = "none";
  };
  
  TouchObject.prototype.bindMouseEvents = function() {
    var element = this.element;
    var startEvent;
    var swipeTriggered = false;
    
    var mouseStartHandlerBind = mousestartHandler.bind(this);
    var mousemoveHandlerBind = mousemoveHandler.bind(this);
    var mouseEndHandlerBind = mouseEndHandler.bind(this);
    
    this.addAppListener("mousedown", mouseStartHandlerBind);
    this.addAppListener("mousemove", mousemoveHandlerBind);
    this.addAppListener("mouseup", mouseEndHandlerBind);
    this.addAppListener("mouseleave", mouseEndHandlerBind);
    
    function mousestartHandler(event) {
      var touchCopy = this.copyTouch(event);
      this.touchStartTouchList.push(touchCopy);
      this.tapStart();
      startEvent = event;
      swipeTriggered = false;
    }
    
    function mousemoveHandler(event) {
      // The 'touch' event not started.
      if (this.touchStartTouchList.length === 0) {
        return false;
      }
      if (!swipeTriggered) {
        this.trigger("swipeStart", startEvent);
        swipeTriggered = true;
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
      
      if (this.isTapEvent(firstTouchStartEvent, event)) {
        this.trigger("tap", event);
        event.preventDefault();
        return false;
      }

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
        if (swipeTriggered) {
          this.trigger("swipeCancel", event);
        }
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
        
    var startEvent;
    var swipeTriggered = false;

    this.addAppListener(pointerDownName, pointerDownBind);
    this.addAppListener(pointerMoveName, pointerMoveBind);
    this.addAppListener(pointerUpName, pointerUpBind);
    this.addAppListener(pointerCancelName, pointerCancelBind);
    
    function pointerDown(event) {
      // event.changedTouches is undefined in IE 11.
      // If there are several touch points at the same time, each of them will fire 
      // the pointerdown event individually.
      var touchCopy = this.copyTouch(event);
      this.touchStartTouchList.push(touchCopy);
      this.tapStart();
      startEvent = event;
      swipeTriggered = false;
    }
    
    function pointerMove(event) {
      // The 'touch' event not started.
      if (this.touchStartTouchList.length === 0) {
        return false;
      }
      var firstTouchStartEvent = this.touchStartTouchList[0];
      // We only handle the first touch point.
      if (firstTouchStartEvent.identifier !== event.pointerId) {
        return false;
      }
      if (!swipeTriggered) {
        this.trigger("swipeStart", startEvent);
        swipeTriggered = true;
      }
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
    
    function pointerUp(event) {
      var firstTouchStartEvent = this.touchStartTouchList[0];
      if (!firstTouchStartEvent) {
        return false;
      }
      var idx = ongoingTouchIndexById(event.pointerId, this.touchStartTouchList);
      if (idx === -1) {
        return false;
      } else if (idx === 0) {
        if (this.isTapEvent(firstTouchStartEvent, event)) {
          this.trigger("tap", event);
          event.preventDefault();
        } else {
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
            if (swipeTriggered) {
              this.trigger("swipeCancel", event);
            }
          }
        }
      }
      this.touchStartTouchList.splice(idx, 1);
    }
    
    function pointerCancel(event) {
      this.touchStartTouchList.length = 0;
      if (swipeTriggered) {
        this.trigger("swipeCancel", event);
      }
    }
    
  };
  
  TouchObject.prototype.bindTouchEvents = function() {
    var element = this.element,
        elementListeners = this.elementListeners;
        
    var startEvent;
    var swipeTriggered = false;

    var touchStartBind = touchStart.bind(this),
        touchMoveBind = touchMove.bind(this),
        touchEndBind = touchEnd.bind(this),
        touchCancelBind = touchCancel.bind(this);
        
    this.addAppListener("touchstart", touchStartBind);
    this.addAppListener("touchmove", touchMoveBind);
    this.addAppListener("touchend", touchEndBind);
    this.addAppListener("touchleave", touchEndBind);
    this.addAppListener("touchcancel", touchCancelBind);
    
    function touchStart(event) {
      if (this.isTouchFixedNeeded) {
        event.preventDefault();
      }
      var touches = event.changedTouches;
      for (var i = 0; i < touches.length; i++) {
        var touchCopy = this.copyTouch(touches[i]);
        this.touchStartTouchList.push(touchCopy);
      }
      this.tapStart();
      startEvent = touches[0];
      swipeTriggered = false;
    }
    
    function touchMove(event) {
      if (this.touchStartTouchList.length === 0) {
        return false;
      }
      var touches = event.changedTouches;
      var firstTouchStartEvent = this.touchStartTouchList[0];
      var index = ongoingTouchIndexById(firstTouchStartEvent.identifier, touches);
      if (index === -1) {
        return false;
      }
      // Dispatch the swipeStart event if needed.
      if(!swipeTriggered) {
        this.trigger("swipeStart", startEvent);
        swipeTriggered = true;
      }
      var touchEvent = touches[index];
      var movedPageX = touchEvent.pageX - firstTouchStartEvent.pageX;
      var movedPageY = touchEvent.pageY - firstTouchStartEvent.pageY;
      var eventObj = this.copyTouch(touchEvent);
      eventObj.detail = {
        movedPageX: movedPageX,
        movedPageY: movedPageY
      };
      this.trigger("swipeProgress", eventObj);
    }
    
    function touchEnd(event) {
      var touches = event.changedTouches;
      var firstTouchStartEvent = this.touchStartTouchList[0];
      for (var i = 0, len = touches.length; i < len; i++) {
        var idx = ongoingTouchIndexById(touches[i].identifier, this.touchStartTouchList);
        if (idx >= 0) {
          this.touchStartTouchList.splice(idx, 1);
        }
      }
      
      // If there are multiple touch points at a time, we always track the first one.
      var index = ongoingTouchIndexById(firstTouchStartEvent.identifier, touches);
      if (index === -1) {
        return false;
      }
    
      var touchEvent = touches[index];

      if (this.isTapEvent(firstTouchStartEvent, touchEvent)) {
        var touchEventCopy = this.copyTouch(touchEvent);
        this.trigger("tap", touchEventCopy);
        event.preventDefault();
        return false;
      }
    
      var touchX = firstTouchStartEvent.clientX,
          nowX = touchEvent.clientX,
          touchY = firstTouchStartEvent.clientY,
          nowY = touchEvent.clientY;
          
      var movX = Math.abs(touchX - nowX);
      var movY = Math.abs(touchY - nowY);
      
      if (movX > this.horizontalOffset || movY > this.verticalOffset) {
        this.trigger("swipe", touchEvent);
        var direction = swipeDirection(touchX, nowX, touchY, nowY);
        this.trigger("swipe" + direction, touchEvent);
      } else {
        if (swipeTriggered) {
          this.trigger("swipeCancel", touchEvent);
        }
      }
    
    }
    
    function touchCancel(event) {
      var touches = event.changedTouches;
      for (var i = 0, len = touches.length; i < len; i++) {
        var idx = ongoingTouchIndexById(touches[i].identifier, this.touchStartTouchList);
        if (idx >= 0) {
          this.touchStartTouchList.splice(idx, 1);
        }
      }
    }
    
  };
  
  /**
   * Copy a touch point.
   * @param {Touch} touch - An individual touch point.
   * @return {Object}
   */
  TouchObject.prototype.copyTouch = function(touch) {
    return {
      "identifier": touch.identifier || touch.pointerId || 0,
      "target": touch.target || null,
      "pageX": touch.pageX,
      "pageY": touch.pageY,
      "clientX": touch.clientX,
      "clientY": touch.clientY,
      "screenX": touch.screenX,
      "screenY": touch.screenY
    };
  };
  
  TouchObject.prototype.bindEvents = function() {
    var contextmenuHandler = function(event) {
      event.preventDefault();
    };
    this.addAppListener("contextmenu", contextmenuHandler);
    
    if (window.MSGesture) {
      this.touchType = "gesture";
      this.bindGestureEvents();
    } else if (window.PointerEvent || window.navigator.msPointerEnabled) {
      this.touchType = "pointer";
      this.bindPointerEvents();
    } else if (('ontouchstart' in document.documentElement) || ('ontouchstart' in window)){
      this.touchType = "touch";
      this.bindTouchEvents();
    } else {
      this.touchType = "mouse";
      this.bindMouseEvents();
    }
  };
  
  TouchObject.prototype.bindGestureEvents = function() {
    var element = this.element;
    // MSGesture object https://msdn.microsoft.com/en-us/library/hh968249%28v=vs.85%29.aspx
    var myGesture = new MSGesture();
    
    myGesture.target = element;
    var pointerId;
    
    var guestureStartBind = guestureStart.bind(this),
        gestureChangeBind = gestureChange.bind(this),
        gestureEndBind = gestureEnd.bind(this),
        tapHandlerBind = tapHandler.bind(this),
        handlePointerDown = function(event) {
          event.target.setPointerCapture(event.pointerId);
          pointerId = event.pointerId;
          myGesture.addPointer(event.pointerId);
        };
    
    this.addAppListener("MSGestureStart", guestureStartBind);
    this.addAppListener("MSGestureChange", gestureChangeBind);
    this.addAppListener("MSGestureEnd", gestureEndBind);
    this.addAppListener("MSGestureTap", tapHandlerBind);
    this.addAppListener("pointerdown", handlePointerDown);
    
    function tapHandler(event) {
      this.touchStartTouchList.length = 0;
      this.trigger("tap", event);
    }
    
    function guestureStart(event) {
      var touchCopy = this.copyTouch(event);
      touchCopy.identifier = pointerId;
      
      this.touchStartTouchList.push(touchCopy);
      this.trigger("swipeStart", event);
    }
    
    function gestureChange(event) {
      // Trigger gestureEnd handler immediately if a gesture is in its inertia phase.
      if (event.detail === event.MSGESTURE_FLAG_INERTIA) {
        gestureEndBind(event);
        return false;
      }
      // The 'touch' event not started.
      if (this.touchStartTouchList.length === 0) {
        return false;
      }
      var firstTouchStartEvent = this.touchStartTouchList[0];
      // We only handle the first touch point.
      var nowClientX = event.clientX,
          nowClientY = event.clientY,
          movedClientX = nowClientX - firstTouchStartEvent.clientX,
          movedClientY = nowClientY - firstTouchStartEvent.clientY;
          
      var eventObj = {
        pageX: event.pageX, // undefined
        pageY: event.pageY, // undefined
        clientX: nowClientX,
        clientY: nowClientY,
        screenX: event.screenX,
        screenY: event.screenY,
        detail: {'movedPageX':  movedClientX, 'movedPageY': movedClientY}
      };
      this.trigger("swipeProgress", eventObj);
    }
    
    function gestureEnd(event) {
      var firstTouchStartEvent = this.touchStartTouchList[0];
      if (!firstTouchStartEvent) {
        return false;
      }

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
      this.touchStartTouchList.length = 0;
      
    }
    
    
  };
  
  /**
   * Add event listener for the DOM element user specified.
   * @param {string} eventName - A string representing the event type to listen for.
   * @param {function} callback - The function receives a notification when an event of the specified type occurs.
   */
  TouchObject.prototype.addEventListener = function(eventName, callback) {
    //EventsObject.on(eventName, callback);
    this.element.addEventListener(eventName, callback);
  }
  
  TouchObject.prototype.trigger = function(eventName, customData) {
    //EventsObject.trigger(eventName, customData);
    var event = new CustomEvent(eventName, {
      detail: customData || null
    });
    this.element.dispatchEvent(event);
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

  function approximatelyEqual(x, y) {
    return Math.abs(x - y) < 2;
  }
  
  function ongoingTouchIndexById(idToFind, touches) {
    for (var i=0; i < touches.length; i++) {
      var id = touches[i].identifier;
      
      if (id == idToFind) {
        return i;
      }
    }
    return -1;    // not found
  }
  
  function isAndroidBrowser() {
    var ua = navigator.userAgent;
    // The user agent string of IE mobile v11 on Windows Phone 8.1 contains "Android"
    if (ua.match(/MSIE|Trident/)) {
      return false;
    }
    return (ua.indexOf("Android") >= 0) || (ua.indexOf("android") >= 0);
  }
  
   /**
   * Get 2 digit version of Android
   */
  function getAndroidVersion() {
    var ua = navigator.userAgent;
    return parseFloat(ua.slice(ua.indexOf("Android")+8)).toFixed(1);
  }
  
  // Polyfill for Function.prototype.bind
  // This feature is not supported natively on some platforms, such as Android 2.3.5
  // from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
  if (!Function.prototype.bind) {
    Function.prototype.bind = function(oThis) {
      if (typeof this !== 'function') {
        // closest thing possible to the ECMAScript 5
        // internal IsCallable function
        throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
      }

      var aArgs   = Array.prototype.slice.call(arguments, 1),
          fToBind = this,
          fNOP    = function() {},
          fBound  = function() {
            return fToBind.apply(this instanceof fNOP
                   ? this
                   : oThis,
                   aArgs.concat(Array.prototype.slice.call(arguments)));
          };

      fNOP.prototype = this.prototype;
      fBound.prototype = new fNOP();

      return fBound;
    };
  }
  
  (function () {
    function CustomEvent ( event, params ) {
      params = params || { bubbles: true, cancelable: true, detail: undefined };
      if (typeof params.bubbles === "undefined") {
        params.bubbles = true;
      }
      if (typeof params.cancelable === "undefined") {
        params.cancelable = true;
      }
      var evt;
      try{
        // DOM Level 3 Events support custom event.
        evt = document.createEvent('CustomEvent');
        evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
      }catch(e) {
        // DOM Level 2 Events does not support custom event.
        evt = document.createEvent('Event');
        evt.initEvent(event, params.bubbles, params.cancelable);
        evt.detail = params.detail;
      }
      return evt;
    }
    CustomEvent.prototype = window.Event.prototype;
    window.CustomEvent = CustomEvent;  
  })();
  
  if (typeof define === "function" && (define.amd || define.cmd)) {
    define(function(){
      return TouchObject;
    });
  } else {
    window.TouchObject = TouchObject;
  }
  
})());
