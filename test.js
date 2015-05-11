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
      document.querySelector("#movedX").innerHTML = "&nbsp;";
      document.querySelector("#movedY").innerHTML = "&nbsp;";
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
      document.querySelector("#movedX").innerHTML = parseInt(e.detail.movedPageX) + "px";
      document.querySelector("#movedY").innerHTML = parseInt(e.detail.movedPageY) + "px";
    });
    divObj.addEventListener("swipeCancel", function(e) {
      document.querySelector("#evtName").innerHTML = "swipeCancel";
    });
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