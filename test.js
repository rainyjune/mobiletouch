window.onload = function(){
  var number = 0;
  
  function log(msg) {
    document.querySelector("#debug").innerHTML = msg;
  }
  
  var testDiv = document.getElementById("testDiv");
  testDiv.addEventListener("swipeStart", function(e){
    number = 0;
    log(number);
    log("swipeStart");
  });
  testDiv.addEventListener("swipeLeft", function(e){
    console.log("swipeLeft", e);
    log("swipeLeft");
  });
  testDiv.addEventListener("swipeRight", function(e){
    //alert("sss");
     console.log("swipeRight", e);
    log("swipeRight");
  })
  
  testDiv.addEventListener("swipeUp", function(e){
    //alert("sss");
     console.log("swipeUp", e);
    log("swipeUp");
  })
  testDiv.addEventListener("swipeDown", function(e){
    //alert("sss");
     console.log("swipeDown", e);
    log("swipeDown");
  })
  
  testDiv.addEventListener("swipeProgress", function(e) {
    console.log("swipeProgress", e);
    number += 1;
    
    log("" + number + "," + e.detail.movedPageX);
  });
  testDiv.addEventListener("swipeCancel", function(e) {
    log("swipeCancel");
  });
};