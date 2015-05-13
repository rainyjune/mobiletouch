(function(factory){
  if (typeof define !== "undefined" && define.cmd) {
    define(function(require, exports, module){
      var TouchObject = require("touch");
      factory(TouchObject);
    });
  } else {
    factory(TouchObject);
  }
}(function(TouchObject){
  
  window.onload = function(){
    var testDiv = document.getElementById("testDiv");
    var divObj = new TouchObject(testDiv);
    document.querySelector("#touchType").innerHTML = divObj.touchType;
    
    divObj.addEventListener("swipeStart", function(e){
      document.querySelector("#evtName").innerHTML = "swipeStart";
      printEvent(e);
    });
    divObj.addEventListener("swipeLeft", function(e){
      document.querySelector("#evtName").innerHTML = "swipeLeft";
    });
    divObj.addEventListener("swipeRight", function(e){
      document.querySelector("#evtName").innerHTML = "swipeRight";
    })
    
    divObj.addEventListener("swipeUp", function(e){
      document.querySelector("#evtName").innerHTML = "swipeUp";
    })
    divObj.addEventListener("swipeDown", function(e){
      document.querySelector("#evtName").innerHTML = "swipeDown";
    })
    
    divObj.addEventListener("swipeProgress", function(e) {
      document.querySelector("#evtName").innerHTML = "swipeProgress";
      printEvent(e);
    });
    divObj.addEventListener("swipeCancel", function(e) {
      document.querySelector("#evtName").innerHTML = "swipeCancel";
      printEvent(e);
    });
    
    divObj.addEventListener("tap", function(e) {
      document.querySelector("#evtName").innerHTML = "tap";
      printEvent(e);
    });
    
    function printEvent(event) {
      document.querySelector("#movedX").innerHTML = (event.detail.detail && typeof event.detail.detail.movedPageX !== "undefined") ? parseInt(event.detail.detail.movedPageX) + "px" : "&nbsp;";
      document.querySelector("#movedY").innerHTML = (event.detail.detail && typeof event.detail.detail.movedPageY !== "undefined") ? parseInt(event.detail.detail.movedPageY) + "px" : "&nbsp;";
      document.querySelector("#clientX").innerHTML = (typeof event.detail.clientX !== "undefined") ? parseInt(event.detail.clientX) + "px" : "&nbsp;";
      document.querySelector("#clientY").innerHTML = (typeof event.detail.clientY !== "undefined") ? parseInt(event.detail.clientY) + "px" : "&nbsp;";
    }
    /*
    setTimeout(function(){
      divObj.dispose();
      log("dispose");
      setTimeout(function(){
        divObj.bindEvents();
        log("Restarted.");
      }, 5000);
    }, 6000);
    */
  };
}));
