window.onload = function(){
  var el = document.body;
  var touchObj = new TouchObject(el);

  QUnit.test("Constructor Test", function(assert) {
    assert.ok(touchObj, "TouchObject constructor function is ok");
  });


  QUnit.module("Events Test");
  QUnit.test("Swipe Test", function(assert) {
    assert.expect(1);
    var done = assert.async();
    el.addEventListener("swipe", fn, false);
    alert("Please swipe the page");

    function fn(e) {
      assert.ok(true, "You swiped the page.");
      done();
      el.removeEventListener("swipe", fn, false);
    }
  });

  QUnit.test("Swipe Left Test", function(assert) {
    assert.expect(1);
    var done = assert.async();
    el.addEventListener("swipeLeft", fn, false);
    alert("Please swipe left with a long distance");

    function fn(e) {
      assert.ok(true, "You swiped left the page.");
      done();
      el.removeEventListener("swipeLeft", fn, false);
    }
  });

  QUnit.test("Swipe Right Test", function(assert) {
    assert.expect(1);
    var done = assert.async();
    el.addEventListener("swipeRight", fn, false);
    alert("Please swipe right the page");

    function fn(e) {
      assert.ok(true, "You swiped right the page.");
      done();
      el.removeEventListener("swipeRight", fn, false);
    }
  });

  QUnit.test("Swipe Up Test", function(assert) {
    assert.expect(1);
    var done = assert.async();
    el.addEventListener("swipeUp", fn, false);
    alert("Please swipe up the page");

    function fn(e) {
      assert.ok(true, "You swiped up the page.");
      done();
      el.removeEventListener("swipeUp", fn, false);
    }
  });

  QUnit.test("Swipe Down Test", function(assert) {
    assert.expect(1);
    var done = assert.async();
    el.addEventListener("swipeDown", fn, false);
    alert("Please swipe down the page");

    function fn(e) {
      assert.ok(true, "You swiped down the page.");
      done();
      el.removeEventListener("swipeDown", fn, false);
    }
  });

  QUnit.test("SwipeCancel Test", function(assert) {
    assert.expect(1);
    var done = assert.async();
    el.addEventListener("swipeCancel", fn, false);
    alert("Please swipe the page with a very short distance");

    function fn(e) {
      assert.ok(true, "You swipe action is canceled.");
      done();
      el.removeEventListener("swipeCancel", fn, false);
    }
  });
  QUnit.test("Tap Test", function(assert) {
    assert.expect(1);
    var done = assert.async();
    el.addEventListener("tap", fn, false);
    alert("Please tap on the page.");

    function fn(e) {
      assert.ok(true, "You tapped on the page.");
      done();
      el.removeEventListener("tap", fn, false);
    }
  });


  QUnit.module("Methods Tests");
  QUnit.test("Dispose test", function(assert) {
    touchObj.dispose();
    assert.strictEqual(touchObj.elementListeners.length, 0, "All event listeners were removed.");
  });

};
