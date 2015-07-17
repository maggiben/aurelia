import {customElement, noView, bindable, inject, computedFrom} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';
import {EventAggregator} from 'aurelia-event-aggregator';
import d3 from 'd3';
import 'styles/stock.css!';

//
@noView()
@bindable('data')
@inject(Element, HttpClient, EventAggregator, d3)
@customElement('candlestick')
export class Candlestick {

  static isCreated = false;

  margin = {
    top: 0, 
    right: 0, 
    bottom: 30, 
    left: 0
  };

  candleWidth = null;

  /////////////////////////////////////////////////////////////////////////////
  //                                                                         //
  /////////////////////////////////////////////////////////////////////////////
  constructor(element, http, eventAggregator, d3) {
    this.element = element;//.querySelector('svg');
    this.http = http;
    this.eventAggregator = eventAggregator;
    this.d3 = d3;
  }

  /////////////////////////////////////////////////////////////////////////////
  //                                                                         //
  /////////////////////////////////////////////////////////////////////////////
  attached() {
    console.log("attached ")
    this.width = this.element.offsetWidth - this.margin.left - this.margin.right;
    this.height = 260 - this.margin.top - this.margin.bottom;

    this.chart = this.d3.select(this.element).append("svg")
      .attr("width", this.width)
      .attr("height", 260)
      //.attr("viewBox", '0 0 ' + this.width + ' 260')
      //.attr("preserveAspectRatio", "xMidYMid")
      .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    this.x = this.d3.time.scale()
      .range([0, this.width - 20]);
    this.y = this.d3.scale.linear()
      .range([this.height, 0]);

    this.xAxis = this.d3.svg.axis()
      .scale(this.x)
      .ticks(this.d3.time.weeks)
      .tickSize(0, 0)
      .ticks(10)
      .tickFormat(this.d3.time.format('%d/%m'))
      .orient("bottom");

    this.yAxis = this.d3.svg.axis()
      .scale(this.y)
      .tickSize(0, 0)
      .ticks(5)
      .orient("right");

    this.line = this.d3.svg.line()

    .x((d) => { 
      return this.x(d.datetime); 
    })
    .y((d) => { 
      return this.y(d.Close); 
    });
  }

  bind() {
    //console.log("bind data: ", this.data);
    //this.createChart();
  }

  /////////////////////////////////////////////////////////////////////////////
  //                                                                         //
  /////////////////////////////////////////////////////////////////////////////
  dataChanged(newValues) {
    if(!this.isCreated) {
      this.createChart(newValues);
      this.isCreated = true;
    } else {
      this.updateChart(this.chart, newValues)
    }
  }

  toggle() {
    console.log("pepe: ", this.data);
  }

  updateChart(chart, data) {
    var that = this;
    this.x.domain(d3.extent(data, function(d) { 
      return d.datetime; 
    }));
    /*this.y.domain([this.d3.min(data, function(d){
      return d.Low;
    }), this.d3.max(data, function(d){
      return d.High;
    })]);*/
    this.y.domain([0, 200]);

    console.log(chart.select('.line'))
    return;
    chart.select(".line")   // change the line
        .duration(750)
        .attr('d', this.line);
    chart.select(".x.axis") // change the x axis
        .duration(750)
        .call(this.xAxis);
    chart.select(".y.axis") // change the y axis
        .duration(750)
        .call(this.yAxis);
  }

  createChart() {

    var candleWidth = 0.5 * (this.width - 2) / this.data.length;

    var that = this;
    this.x.domain(d3.extent(this.data, function(d) { 
      return d.datetime; 
    }));
    this.y.domain([this.d3.min(this.data, function(d){
      return d.Low;
    }), this.d3.max(this.data, function(d){
      return d.High;
    })]);

    ////////////////////////////////////////////
    // Grid
    var grid = this.chart.append('g')
      .attr('class', 'grid');

    grid.append("g")
      .attr("class", "y grid")
      .call(this.d3.svg.axis()
        .scale(this.y)
        .orient("left")
        .ticks(5)
        .tickSize(-this.width, 0, 0)
        //.tickFormat('')
      )
      .selectAll("text")
      .attr("x", 3)
      .attr('fill', '#1C1C1C')
      .attr('stroke', '#1C1C1C')
      .attr('stroke-width', '4')
      .style("text-anchor", "start");
      //.selectAll("text").remove();

    // X GRID
    grid.append("g")
      .attr("class", "x grid")
      .attr("transform", "translate(" + (candleWidth + 10) + ",0)")
      .call(this.d3.svg.axis()
        .scale(this.x)
        .ticks(10)
        .orient("bottom")
        .tickSize(this.height, 0, 0)
      )
      .selectAll("text").remove();

    // AXES
    this.chart.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(" + (candleWidth + 10) + "," + this.height + ")")
      .call(this.xAxis)
      .select('.domain').remove();

    this.chart.append("g")
      .attr("class", "y axis")
      .call(this.yAxis)
      .select('.domain').remove()
      .selectAll("text")
      .attr("y", 0)
      .style("text-anchor", "start");

    this.chart.on('mousemove', function(event){
      var mouse_x = d3.mouse(this)[0];
      var graph_x = that.x.invert(mouse_x);
      var format = d3.time.format('%a %d %H:%Mhs');

      //console.log("X: ", graph_x)
    });
    /*this.chart.select("path")
      .data(this.data)
      .enter().append("path")
        .attr("class", "line")
        .transition()
        .duration(2000)
        .attr("d", (d) => {
          console.log("d:", d)
          return this.line(d.High)
        });
    */


      
      var candle = this.chart.selectAll(".candle")
        .data(this.data)
        .enter().append("g")
        .attr("class", "candlestick")
        .attr("transform", "translate(" + (candleWidth + 10) + ",0)");

        candle.append("rect")
        .attr("class", "candle")
        .attr("x", (d) => {
          return this.x(d.datetime) - (this.width/this.data.length) / 2 + candleWidth / 2;
        })
        .attr("y", (d) => {
          return this.y(Math.max(d.Open, d.Close));
        })
        .attr("height", (d) => {
          return this.y(Math.min(d.Open, d.Close)) - this.y(Math.max(d.Open, d.Close));
        })
        .attr("width", function(d) {
          return candleWidth;
        })
        .attr("data-trend", function(d){
          return d.Open > d.Close ? "low" : "high";
        })
        .attr("data-date", function(d){
          return d.datetime;
        });

      candle.append("line")
        .attr("class", "stem")
        .attr("x1", (d) => {
          return (candleWidth / 2) + this.x(d.datetime) - (this.width/this.data.length) / 2 + candleWidth / 2;
          //return x(d.timestamp) + 0.25 * (width - 2 * margin)/ data.length;
        })
        .attr("x2", (d) => {
          return (candleWidth / 2) + this.x(d.datetime) - (this.width/this.data.length) / 2 + candleWidth / 2;
          //return x(d.timestamp) + 0.25 * (width - 2 * margin)/ data.length;
        })
        .attr("y1", (d) => {
          return this.y(d.High);
        })
        .attr("y2", (d) => {
          return this.y(d.Low);
        })
        .attr("data-trend", function(d){
          return d.Open > d.Close ? "low" : "high";
        });

      /*
      this.chart.append('path')
        .datum(this.data)
        .attr('class', 'line')
        .attr('d', this.line)
        .attr("transform", "translate(" + (candleWidth + 10) + ",0)");
      */
  }
}
