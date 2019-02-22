var needle;

(function(){

var arc, arcEndRad, arcStartRad, barWidth, chart, chartInset, degToRad,
    endPadRad, height, margin, numSections, padRad, percToDeg, percToRad, 
    percent, radius, sectionIndx, sectionPerc, startPadRad, svg, totalPercent, width, _i;

  percent = .65;
  numSections = 1;
  sectionPerc = 1 / numSections / 2;
  padRad = 0.05;
  chartInset = 10;

  // Orientation of gauge:
  totalPercent = .75;

  el = d3.select('.chart-gauge');

  margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 20
  };

  width = el[0][0].offsetWidth - margin.left - margin.right;
  height = width;
  radius = Math.min(width, height) / 2;
  barWidth = 40 * width / 300;
  /*
    Utility methods 
  */
  percToDeg = function(perc) {
    return perc * 360;
  };

  percToRad = function(perc) {
    return degToRad(percToDeg(perc));
  };

  degToRad = function(deg) {
    return deg * Math.PI / 180;
  };

  // Create SVG element
  svg = el.append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom);

  // Add layer for the panel
  chart = svg.append('g').attr('transform', "translate(" + ((width + margin.left) / 2) + ", " + ((height + margin.top) / 2) + ")");


  for (sectionIndx = _i = 1; _i <= numSections; ++_i) {

    sectionIndx = _i;
    arcStartRad = percToRad(totalPercent);
    arcEndRad = arcStartRad + percToRad(sectionPerc);
    totalPercent += sectionPerc;

    // Leave margin for intermediate sections
    startPadRad = sectionIndx === 0 ? 0 : padRad / 2;
    endPadRad = sectionIndx === numSections ? 0 : padRad / 2;

    arc = d3.svg.arc().outerRadius(radius - chartInset).innerRadius(radius - chartInset - barWidth)
        .startAngle(arcStartRad + startPadRad).endAngle(arcEndRad - endPadRad);
    chart.append('path').attr('class', "arc chart-color" + sectionIndx).attr('d', arc);
  }

  var Needle = (function() {

    /** 
      * Helper function that returns the `d` value
      * for moving the needle
    **/
    var recalcPointerPos = function(perc) {
      var centerX, centerY, leftX, leftY, rightX, rightY, thetaRad, topX, topY;
      thetaRad = percToRad(perc / 2);
      centerX = 0;
      centerY = 0;
      topX = centerX - this.len * Math.cos(thetaRad);
      topY = centerY - this.len * Math.sin(thetaRad);
      leftX = centerX - this.radius * Math.cos(thetaRad - Math.PI / 2);
      leftY = centerY - this.radius * Math.sin(thetaRad - Math.PI / 2);
      rightX = centerX - this.radius * Math.cos(thetaRad + Math.PI / 2);
      rightY = centerY - this.radius * Math.sin(thetaRad + Math.PI / 2);
      return "M " + leftX + " " + leftY + " L " + topX + " " + topY + " L " + rightX + " " + rightY;
    };

    function Needle(el) {
      this.el = el;
      this.len = width / 3;
      this.radius = this.len / 6;
    }

    Needle.prototype.render = function(perc) {
      this.el.append('circle').attr('class', 'needle-center').attr('cx', 0).attr('cy', 0).attr('r', this.radius);
      return this.el.append('path').attr('class', 'needle').attr('d', recalcPointerPos.call(this, perc));
    };

    Needle.prototype.moveTo = function(perc) {
      var self;
      self = this;
      return this.el.transition().delay(500).ease('elastic').duration(3000).selectAll('.needle').tween('progress', function() {
        return function(percentOfPercent) {
          var progress = percentOfPercent * perc;
          return d3.select(this).attr('d', recalcPointerPos.call(self, progress));
        };
      });
    };

    return Needle;

  })();

  needle = new Needle(chart);
  needle.render(0);

  needle.moveTo(percent);

})();