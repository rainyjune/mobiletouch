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
  
  // Put all TouchEvent objects fired in the touchstart event into this array.
  var touchStartTouchList = [];
  
  var isTapLength,
      tapLengthTimeout;
  
  var horizontalOffset = 20,
      verticalOffset = 30;
      
  var isDebug = true;
  //alertMy("ua:" + navigator.userAgent);
  if (window.PointerEvent) { //For Internet Explorer 11
    alertMy("pinterEvent");
    document.addEventListener("pointerdown", pointerDown);
    document.addEventListener("pointermove", pointerMove);
    document.addEventListener("pointerup", pointerUp);
    document.addEventListener("pointercancel", pointerCancel);
  } else if (window.navigator.msPointerEnabled) { // For Internet Explorer 10
    alertMy("IE 10");
    $(document).on("MSPointerDown", pointerDown);
    $(document).on("MSPointerMove", pointerMove);
    $(document).on("MSPointerUp", pointerUp);
    $(document).on("MSPointerCancel", pointerCancel);
  } else if (('ontouchstart' in document.documentElement) || ('ontouchstart' in window)){
    //alertMy("normal2")
    document.addEventListener("touchstart", touchstartHandler, false);
    document.addEventListener("touchmove", touchmoveHandler, false);
    document.addEventListener("touchend", touchendHandler, false);
    document.addEventListener("touchleave", touchendHandler, false);
    document.addEventListener("touchcancel", touchendHandler, false);
  } else {
    alertMy("mouse");
    document.addEventListener("mousedown", mousestartHandler);
    document.addEventListener("mousemove", mousemoveHandler);
    document.addEventListener("mouseup", mouseEndHandler);
    document.addEventListener("mouseleave", mouseEndHandler);
  }
  
  function mousestartHandler(event) {
    touchStartTouchList.push({
      "identifier": 0,
      "pageX": event.pageX,
      "pageY": event.pageY,
      "clientX": event.clientX,
      "clientY": event.clientY,
      "screenX": event.screenX,
      "screenY": event.screenY
    });
    
    var el = event.target || document;
    trigger(el, "swipeStart");
  }
  
  function mousemoveHandler(event) {
    // The 'touch' event not started.
    if (touchStartTouchList.length === 0) {
      return false;
    }
    var firstTouchStartEvent = touchStartTouchList[0];
    
    var nowPageX = event.pageX;
    var nowPageY = event.pageY;
    
    var movedPageX = nowPageX - firstTouchStartEvent.pageX;
    var movedPageY = nowPageY - firstTouchStartEvent.pageY;
    
    var el = event.target || document;
    
    trigger(el, "swipeProgress", {'movedPageX': movedPageX, 'movedPageY': movedPageY});
  }
  
  function mouseEndHandler(event) {
    var firstTouchStartEvent = touchStartTouchList[0];
    
    touchStartTouchList.length = 0;
    
    var touchX = firstTouchStartEvent.clientX,
        nowX = event.clientX,
        touchY = firstTouchStartEvent.clientY,
        nowY = event.clientY;
        
    var movX = Math.abs(touchX - nowX);
    var movY = Math.abs(touchY - nowY);
    
    var el = event.target || document;
    if (movX > horizontalOffset || movY > verticalOffset) {
      trigger(el, "swipe");
      var direction = swipeDirection(touchX, nowX, touchY, nowY);
      trigger(el, "swipe" + direction);
    } else {
      trigger(el, "swipeCancel");
    }
  }
  
  function touchstartHandler(event) {
    var touches = event.changedTouches;
    for (var i = 0, len = touches.length; i < len; i++) {
      var touchCopy = copyTouch(touches[i]);
      touchStartTouchList.push(touchCopy);
    }
    tapStart();
    var el = event.target || document;
    trigger(el, "swipeStart");
  }
  
  function touchmoveHandler(event) {
    var touches = event.changedTouches;
    var firstTouchStartEvent = touchStartTouchList[0];
    // If there are multiple touch points at a time, we always track the first one.
    var index = identifiedTouch(firstTouchStartEvent.identifier, touches);
    if (index === -1) {
      return false;
    }
    var touchEvent = touches[index];
    var el = event.target || document; 
    var movedPageX = touchEvent.pageX - firstTouchStartEvent.pageX;
    var movedPageY = touchEvent.pageY - firstTouchStartEvent.pageY;
    trigger(el, "swipeProgress", {'movedPageX': movedPageX, 'movedPageY': movedPageY});
  }
  
  function touchendHandler(event) {
    var isTap = tapEnd(event);
    if (isTap) {
      return false;
    }
    
    var touches = event.changedTouches;
    var firstTouchStartEvent = touchStartTouchList[0];
    
    for (var i = 0, len = touches.length; i < len; i++) {
      var idx = identifiedTouch(touches[i].identifier);
      if (idx >= 0) {
        touchStartTouchList.splice(idx, 1);
      }
    }
    
    // If there are multiple touch points at a time, we always track the first one.
    var index = identifiedTouch(firstTouchStartEvent.identifier, touches);
    if (index === -1) {
      return false;
    }
    var touchEvent = touches[index];
    
    var touchX = firstTouchStartEvent.clientX,
        nowX = touchEvent.clientX,
        touchY = firstTouchStartEvent.clientY,
        nowY = touchEvent.clientY;
        
    var movX = Math.abs(touchX - nowX);
    var movY = Math.abs(touchY - nowY);
    
    var el = event.target || document;
    if (movX > horizontalOffset || movY > verticalOffset) {
      trigger(el, "swipe");
      var direction = swipeDirection(touchX, nowX, touchY, nowY);
      trigger(el, "swipe" + direction);
    } else {
      trigger(el, "swipeCancel");
    }
  }
  
  /* Windows Devices */
  
  function pointerDown(event) {
    initAllVar();
    
    touchX = event.clientX;
    touchY = event.clientY;
    startPageX = event.pageX;
    startPageY = event.pageY;
    
    nowPageX = event.pageX;
    nowPageY = event.pageY;
    tapStart();
    
    var el = event.target || document;
    trigger(el, "swipeStart");
  }
  function pointerMove(event) {
    nowX = event.clientX;
    nowY = event.clientY;
    nowPageX = event.pageX,
    nowPageY = event.pageY;
    movedPageX = nowPageX - startPageX;
    movedPageY = nowPageY - startPageY;
    
    var el = event.target || document;
    trigger(el, "swipeProgress", {'movedPageX': movedPageX, 'movedPageY': movedPageY});
  }
  function pointerUp(event) {
    var isTap = tapEnd(event);
    if (isTap) {
      return false;
    }
    if (nowX === null || nowY === null) {
      return ;
    }
    
    movX = Math.abs(touchX - nowX);
    movY = Math.abs(touchY - nowY);
    var el = event.target || document;
    if (movX > horizontalOffset || movY > verticalOffset) {
      trigger(el, "swipe");
      trigger(el, "swipe" + (swipeDirection(touchX, nowX, touchY, nowY)));
    } else {
      trigger(el, "swipeCancel");
    }
  }
  function pointerCancel(event) {
    pointerUp(event);
  }

  function swipeDirection(x1, x2, y1, y2) {
    return Math.abs(x1 - x2) >= Math.abs(y1 - y2) ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down');
  }
  
  function alertMy(string) {
    if (isDebug) {
      alert(string);
    }
  }
  
  function approximatelyEqual(a, b) {
    return Math.abs(a - b) < 2;
  }
  
  function tapStart() {
    isTapLength = true;
    if (tapLengthTimeout) {
      clearTimeout(tapLengthTimeout);
    }
    tapLengthTimeout = setTimeout(function () {
      isTapLength = false;
    }, 200);
  }
  
  function tapEnd(event) {
    var el = event.target || document;
    if (isTapLength && approximatelyEqual(startPageX, nowPageX) && approximatelyEqual(startPageY, nowPageY)) {
      event.preventDefault();
      trigger(el, "tap");
      return true;
    }
    return false;
  }
   
  /* Polyfill from https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent */
  (function () {
    function CustomEvent ( event, params ) {
      params = params || { bubbles: true, cancelable: true, detail: undefined };
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
  
  function trigger(element, eventName, customData) {
    var event;
    event = new CustomEvent(eventName, {'detail': customData});
    element.dispatchEvent(event);
  }
  
  function copyTouch(touch) {
    return {
      "identifier": touch.identifier,
      "pageX": touch.pageX,
      "pageY": touch.pageY,
      "clientX": touch.clientX,
      "clientY": touch.clientY,
      "screenX": touch.screenX,
      "screenY": touch.screenY
    };
  }
  
  function identifiedTouch(identifier, touchList) {
    touchList = touchList || touchStartTouchList;
    for (var i = 0, len = touchList.length; i < len; i++) {
      if (touchList[i].identifier === identifier) {
        return i;
      }
    }
    return -1;
  }
  
}));