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
    var number = 0;
    
    function log(msg) {
      document.querySelector("#debug").innerHTML = msg;
    }
    window.log = log;
    
    var testDiv = document.getElementById("testDiv");
    
    var divObj = new TouchObject(testDiv);
    
    divObj.addEventListener("swipeStart", function(e){
      number = 0;
      log(number);
      log("swipeStart");
    });
    divObj.addEventListener("swipeLeft", function(e){
      console.log("swipeLeft", e);
      log("swipeLeft");
    });
    divObj.addEventListener("swipeRight", function(e){
      //alert("sss");
       console.log("swipeRight", e);
      log("swipeRight");
    })
    
    divObj.addEventListener("swipeUp", function(e){
      //alert("sss");
       console.log("swipeUp", e);
      log("swipeUp");
    })
    divObj.addEventListener("swipeDown", function(e){
      //alert("sss");
       console.log("swipeDown", e);
      log("swipeDown");
    })
    
    divObj.addEventListener("swipeProgress", function(e) {
      console.log("swipeProgress", e);
      number += 1;
      
      log("" + e.detail.movedPageX + "," + e.detail.movedPageY);
    });
    divObj.addEventListener("swipeCancel", function(e) {
      log("swipeCancel");
    });
    
    setTimeout(function(){
      divObj.dispose();
      log("dispose");
      setTimeout(function(){
        divObj.bindEvents();
        log("Restarted.");
      }, 5000);
    }, 6000);
  };
}));