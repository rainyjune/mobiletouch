window.onload = function(){
  var number = 0;
  
  function showNumber(newNumber) {
    document.querySelector("#debug").innerHTML = newNumber;
  }
  
  var testDiv = document.getElementById("testDiv");
  testDiv.addEventListener("swipeStart", function(e){
    number = 0;
    showNumber(number);
    //alert("swipeStart");
  });
  testDiv.addEventListener("swipeLeft", function(e){
    console.log("swipeLeft", e);
    alert("swipeLeft");
  });
  testDiv.addEventListener("swipeRight", function(e){
    //alert("sss");
     console.log("swipeRight", e);
    alert("swipeRight");
  })
  
  testDiv.addEventListener("swipeUp", function(e){
    //alert("sss");
     console.log("swipeUp", e);
    alert("swipeUp");
  })
  testDiv.addEventListener("swipeDown", function(e){
    //alert("sss");
     console.log("swipeDown", e);
    alert("swipeDown");
  })
  
  testDiv.addEventListener("swipeProgress", function(e) {
    console.log("swipeProgress", e);
    number += 1;
    
    showNumber("" + number + "," + e.detail.movedPageX);
  });
  testDiv.addEventListener("swipeCancel", function(e) {
    alert("swipeCancel");
  });
};