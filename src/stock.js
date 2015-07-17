import {inject, computedFrom} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';
import {EventAggregator} from 'aurelia-event-aggregator';
import d3 from 'd3';

@inject(HttpClient, EventAggregator, d3)
export class Stock{
  quote: [];

  tickerQuote(tickers, startDate, endDate) {
    var symbols = tickers.map(function(ticker){
        // This will wrap each element of the dates array with quotes
        return '"' + ticker + '"';
    }).join(',');

    // Create request
    var client = new HttpClient();
    // Historical Data
    client.createRequest('v1/public/yql')
      .asGet()
      .withBaseUrl('http://query.yahooapis.com')
      .withParams({
        q: 'select * from yahoo.finance.historicaldata where symbol in (' + symbols + ') and startDate = "' + startDate + '" and endDate = "' + endDate + '"',
        env: 'http://datatables.org/alltables.env',
        format: 'json'
      })
      .send()
      .then(result => {        
        var data = JSON.parse(result.response);
        this.logx(data.query.results.quote);
      });

      this.heading = "STOCK"
  }
   
  logx(quote) {
    // Parse Dates
    quote.forEach(function(d) {
        d.datetime = d3.time.format("%Y-%m-%d").parse(d.Date) //new Date(d.Date);
        //d.Open = parseFloat(d.Open);
        d.Close = parseFloat(d.Close);
        /*d.Low = parseFloat(d.Low);
        d.High = parseFloat(d.High);
        d.Volume = parseFloat(d.Volume);*/
    });
    this.quote = quote;
  }

  getQuote(symbol) {
    var client = new HttpClient();

    client.createRequest('Api/v2/Quote/jsonp')
      .asJsonp()
      .withBaseUrl('http://dev.markitondemand.com')
      .withParams({
        symbol: 'IBM'
      })
      .withCallbackParameterName('callback')
      .send()
      .then(result => {        
        console.log("tickerQuote result: ", result)          
      });
  };

  lookup(term) {

    $.ajax({
      url: "http://dev.markitondemand.com/api/v2/Lookup/jsonp",
      dataType: "jsonp",
      data: {
        input: term
      }
    }).then(function(data){
      console.log("Lookup: ", data)
    });

    $.ajax({
      url: "http://dev.markitondemand.com/Api/v2/Quote/jsonp",
      dataType: "jsonp",
      data: {
        symbol: 'AAPL'
      }
    }).then((data) => {
      this.name = data.Name
      this.symbol = data.Symbol
      console.log("Quote: ", data)
    });

    var client = new HttpClient();
    client.createRequest('Api/v2/Quote/jsonp')
    .asJsonp()
    .withBaseUrl('http://dev.markitondemand.com')
    .withParams({
      symbol: 'YHOO'
    })
    .send()
    .then((result) => {        
      console.log("jsonp Quote: ", result)
    });


    /*$.ajax({
      url: 'http://en.wikipedia.org/w/api.php',
      dataType: 'jsonp',
      data: {
        action: 'opensearch',
        format: 'json',
        search: encodeURI(term)
      }
    }).then(function(r){
      console.log("wiki: ",r);
    })*/
  };

  constructor(http, eventAggregator, d3){
    this.http = http;
    this.eventAggregator = eventAggregator;
  }

  activate(params, routeConfig, navigationInstruction){
    if(params.symbol) {
      //this.getQuote(params.symbol);
      this.tickerQuote([params.symbol], '2015-03-01', '2015-07-16');
    } else {
      //this.getQuote('IBM');
      this.tickerQuote(['IBM'], '2015-03-01', '2015-07-16');
    }
  }
}
