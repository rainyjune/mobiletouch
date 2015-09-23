/* global Zepto */

﻿(function(factory){
  var $ = (typeof Zepto !== "undefined") ? Zepto : jQuery;
  factory($);
})(function ($) {
  function Css3Rotator(element, options) {
    var defaults = {
      container: '.rotatorWrapper',
      transitionDuration: '5s',
      slideWidth: element.width(),
      aspectRatio: 2, // Width/Height
      transitonInterval: '2000',
      pauseAfterTransition: true,
      loop: false,
      autoPlay: true
    };
    
    var currentTranslateXValue = null;
    
    var mergedOptions = $.extend(defaults, options);

    var transitionEndEventName = getTransitionEndEventName();
    var slideCount = 0, // Original count, starts from 0.
        pageIndex = 0, // Original index, starts from 0.
        slideDisplayCount = 0, // Display page count, start from 0.
        slidePageIndex = 0, // Display page index, start from 0, defaults to 0.
        slideContainer = null,
        slides = null,
        indicators = null,
        timer = null;

    var slidePageWidth;
    var autoPlayFinished;
    
    init();

    function init() {
      element.addClass("rotatorRootElement"); // add class
      setSlideRootHeight();// Set aspect ratio
      slideContainer = element.find(mergedOptions.container); // Find the list
      slideContainer.addClass("rotatorWrapper").addClass("flex-it");
      addSliderItems();
      slides = slideContainer.children();
      slideCount = slides.length;
      if (mergedOptions.loop) {
        addDuplicatePages();
        slidePageIndex = 1;
      }
      slideDisplayCount = slideContainer.children().size();
      var slideContainerWidth = slideDisplayCount + "00%";
      if (mergedOptions.slideWidth !== element.width()) {
        slideContainerWidth = mergedOptions.slideWidth * slideDisplayCount;
      }
      slideContainer.width(slideContainerWidth);
      
      slidePageWidth = slideContainer.children().eq(0).width();
      
      if (mergedOptions.loop) {
        setTranslateXValue(-mergedOptions.slideWidth + 'px'); //add
        currentTranslateXValue = - mergedOptions.slideWidth;
      }
      
      addIndicator();
      bindEvents();
      setTimeout(function(){
        setTransitionDuration();
        setAutoPlay();
      }, 0);
    }
    
    function setAutoPlay() {
      if (mergedOptions.autoPlay) {
        timer = setTimeout(autoPlay, mergedOptions.transitonInterval);
      }
    }
    
    function addSliderItems() {
      var dataSource = mergedOptions.dataSource;
      if (dataSource && $.isArray(dataSource)) {
        var items = [];
        $.each(dataSource, function(index, item){
          items.push(getSliderItemString(item));
        });
        slideContainer.append(items.join(''));
      }
    }
    
    function getSliderItemString(itemData) {
      var itemDom = $("#slider-item-template").clone().find("li");
      itemDom.css('background-image', 'url(' + itemData.img + ')');
      itemDom.find("a").attr('data-href', itemData.link);
      itemDom.find('h2').text(itemData.title);
      return itemDom.prop('outerHTML');
    }
    
    function addDuplicatePages() {
      var oldPages = slideContainer.children();
      var firstOldPage = oldPages.eq(0);
      var lastOldPage = oldPages.eq(-1);
      slideContainer.prepend(lastOldPage.clone());
      slideContainer.append(firstOldPage.clone());
    }
    
    function prev() {
      slidePage(false);
    }
    
    function next() {
      slidePage(true);
    }
    
    function slidePage(isNext) {
      updateSlideIndex(isNext);
      setTranslateXValue();
    }
    
    function autoPlay() {
      if (mergedOptions.autoPlay) {
        if (autoPlayFinished) {
          window.clearTimeout(timer);
          return false;
        }
        if (slidePageIndex === slideDisplayCount -1 ) {
          if (!mergedOptions.loop) {
            autoPlayFinished = true;
            window.clearTimeout(timer);
            return false;
          }
          disableTransitionDuration();
          slidePageIndex = 1;
          setTranslateXValue();
 
          setTimeout(function(){
            enableTransitionDuration();
            next();
          }, 0);
        } else if (slidePageIndex === 0) {
          disableTransitionDuration();
          if (mergedOptions.loop) {
            slidePageIndex = slideDisplayCount - 2;
            setTranslateXValue();
          }
          setTimeout(function(){
            enableTransitionDuration();
            next();
          }, 0);
        } else {
          next();
        }
      }
    }
    
    function updateSlideIndex(isNext) {
      if (isNext) {
        slidePageIndex++;
        if (pageIndex === slideCount -1) {
          pageIndex = 0;
        } else {
          pageIndex++;
        }
      } else{
        slidePageIndex--;
        if (pageIndex === 0) {
          pageIndex = slideCount -1;
        } else {
          pageIndex--;
        }
      }
    }
    
    function setTranslateXValue(value) {
      if (!value) {
        value = slidePageWidth * slidePageIndex;
        currentTranslateXValue = - value;
        value = currentTranslateXValue + "px";
      }
      
      slideContainer.css({
        "-webkit-transform": "translateX(" + value + ")",
        "-moz-transform": "translateX(" + value + ")",
        "-o-transform": "translateX(" + value + ")",
        "transform": "translateX(" + value + ")"
      });
      
    }

    function transitionEndEventHandler() {
      updateIndicatorStatus();
      setAutoPlay();
      return false;
    }

    function bindEvents() {
      slideContainer.on(transitionEndEventName, transitionEndEventHandler);
      var count = 0;
      $(window).on("orientationchange", handleOrientationChange);
      var touchObj = new TouchObject(element[0]);
      var domObj = $(element);
      $(element).on("tap",  function(e){
        var link;
        if (e.detail && e.detail.target && (link = $(e.detail.target).attr("data-href"))) {
          window.location = link;
        }
        return false;
      });
      
      $(element).on("swipe", function() {
        enableTransitionDuration();
        //setAutoPlay();
        count = 0;
        $("#debug").text("count:" + count);
      });
      $(element).on("swipeLeft", function() {
        if (!mergedOptions.loop && slidePageIndex === slideDisplayCount - 1) {
          swipeCancelMyHandler();
        } else {
          next();
        }
      });
      $(element).on("swipeRight", function() {
        if (!mergedOptions.loop && slidePageIndex === 0) {
          swipeCancelMyHandler();
        } else {
          prev();
        }
      });
      
      $(element).on("swipeStart", function(){
        window.clearTimeout(timer);
        var nowTranslateXValue = getTranslateXValue(slideContainer[0]);
        currentTranslateXValue = nowTranslateXValue;
        disableTransitionDuration();
        setTranslateXValue(nowTranslateXValue+'px');
        console.log('x:'+nowTranslateXValue);
        if (!mergedOptions.loop) return false;
        if (slidePageIndex === slideDisplayCount -1 ) {
          slidePageIndex = 1;
          var value = - mergedOptions.slideWidth * 2 + (slideContainer.width() + nowTranslateXValue);
          currentTranslateXValue = value;
          setTranslateXValue(value+ "px");
          console.log('slidePageIndex === slideDisplayCount -1, now:',currentTranslateXValue);
        } else if (slidePageIndex === 0) {
          slidePageIndex = slideDisplayCount - 2;
          var value = - mergedOptions.slideWidth * slidePageIndex + nowTranslateXValue;
          currentTranslateXValue = value;
          setTranslateXValue(value + "px");
          //console.log('slidePageIndex === 0, now:',currentTranslateXValue);
        } else {
          
        }
      });
      $(element).on("swipeCancel", swipeCancelMyHandler);
      
      $(element).on("swipeProgress", function(e, e1, e2) {
        console.log("e",e)
        count++;
        var movedX = e.detail.detail.movedPageX;
        setTranslateXValue((currentTranslateXValue + movedX) + "px");
        $("#debug").text("count:" + count + " progrsss:" + (currentTranslateXValue + movedX) + "px");
      });
      
    }
    
    function swipeCancelMyHandler() {
      enableTransitionDuration();
      setTranslateXValue();
    }
    
    function handleOrientationChange() {
      window.clearTimeout(timer);
      disableTransitionDuration();
      setTimeout(function(){
        setSlideRootHeight();
        slidePageWidth = slideContainer.children().eq(0).width();
        setTranslateXValue(); 
        updateIndicatorStatus();
        // Resume transition after the orientation change event.
        setTimeout(function(){
          enableTransitionDuration();
          setAutoPlay();
        }, 0);
      }, 500);
      return false;
    }
    
    function setTransitionDuration() {
      slideContainer.css({
        "-webkit-transition-duration": mergedOptions.transitionDuration,
        "-moz-transition-duration": mergedOptions.transitionDuration,
        "-o-transition-duration": mergedOptions.transitionDuration,
        "transition-duration": mergedOptions.transitionDuration
      });
    }
    
    function disableTransitionDuration() {
      slideContainer.addClass("duration-initial");
    }
    
    function enableTransitionDuration() {
      slideContainer.removeClass("duration-initial");
    }
    
    function addIndicator() {
      var domStr = "<strong class='indicator'>";
      for (var i = 0; i < slideCount; i++) {
        domStr += "<span></span>";
      }
      domStr += "</strong>";
      element.append(domStr);
      indicators = element.find('.indicator').children();
      indicators.eq(0).addClass("current");
    }
    
    function updateIndicatorStatus() {
      indicators.removeClass("current");
      indicators.eq(pageIndex).addClass("current");
    }
    
    function getSlideRootHeight(aspectRatio) {
      return element.width() / aspectRatio;
    }
    
    function setSlideRootHeight() {
      element.height(getSlideRootHeight(mergedOptions.aspectRatio));
    }
    
  }
  
  function getTransitionEndEventName() {
    var i,
      undefined,
      el = document.createElement('div'),
      transitions = {
        'WebkitTransition':'webkitTransitionEnd',
        'transition':'transitionend',
        'OTransition':'otransitionend',  // oTransitionEnd in very old Opera
        'MozTransition':'transitionend'
      };
    
    for (i in transitions) {
      if (transitions.hasOwnProperty(i) && el.style[i] !== undefined) {
        return transitions[i];
      }
    }
    //TODO: throw 'TransitionEnd event is not supported in this browser';
    return '';
  }
  
  
  /**
   * Return the CSS3 translatex value of a DOM element.
   * @param {Object} domElement : A native DOM element
   * @returns {mixed}
   */
  function getTranslateXValue(domElement) {
    var cssMatrixObject = null;
    if (typeof WebKitCSSMatrix !== "undefined") {
      cssMatrixObject = WebKitCSSMatrix;
    } else if (typeof MSCSSMatrix !== "undefined") {
      cssMatrixObject = MSCSSMatrix;
    } else if (typeof DOMMatrix !== "undefined") {
      cssMatrixObject = DOMMatrix;
    }

    var style = window.getComputedStyle(domElement);

    var matrixString = '';
    if (typeof style.webkitTransform !== "undefined") {
      matrixString = style.webkitTransform;
    } else if (typeof style.mozTransform !== "undefined") {
      matrixString = style.mozTransform;
    } else if (typeof style.transform !== "undefined") {
      matrixString = style.transform;
    }

    var matrix = new cssMatrixObject(matrixString);
    return matrix.m41;
  }
  
  $.fn.css3Rotator = function (options) {
    // Using the each() method to loop through the elements
    return this.each(function(index, item){
      var rotatorObj = new Css3Rotator($(item), options);
    });
  };
});
