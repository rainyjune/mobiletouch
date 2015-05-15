window.addEventListener("load", initPage, false);
var touchableElement;
function initPage() {
  touchableElement = document.getElementById("touchable"); 
  touchableElement.addEventListener("touchstart", log, false);
  touchableElement.addEventListener("touchmove", log, false);
  touchableElement.addEventListener("touchcancel", log, false);
  touchableElement.addEventListener("touchend", log, false);
}

function log(touchEvent) {
  $("#type").innerHTML = touchEvent.type;
  $("#touches").innerHTML = touchEvent.touches.length;
  $("#targetTouches").innerHTML = touchEvent.targetTouches.length;
  $("#changedTouches").innerHTML = touchEvent.changedTouches.length;

  if (touchEvent.touches.length) {
    var str = "";
    for (var i = 0; i < touchEvent.touches.length; i++) {
      str += generateTouchEventDom(touchEvent.touches[i]).innerHTML;
    }
    $("#touchesInfo").innerHTML = str;
  } else {
    $("#touchesInfo").innerHTML = "";
  }
}

function $(selector) {
  return document.querySelector(selector);
}

function generateTouchEventDom(touchEvent) {
  var dom = $("#touch-template").cloneNode(true);
  dom.querySelector(".identifier").innerHTML = touchEvent.identifier;
  dom.querySelector(".target").innerHTML = touchEvent.target.tagName;
  dom.querySelector(".screenX").innerHTML = touchEvent.screenX;
  dom.querySelector(".screenY").innerHTML = touchEvent.screenY;
  dom.querySelector(".clientX").innerHTML = touchEvent.clientX;
  dom.querySelector(".clientY").innerHTML = touchEvent.clientY;
  dom.querySelector(".pageX").innerHTML = touchEvent.pageX;
  dom.querySelector(".pageY").innerHTML = touchEvent.pageY;
  return dom;
}
