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
  
  /* The coordinates relative to the viewport (clientX, cientY) */
  var touchX = null, touchY = null, nowX = null, nowY = null, movX, movY;
  /* The coordinates relative to the <html> element (pageX, pageY) */
  var startPageX, startPageY, nowPageX, nowPageY, movedPageX, movedPageY;
  
  var isTapLength,
      tapLengthTimeout;
  
  var horizontalOffset = 20,
      verticalOffset = 30;
      
  var isDebug = false;
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
    alertMy("normal2")
    document.addEventListener("touchstart", touchstartHandler, false);
    document.addEventListener("touchmove", touchmoveHandler, false);
    document.addEventListener("touchend", touchendHandler, false);
    document.addEventListener("touchleave", touchendHandler, false);
    document.addEventListener("touchcancel", touchendHandler, false);
  } else {
    alertMy("mouse");
    document.addEventListener("mousedown", mousestartHandler);
    document.addEventListener("mousemove", mousemoveHandler);
    document.addEventListener("mouseup", touchendHandler);
    document.addEventListener("mouseleave", touchendHandler);
  }
  
  function mousestartHandler(event) {
    initAllVar();
    
    startPageX = event.pageX;
    startPageY = event.pageY;
    
    touchX = event.clientX;
    touchY = event.clientY;
    
    nowPageX = event.pageX;
    nowPageY = event.pageY;
    tapStart();
    
    var el = event.target || document;
    trigger(el, "swipeStart");
  }
  
  function mousemoveHandler(event) {
    if (touchX === null || touchY === null) return ;
    nowPageX = event.pageX,
    nowPageY = event.pageY;
    
    nowX = event.clientX,
    nowY = event.clientY;
    
    movedPageX = nowPageX - startPageX;
    movedPageY = nowPageY - startPageY;
    
    var el = event.target || document;
    
    trigger(el, "swipeProgress", {'movedPageX': movedPageX, 'movedPageY': movedPageY});
  }
  
  function touchstartHandler(event) {
    initAllVar();
    
    startPageX = event.touches[0].pageX;
    startPageY = event.touches[0].pageY;
    
    touchX = event.touches[0].clientX;
    touchY = event.touches[0].clientY;
    
    nowPageX = event.touches[0].pageX;
    nowPageY = event.touches[0].pageY;
    tapStart();
    
    var el = event.target || document;
    trigger(el, "swipeStart");
  }
  
  function touchmoveHandler(event) {
    nowPageX = event.touches[0].pageX,
    nowPageY = event.touches[0].pageY;
    
    nowX = event.touches[0].clientX,
    nowY = event.touches[0].clientY;
    
    movedPageX = nowPageX - startPageX;
    movedPageY = nowPageY - startPageY;
    
    /* 
     * Magic code
     * Use it to make sure the swipeProgressMy event is triggered as expected on some devices, such as Android 2.3.5 and Android 4.4.2
     */
    if (Math.abs(nowX - touchX) > 10 && Math.abs(nowY - touchY) < 25) {
      event.preventDefault();
    }
    
    var el = event.target || document; 
    trigger(el, "swipeProgress", {'movedPageX': movedPageX, 'movedPageY': movedPageY});
  }
  
  function touchendHandler(event) {
    var isTap = tapEnd(event);
    if (isTap) {
      return false;
    }
    // Why null ?
    if (nowX === null || nowY === null) {
      initAllVar();
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
    initAllVar();
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
  
  function initAllVar() {
    touchX = null,
    touchY = null,
    movX = null,
    movY = null,
    nowX = null,
    nowY = null;
    
    startPageX = null;
    startPageY = null;
    nowPageX = null;
    nowPageY = null;
    movedPageX = null;
    movedPageY = null;
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
  
}));