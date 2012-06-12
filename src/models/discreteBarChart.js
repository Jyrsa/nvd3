
nv.models.discreteBarChart = function() {
  var margin = {top: 30, right: 20, bottom: 50, left: 60},
      width = null,
      height = null,
      color = d3.scale.category20().range(),
      staggerLabels = false,
      tooltips = true,
      tooltip = function(key, x, y, e, graph) { 
        return '<h3>' + x + '</h3>' +
               '<p>' +  y + '</p>'
      };


  var discretebar = nv.models.discreteBar(),
      x = discretebar.xScale(),
      y = discretebar.yScale(),
      xAxis = nv.models.axis().scale(x).orient('bottom').highlightZero(false),
      yAxis = nv.models.axis().scale(y).orient('left'),
      dispatch = d3.dispatch('tooltipShow', 'tooltipHide');

  xAxis.tickFormat(function(d) { return d });
  yAxis.tickFormat(d3.format(',.1f'));


  var showTooltip = function(e, offsetElement) {
    //console.log('left: ' + offsetElement.offsetLeft);
    //console.log('top: ' + offsetElement.offsetLeft);

    //TODO: FIX offsetLeft and offSet top do not work if container is shifted anywhere
    //var offsetElement = document.getElementById(selector.substr(1)),
    var left = e.pos[0] + ( offsetElement.offsetLeft || 0 ),
        top = e.pos[1] + ( offsetElement.offsetTop || 0),
        x = xAxis.tickFormat()(discretebar.x()(e.point)),
        y = yAxis.tickFormat()(discretebar.y()(e.point)),
        content = tooltip(e.series.key, x, y, e, chart);

    nv.tooltip.show([left, top], content, e.value < 0 ? 'n' : 's');
  };


  //TODO: let user select default
  var controlsData = [
    { key: 'Grouped' },
    { key: 'Stacked', disabled: true }
  ];

  function chart(selection) {
    selection.each(function(data) {
      var container = d3.select(this);

      var availableWidth = (width  || parseInt(container.style('width')) || 960)
                             - margin.left - margin.right,
          availableHeight = (height || parseInt(container.style('height')) || 400)
                             - margin.top - margin.bottom;


      discretebar
        .width(availableWidth)
        .height(availableHeight);


      var wrap = container.selectAll('g.wrap.discreteBarWithAxes').data([data]);
      var gEnter = wrap.enter().append('g').attr('class', 'wrap nvd3 discreteBarWithAxes').append('g');

      gEnter.append('g').attr('class', 'x axis');
      gEnter.append('g').attr('class', 'y axis');
      gEnter.append('g').attr('class', 'barsWrap');



      var g = wrap.select('g');


      g.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      var barsWrap = g.select('.barsWrap')
          .datum(data.filter(function(d) { return !d.disabled }))


      d3.transition(barsWrap).call(discretebar);


      xAxis
        .scale(x)
        .ticks( availableWidth / 100 )
        .tickSize(-availableHeight, 0);

      g.select('.x.axis')
          .attr('transform', 'translate(0,' + (y.range()[0] + (discretebar.showValues() ? 16 : 0)) + ')');
      d3.transition(g.select('.x.axis'))
          .call(xAxis);


      var xTicks = g.select('.x.axis').selectAll('g');

      if (staggerLabels)
        xTicks
            .selectAll('text')
            .attr('transform', function(d,i,j) { return 'translate(0,' + (j % 2 == 0 ? '0' : '12') + ')' })


      yAxis
        .scale(y)
        .ticks( availableHeight / 36 )
        .tickSize( -availableWidth, 0);

      d3.transition(g.select('.y.axis'))
          .call(yAxis);


      discretebar.dispatch.on('elementMouseover.tooltip', function(e) {
        e.pos = [e.pos[0] +  margin.left, e.pos[1] + margin.top];
        dispatch.tooltipShow(e);
      });
      if (tooltips) dispatch.on('tooltipShow', function(e) { showTooltip(e, container[0][0]) } ); // TODO: maybe merge with above?

      discretebar.dispatch.on('elementMouseout.tooltip', function(e) {
        dispatch.tooltipHide(e);
      });
      if (tooltips) dispatch.on('tooltipHide', nv.tooltip.cleanup);

    });

    return chart;
  }


  chart.dispatch = dispatch;
  chart.xAxis = xAxis;
  chart.yAxis = yAxis;

  d3.rebind(chart, discretebar, 'x', 'y', 'xDomain', 'yDomain', 'forceX', 'forceY', 'id', 'showValues', 'valueFormat');


  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = d3.functor(_);
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = d3.functor(_);
    return chart;
  };

  chart.color = function(_) {
    if (!arguments.length) return color;
    color = _;
    discretebar.color(_);
    return chart;
  };

  chart.staggerLabels = function(_) {
    if (!arguments.length) return staggerLabels;
    staggerLabels = _;
    return chart;
  };

  chart.tooltips = function(_) {
    if (!arguments.length) return tooltips;
    tooltips = _;
    return chart;
  };

  chart.tooltipContent = function(_) {
    if (!arguments.length) return tooltip;
    tooltip = _;
    return chart;
  };


  return chart;
}