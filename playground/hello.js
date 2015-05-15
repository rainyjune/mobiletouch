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
}

function $(selector) {
  return document.querySelector(selector);
}
