/***
 * A standalone touch library for mobile devices.
 * @author rainyjune <rainyjune@live.cn>
 */
// Note:
// 1. The touchend event is not trigged on some android stock browsers before 4.1 Jelly Bean.
//      See: https://code.google.com/p/android/issues/detail?id=19827
//      The solution: https://code.google.com/p/android/issues/detail?id=19827#c38
// 2. [IE Bug]pointerup event is fired automatically when pinterdown is held on IE 11 (Windows Phone 8.1)
//      See: https://connect.microsoft.com/IE/feedback/details/1076515/mouseup-pointerup-events-are-fired-automatically-when-mouse-or-pointerdown-are-held-windows-phone-8-1-ie11
//      
// Resources
// 1. Pointer and gesture events in Internet Explorer 10 (http://msdn.microsoft.com/en-us/library/ie/hh673557(v=vs.85).aspx)
// 2. Pointer events updates (https://msdn.microsoft.com/en-us/library/ie/dn304886%28v=vs.85%29.aspx)
// 3. https://github.com/Tyriar/touchtap-event.js

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
    trigger(el, "swipeStartMy");
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
    
    trigger(el, "swipeProgressMy", {'movedPageX': movedPageX, 'movedPageY': movedPageY});
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
    trigger(el, "swipeStartMy");
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
    trigger(el, "swipeProgressMy", {'movedPageX': movedPageX, 'movedPageY': movedPageY});
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
      trigger(el, "swipeMy");
      trigger(el, "swipe" + (swipeDirection(touchX, nowX, touchY, nowY)) + "My");
    } else {
      trigger(el, "swipeCancelMy");
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
    trigger(el, "swipeStartMy");
  }
  function pointerMove(event) {
    nowX = event.clientX;
    nowY = event.clientY;
    nowPageX = event.pageX,
    nowPageY = event.pageY;
    movedPageX = nowPageX - startPageX;
    movedPageY = nowPageY - startPageY;
    
    var el = event.target || document;
    trigger(el, "swipeProgressMy", {'movedPageX': movedPageX, 'movedPageY': movedPageY});
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
      trigger(el, "swipeMy");
      trigger(el, "swipe" + (swipeDirection(touchX, nowX, touchY, nowY)) + "My");
    } else {
      trigger(el, "swipeCancelMy");
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
      trigger(el, "tapMy");
      return true;
    }
    return false;
  }
   
  /* Polyfill from https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent */
  (function () {
    try {
      new CustomEvent("touch");
    } catch(e) {
      function CustomEvent ( event, params ) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        var evt = document.createEvent( 'CustomEvent' );
        evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
        return evt;
      }

      CustomEvent.prototype = window.Event.prototype;

      window.CustomEvent = CustomEvent;
    }    
  })();
  
  function trigger(element, eventName, customData) {
    var event;
    
    if (customData) {
      event = new CustomEvent(eventName, {'detail': customData});
    } else {
      event = new CustomEvent(eventName);
    }
    element.dispatchEvent(event);
  }
  
}));