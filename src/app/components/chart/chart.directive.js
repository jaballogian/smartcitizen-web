(function() {
  'use strict';

  angular.module('app.components')
    .directive('chart', chart);

    chart.$inject = ['sensor'];
    function chart(sensor) { 
      var margin, width, height, svg, xScale, yScale0, yScale1, xAxis, yAxisLeft, yAxisRight, dateFormat, areaMain, valueLineMain, areaCompare, valueLineCompare, focusCompare, focusMain, popup, dataMain, colorMain, yAxisScale, unitMain, popupContainer;

      return {
        link: link,
        restrict: 'A',
        scope: {
          chartData: '='
        }
      };

      function link(scope, elem) {

        setTimeout(function() {
          createChart(elem[0]);                    
        }, 1000);

        scope.$watch('chartData', function(newData) {
          if(!newData) return;

          if(newData !== undefined) {
            if(newData[0] && newData[1]) {
              var sensorDataMain = newData[0].data;
              var dataMain = sensorDataMain.map(function(dataPoint) {
                return {
                  date: dateFormat(dataPoint.time),
                  count: dataPoint && dataPoint.data           
                };
              });

              dataMain.sort(function(a, b) {
                return a.date - b.date;
              });

              var sensorDataCompare = newData[1].data;
              var dataCompare = sensorDataCompare.map(function(dataPoint) {
                return {
                  date: dateFormat(dataPoint.time),
                  count: dataPoint && dataPoint.data           
                };
              });

              dataCompare.sort(function(a, b) {
                return a.date - b.date;
              });

              var data = [dataMain, dataCompare];
              var colors = [newData[0].color, newData[1].color];
              var units = [newData[0].unit, newData[1].unit];

              updateChartData(data, {type: 'both', container: elem[0], color: colors, unit: units });
            } else if(newData[0]) {

              var sensorData = newData[0].data;
              var data = sensorData.map(function(dataPoint) {
                return {
                  date: dateFormat(dataPoint.time),
                  count: dataPoint && dataPoint.data           
                };
              });

              data.sort(function(a, b) {
                return a.date - b.date;
              });

              var color = newData[0].color;
              var unit = newData[0].unit;
              updateChartData(data, {type: 'main', container: elem[0], color: color, unit: unit });
            } 
          }
        });
      }


      function createChart(elem) {
        margin = {top: 20, right: 15, bottom: 20, left: 40};
        width = elem.clientWidth - margin.left - margin.right;
        height = elem.clientHeight - margin.top - margin.bottom;

        xScale = d3.time.scale().range([0, width]);
        yScale0 = d3.scale.linear().range([height, 0]);
        yScale1 = d3.scale.linear().range([height, 0]);
        yAxisScale = d3.scale.linear().range([height, 0]); 

        dateFormat = d3.time.format.utc('%Y-%m-%dT%H:%M:%SZ').parse;//d3.time.format('%Y-%m-%dT%X.%LZ').parse; //'YYYY-MM-DDTHH:mm:ssZ'

        xAxis = d3.svg.axis()
          .scale(xScale)
          .orient('bottom')
          .ticks(5);

        yAxisLeft = d3.svg.axis()
          .scale(yScale0)
          .orient('left')
          .ticks(5);

        yAxisRight = d3.svg.axis()
          .scale(yScale1)
          .orient('right')
          .ticks(5);

        areaMain = d3.svg.area()
          .interpolate('linear')
          .x(function(d) { return xScale(d.date); })
          .y0(height)
          .y1(function(d) { return yScale0(d.count); });

        valueLineMain = d3.svg.line()
          .interpolate('linear')   
          .x(function(d) { return xScale(d.date); })
          .y(function(d) { return yScale0(d.count); });

        areaCompare = d3.svg.area()
          .interpolate('linear') 
          .x(function(d) { return xScale(d.date); })
          .y0(height)
          .y1(function(d) { return yScale1(d.count); });

        valueLineCompare = d3.svg.line()
          .interpolate('linear')   
          .x(function(d) { return xScale(d.date); })
          .y(function(d) { return yScale1(d.count); });

        svg = d3
          .select(elem)
          .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
          .append('g')
            .attr('transform', 'translate(' + (margin.left - margin.right) + ',' + margin.top + ')');
      }

      function updateChartData(newData, options) {
        if(options.type === 'main') {
          updateChartMain(newData, options);
        } else if(options.type === 'both') {
          updateChartCompare(newData, options);
        }
      }

      function updateChartMain(data, options) {
        xScale.domain(d3.extent(data, function(d) { return d.date; }));
        yScale0.domain([(d3.min(data, function(d) { return d.count; })) * 0.8, (d3.max(data, function(d) { return d.count; })) * 1.2]);      

        svg.selectAll('*').remove();

        var top = d3.select('.chart_container svg');

        var gradient = svg.append('svg:defs')
            .append('svg:linearGradient')
            .attr('id', 'gradient')
            .attr('y1', '0%')
            .attr('x1', '0%')
            .attr('y2', '100%')
            .attr('x2', '100%')
            .attr('spreadMethod', 'pad');

        gradient.append('svg:stop')
            .attr('offset', '0%')
            .attr('stop-color', 'black')
            .attr('stop-opacity', 1);

        gradient.append('svg:stop')
            .attr('offset', '100%')
            .attr('stop-color', 'white')
            .attr('stop-opacity', 1);

        //Add the area path
        svg.append('path')
          .datum(data)
          .attr('class', 'chart_area')
          .attr('fill', options.color)
          .attr('d', areaMain);

        // Add the valueline path.
        svg.append('path')
          .attr('class', 'chart_line')
          .attr('stroke', options.color)
          .attr('d', valueLineMain(data));

        // Add the X Axis
        svg.append('g')
          .attr('class', 'axis x')
          .attr('transform', 'translate(0,' + height + ')')
          .call(xAxis);

        // Add the Y Axis
        svg.append('g')
          .attr('class', 'axis y_left')
          .style('fill', options.color)
          .call(yAxisLeft);
        
        // Draw the x Grid lines
        svg.append('g')
          .attr('class', 'grid')
          .attr('transform', 'translate(0,' + height + ')')
          .call(xGrid()
            .tickSize(-height, 0, 0)
            .tickFormat('')
          );

        // Draw the y Grid lines
        svg.append('g')
          .attr('class', 'grid')
          .call(yGrid()
            .tickSize(-width, 0, 0)
            .tickFormat('')
          );
        
        focusMain = svg.append('g')
          .attr('class', 'focus')
          .style('display', 'none');

        focusMain.append('circle')
          .style('stroke', options.color)
          .attr('r', 4.5);

        var popupWidth = 84;
        var popupHeight = 46;

        popup = svg.append('g')
          .attr('class', 'focus')
          .style('display', 'none');

        popupContainer = popup.append('rect')
          .attr('width', popupWidth)
          .attr('height', popupHeight)
          .attr('transform', function() {
            var result = 'translate(-42, 5)';
                                                  
            return result;
          })
          .style('stroke', 'grey')
          .style('stroke-width', '0.5')
          .style('fill', 'white');

        var text = popup.append('text')
          .attr('class', '');

        var textMain = text.append('tspan')
          .attr('class', 'popup_main')
          .attr('text-anchor', 'start')
          .attr('x', -popupWidth / 2)
          .attr('dx', 8)
          .attr('y', popupHeight / 2)
          .attr('dy', 3);

          textMain.append('tspan')
          .attr('class', 'popup_value');
          
          textMain.append('tspan')
          .attr('class', 'popup_unit')
          .attr('dx', 5);

        text.append('tspan')
          .attr('class', 'popup_date')
          .attr('x', -popupWidth / 2)
          .attr('dx', 8)
          .attr('y', popupHeight - 2)
          .attr('dy', 0)
          .attr( 'text-anchor', 'start' );
          
        svg.append('rect')
          .attr('class', 'overlay')
          .attr('width', width)
          .attr('height', height)
          .on('mouseover', function() { 
            popup.style('display', null);             
            focusMain.style('display', null); 
          })          
          .on('mouseout', function() { 
            popup.style('display', 'none');             
            focusMain.style('display', 'none'); 
          })
          .on('mousemove', mousemove);

        function mousemove() {
          var bisectDate = d3.bisector(function(d) { return d.date; }).left;

          var x0 = xScale.invert(d3.mouse(this)[0]);
          var i = bisectDate(data, x0, 1);
          var d0 = data[i - 1];
          var d1 = data[i];
          var d = x0 - d0.date > d1.date - x0 ? d1 : d0;

          focusMain.attr('transform', 'translate(' + xScale(d.date) + ', ' + yScale0(d.count) + ')');
          popup.attr('transform', 'translate(' + (xScale(d.date) + 80) + ', ' + (d3.mouse(this)[1] - 20) + ')');
          var popupText = popup.select('text');
          var textMain = popupText.select('.popup_main');
          var valueMain = textMain.select('.popup_value').text(parseValue(d.count));
          var unitMain = textMain.select('.popup_unit').text(options.unit);
          var date = popupText.select('.popup_date').text(parseTime(d.date));

          var textContainers = [
            textMain,
            date
          ];
          resizePopup(popupContainer, textContainers);                     
        }       
      }


      function updateChartCompare(data, options) {
        xScale.domain(d3.extent(data[0], function(d) { return d.date; }));
        yScale0.domain([(d3.min(data[0], function(d) { return d.count; })) * 0.8, (d3.max(data[0], function(d) { return d.count; })) * 1.2]);                
        yScale1.domain([(d3.min(data[1], function(d) { return d.count; })) * 0.8, (d3.max(data[1], function(d) { return d.count; })) * 1.2]);        

        svg.selectAll('*').remove();

        //Add both area paths
        svg.append('path')
          .datum(data[0])
          .attr('class', 'chart_area')
          .attr('fill', options.color[0])
          .attr('d', areaMain);

        svg.append('path')
          .datum(data[1])
          .attr('class', 'chart_area')
          .attr('fill', options.color[1])
          .attr('d', areaCompare);

        // Add both valueline paths.
        svg.append('path')
          .attr('class', 'chart_line')
          .attr('stroke', options.color[0])
          .attr('d', valueLineMain(data[0]));

        svg.append('path')
          .attr('class', 'chart_line')
          .attr('stroke', options.color[1])          
          .attr('d', valueLineCompare(data[1]));

        // Add the X Axis
        svg.append('g')
          .attr('class', 'axis x')
          .attr('transform', 'translate(0,' + height + ')')
          .call(xAxis);

        // Add both Y Axis
        svg.append('g')
          .attr('class', 'axis y_left')
          .style('fill', options.color[0])
          .call(yAxisLeft);

        svg.append('g')
          .attr('class', 'axis y_right')
          .style('fill', options.color[1])
          .attr('transform', 'translate(' + width + ' ,0)') 
          .call(yAxisRight);
        
        // Draw the x Grid lines
        svg.append('g')
          .attr('class', 'grid')
          .attr('transform', 'translate(0,' + height + ')')
          .call(xGrid()
            .tickSize(-height, 0, 0)
            .tickFormat('')
          );

        // Draw the y Grid lines
        svg.append('g')
          .attr('class', 'grid')
          .call(yGrid()
            .tickSize(-width, 0, 0)
            .tickFormat('')
          );
        
        focusCompare = svg.append('g')
          .attr('class', 'focus')
          .style('display', 'none');

        focusMain = svg.append('g')
          .attr('class', 'focus')
          .style('display', 'none');

        focusCompare.append('circle')
          .style('stroke', options.color[1])
          .attr('r', 4.5);

        focusMain.append('circle')
          .style('stroke', options.color[0])
          .attr('r', 4.5);

        var popupWidth = 84;
        var popupHeight = 75;

        popup = svg.append('g')
          .attr('class', 'focus')
          .style('display', 'none');

        popupContainer = popup.append('rect')
          .attr('width', popupWidth)
          .attr('height', popupHeight)
          .style('min-width', '40px')
          .attr('transform', function() {
            var result = 'translate(-42, 5)';
                                                  
            return result;
          })
          .style('stroke', 'grey')
          .style('stroke-width', '0.5')
          .style('fill', 'white');

        popup.append('rect')
          .attr('width', 8)
          .attr('height', 2)
          .attr('transform', function() {
            return 'translate(' + (-popupWidth / 2 + 4).toString() + ', 20)';
          })
          .style('fill', options.color[0]);

        popup.append('rect')
          .attr('width', 8)
          .attr('height', 2)
          .attr('transform', function() {
            return 'translate(' + (-popupWidth / 2 + 4).toString() + ', 45)';
          })
          .style('fill', options.color[1]);

        var text = popup.append('text')
          .attr('class', '');

        var textMain = text.append('tspan')
          .attr('class', 'popup_main')
          .attr('x', -popupHeight / 2 + 7) //position of text
          .attr('dx', 8) //margin given to the element, will be applied to both sides thanks to resizePopup function
          .attr('y', popupHeight / 3)
          .attr('dy', 3);

        textMain.append('tspan')
          .attr('class', 'popup_value')
          .attr( 'text-anchor', 'start' );
        
        textMain.append('tspan')
          .attr('class', 'popup_unit')
          .attr('dx', 5);

        var textCompare = text.append('tspan')
          .attr('class', 'popup_compare')
          .attr('x', -popupHeight / 2 + 7) //position of text
          .attr('dx', 8) //margin given to the element, will be applied to both sides thanks to resizePopup function
          .attr('y', popupHeight / 1.5)
          .attr('dy', 3);

        textCompare.append('tspan')
          .attr('class', 'popup_value')
          .attr( 'text-anchor', 'start' );                    

        textCompare.append('tspan')
          .attr('class', 'popup_unit')
          .attr('dx', 5);

        text.append('tspan')
          .attr('class', 'popup_date')
          .attr('x', (- popupWidth / 2))
          .attr('dx', 8)
          .attr('y', popupHeight - 2)
          .attr('dy', 0)
          .attr( 'text-anchor', 'start' );
          
        svg.append('rect')
          .attr('class', 'overlay')
          .attr('width', width)
          .attr('height', height)
          .on('mouseover', function() { 
            focusCompare.style('display', null); 
            focusMain.style('display', null);             
            popup.style('display', null);                         
          })
          .on('mouseout', function() { 
            focusCompare.style('display', 'none'); 
            focusMain.style('display', 'none');             
            popup.style('display', 'none');                         
          })
          .on('mousemove', mousemove);

        function mousemove() {
          var bisectDate = d3.bisector(function(d) { return d.date; }).left;

          var x0 = xScale.invert(d3.mouse(this)[0]);
          var i = bisectDate(data[1], x0, 1);
          var d0 = data[1][i - 1];
          var d1 = data[1][i];
          var d = x0 - d0.date > d1.date - x0 ? d1 : d0;
          focusCompare.attr('transform', 'translate(' + xScale(d.date) + ', ' + yScale1(d.count) + ')');
          

          var dMain0 = data[0][i - 1];
          var dMain1 = data[0][i];
          var dMain = x0 - dMain0.date > dMain1.date - x0 ? dMain1 : dMain0;
          focusMain.attr('transform', 'translate(' + xScale(dMain.date) + ', ' + yScale0(dMain.count) + ')');

          popup.attr('transform', 'translate(' + (xScale(d.date) + 80) + ', ' + (d3.mouse(this)[1] - 20) + ')');
          
          var popupText = popup.select('text');
          var textMain = popupText.select('.popup_main');
          textMain.select('.popup_value').text(parseValue(dMain.count));
          textMain.select('.popup_unit').text(options.unit[0]);
          var textCompare = popupText.select('.popup_compare');
          textCompare.select('.popup_value').text(parseValue(d.count));
          textCompare.select('.popup_unit').text(options.unit[1]);
          var date = popupText.select('.popup_date').text(parseTime(d.date));     

          var textContainers = [
            textMain,
            textCompare,
            date
          ];

          resizePopup(popupContainer, textContainers);   
        }
      }

      function xGrid() {
        return d3.svg.axis()
          .scale(xScale)
          .orient('bottom')
          .ticks(5);
      }

      function yGrid() {
        return d3.svg.axis()
          .scale(yScale0)
          .orient('left')
          .ticks(5);
      }

      function parseValue(value) {
        if(value.toString().indexOf('.') !== -1) {
          var result = value.toString().split('.');
          return result[0] + '.' + result[1].slice(0, 2);            
        } else {
          return value.toString().slice(0, 2);
        }
      }

      function parseTime(time) {
        return moment(time).format('ddd Do MMM YYYY');
      }

      function resizePopup(popupContainer, textContainers) {
        if(!textContainers.length) return;

        var widestElem = textContainers.reduce(function(widestElemSoFar, textContainer) {
          var currentTextContainerSize = getContainerSize(textContainer);
          var prevTextContainerSize = getContainerSize(widestElemSoFar);
          return prevTextContainerSize.width >= currentTextContainerSize.width ? widestElemSoFar : textContainer; 
        }, textContainers[0]);

        var margins = widestElem.attr('dx') * 2;

        popupContainer
          .attr('width', getContainerSize(widestElem).width + margins);

        function getContainerSize(container) {
          return container.node().getBBox();
        }
      }
    }

})();
