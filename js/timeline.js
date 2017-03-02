jQuery(document).ready(function( $ ) {

  function isElementInViewport (el) {

      //special bonus for those using jQuery
      if (typeof jQuery === "function" && el instanceof jQuery) {
          el = el[0];
      }

      var rect = el.getBoundingClientRect();

      return (
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
          rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
      );
  }

  function onVisibilityChange(el, callback) {
      var old_visible;
      return function () {
          var visible = isElementInViewport(el);
          if (visible != old_visible) {
              old_visible = visible;
              if (typeof callback == 'function') {
                  callback();
              }
          }
      }
  }

  var loaded = false;
  var handler = onVisibilityChange($('.canvas-container'), function() {
      /* your code go here */
      if ( !loaded ){
        loaded = true;
        loadCircles();
      }
  });


  //jQuery
  $(window).on('DOMContentLoaded load resize scroll', handler);


  var milestones;
  var circleYears = [];
  function loadCircles(){
    $.getJSON('milestones.json',function(data){
      milestones = data;

      for (var i = 0; i < milestones.years.length; i++) {
        var year = milestones.years[i];
        createCircle(i,year);

        // Build the accordion html with handlebars
        var source   = $("#accordion-template").html();
        var template = Handlebars.compile(source);
        $('.accordion-container').html(template(milestones));
      }
    });
  }

  fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';

  var canvas = this.__canvas = new fabric.Canvas('c', {
    hoverCursor: 'pointer',
    selection: false,
    perPixelTargetFind: true,
    targetFindTolerance: 5
  });

  var cx = canvas.getWidth() / 2;
  var cy = canvas.getHeight() / 2;

  function createCircle(i, year) {
    var circleYear = new fabric.Circle({
      radius: 26 * i + 90,
      left: canvas.getWidth() / 2,
      top: canvas.getHeight() / 2,
      fill: '',
      stroke: '#CDCDCD',
      hasBorders: false,
      hasControls: false,
      lockMovementX: true,
      lockMovementY: true,
      index: i,
      year: year.year,
      isCircle: true,
      originalRadius: 26 * i + 90,
      clicked: false,
      opacity:0
    });
    canvas.add(circleYear);
    circleYears.push(circleYear);

    circleYear.animate('opacity', '1', {
          duration: 3000 + (1000 * i),
          onChange: canvas.renderAll.bind(canvas),
          onComplete: function() {

          },
          easing: fabric.util.ease['easeOutBounce']
    });

    for (var a = 0; a < year.milestones.length; a++){
      var milestone = year.milestones[a];
      var randomAngle = Math.round(fabric.util.getRandomInt(-360, 0)/20) * 20;
      var angle = fabric.util.degreesToRadians(randomAngle);
      var radius = i * 26 + 90;
      var x = cx + radius * Math.cos(angle);
      var y = cy + radius * Math.sin(angle);

      //create dot on circle
      var circleDot = new fabric.Circle({
        radius: 5,
        left: x,
        top: y,
        fill: '#CDCDCD',
        stroke: '',
        hasBorders: false,
        hasControls: false,
        lockMovementX: true,
        lockMovementY: true,
        year: year.year,
        text: milestone.text,
        isCircle: false,
        clicked: false,
        originalAngle: angle,
        originalRadius: 26 * i + 90,
        opacity:0
      });
      canvas.add(circleDot);
      circleDot.animate('opacity', '1', {
            duration: 500,
            onChange: canvas.renderAll.bind(canvas),
            onComplete: function() {
            },
            easing: fabric.util.ease['easeOutBounce']
      });

    }
  }

  var hoverTarget, prevHoverTarget;

  function circleWaves(circle){
    var objs = canvas.getObjects();

    for (obj in objs){
      if ( objs[obj].year === circle.year && objs[obj].isCircle === false ){
        objs[obj].set({
          fill: '#EC008C'
        });
      }
      if ( objs[obj].year === circle.year-1 && objs[obj].isCircle === false ){
        var dotBefore = objs[obj];
        dotBefore.animate({left:cx + (dotBefore.originalRadius-5) * Math.cos(dotBefore.originalAngle), top:cx + (dotBefore.originalRadius-5) * Math.sin(dotBefore.originalAngle)}, {
          duration: 1000,
          onChange: canvas.renderAll.bind(canvas),
          onComplete: function(){
          },
          easing: fabric.util.ease['easeInQuad']
        });
      }
      if ( objs[obj].year === circle.year-1 && objs[obj].isCircle === true ){
          var circleBefore = objs[obj];
          circleBefore.animate('radius', circleBefore.originalRadius-5, {
            duration: 1000,
            onChange: canvas.renderAll.bind(canvas),
            onComplete: function(){
            },
            easing: fabric.util.ease['easeInQuad']
          });
      }
      if ( objs[obj].year === circle.year+1 && objs[obj].isCircle === false ){
        var dotBefore = objs[obj];
        dotBefore.animate({left:cx + (dotBefore.originalRadius+5) * Math.cos(dotBefore.originalAngle), top:cx + (dotBefore.originalRadius+5) * Math.sin(dotBefore.originalAngle)}, {
          duration: 1000,
          onChange: canvas.renderAll.bind(canvas),
          onComplete: function(){
          },
          easing: fabric.util.ease['easeInQuad']
        });
      }
      if ( objs[obj].year === circle.year+1 && objs[obj].isCircle === true){
          var circleAfter = objs[obj];
          circleAfter.animate('radius', circleAfter.originalRadius+5, {
            duration: 1000,
            onChange: canvas.renderAll.bind(canvas),
            onComplete: function(){
            },
            easing: fabric.util.ease['easeInQuad']
          });
      }
    }


  }

  canvas.on('mouse:over', function(e) {
    if ( e.target && e.target.isCircle === true ){
      e.target.set({
        strokeWidth: 3,
        stroke: '#EC008C',
        hovering:true
      });
      circleWaves(e.target);
    }

    canvas.renderAll();
  });

  canvas.on('mouse:out', function(e) {
    var objs = canvas.getObjects();
    for (obj in objs){
      if ( objs[obj].isCircle === true ){
        objs[obj].animate('radius', objs[obj].originalRadius, {
          duration: 1000,
          onChange: canvas.renderAll.bind(canvas),
          onComplete: function(){
          },
          easing: fabric.util.ease['easeInQuad']
        });
      }
      if ( objs[obj].isCircle === false ){
        objs[obj].animate({left:cx + (dotBefore.originalRadius) * Math.cos(dotBefore.originalAngle), top:cx + (dotBefore.originalRadius) * Math.sin(dotBefore.originalAngle)}, {
          duration: 1000,
          onChange: canvas.renderAll.bind(canvas),
          onComplete: function(){
          },
          easing: fabric.util.ease['easeInQuad']
        });
      }
      if ( objs[obj].isCircle === false && objs[obj].clicked === false ){
        objs[obj].set({
          fill: '#CDCDCD'
        });
      }
    }
    if ( e.target && e.target.isCircle === true && !e.target.clicked ){
      e.target.set({
        strokeWidth: 1,
        stroke: '#CDCDCD',
        hovering:false
      });
    }
    canvas.renderAll();
  });

  canvas.on('mouse:down', function(e) {
    var objs = canvas.getObjects();
    for (obj in objs){
      if ( objs[obj].isCircle === true ){
        objs[obj].set({
          strokeWidth: 1,
          stroke: '#CDCDCD',
          clicked: false
        });
      }
    }
    if ( e.target && e.target.isCircle === true ){
      e.target.set({
        strokeWidth: 3,
        stroke: '#EC008C',
        clicked: true
      });
      var year = e.target.year;
      $('.accordion-item').removeClass('on');
      $('.accordion-item[data-year='+year+']').addClass('on');
      $('.accordion-text').removeClass('on');
      $('.accordion-item[data-year='+year+'] .accordion-text').addClass('on');
      for (obj in objs){
        if ( objs[obj].isCircle === false){
          if ( objs[obj].year === e.target.year ){
            objs[obj].set({
              fill: '#EC008C',
              clicked: true
            });
          } else {
            objs[obj].set({
              fill: '#CDCDCD',
              clicked: false
            });
          }
        }
      }
    }
    canvas.renderAll();
  });


  $('.accordion-container').on('click','.accordion-item-title a',function(){
    var accordionItem = $(this).parents('.accordion-item');
    $('.accordion-item').removeClass('on');
    accordionItem.addClass('on');
    $('.accordion-text').removeClass('on')
    $('.accordion-text',accordionItem).addClass('on');
    // highlight canvas object
    var year = parseInt(accordionItem.attr('data-year'));
    var objs = canvas.getObjects();
    for (obj in objs){
      if ( objs[obj].year === year && objs[obj].isCircle === true ){
        objs[obj].set({
          strokeWidth: 3,
          stroke: '#EC008C',
          clicked: true
        });
      } else {
        if ( objs[obj].isCircle === true ){
          objs[obj].set({
            strokeWidth: 1,
            stroke: '#CDCDCD',
            clicked: false
          });
        } else {
          if ( objs[obj].year === year ){
            objs[obj].set({
              fill: '#EC008C',
              clicked: true
            });
          } else {
            objs[obj].set({
              fill: '#CDCDCD',
              clicked: false
            });
          }
        }
      }

      canvas.renderAll();
    }
  });

});
