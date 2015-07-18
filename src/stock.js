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

  getDividendHistory(symbols, startDate, endDate) {
    var client = new HttpClient();
    // Historical Data
    client.createRequest('v1/public/yql')
      .asGet()
      .withBaseUrl('http://query.yahooapis.com')
      .withParams({
        q: 'select * from yahoo.finance.dividendhistory where symbol in (' + symbols + ') and startDate = "' + startDate + '" and endDate = "' + endDate + '"',
        env: 'store://datatables.org/alltableswithkeys',
        format: 'json',
        diagnostics: true
      })
      .send()
      .then(result => {        
        var data = JSON.parse(result.response);
        console.log("getDivicendHistory:", result)
      });
  }
  getFeeds(symbol) {
    var client = new HttpClient();
    client.createRequest('finance/company_news')
    .asGet()
    .withBaseUrl('https://www.google.com')
    .withParams({
      q: 'NYSE:IBM',
      output: 'json'
    })
    .send()
    .then(result => {        
      //var domParser = new DOMParser();
      //var xmlDoc = domParser.parseFromString(result.response, 'text/xml');
      //var xmlParser = new XMLParser();
      //var jsonNews = xmlParser.parse(xmlDoc);
      //this.news = jsonNews.rss.channel.item;
      //var jsonNews = JSON.parse('{' + result.response.replace(/({)([a-zA-Z0-9]+)(:)/,'$1"$2"$3') + '}');
      //this.news = jsonNews.NEWS.clusters.a;
      
      // OK
      //var objKeysRegex = /({|,)(?:\s*)(?:')?([A-Za-z_$\.][A-Za-z0-9_ \-\.$]*)(?:')?(?:\s*):/g;// look for object names
      //var newQuotedKeysString = result.response.replace(objKeysRegex, "$1\"$2\":");// all object names should be double quoted
      //console.log("NEWS: ", result, JSON.parse(newQuotedKeysString))
      
      var datox = eval("(" + result.response + ")");
      console.log("NEWS: ", datox)
    });
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
      this.getDividendHistory(['IBM'], '2015-03-01', '2015-07-16')
      this.getFeeds('IBM');
    }
  }
}

export class XMLParser {
  parse(xml, tab) {
    if (xml.nodeType == 9) // document node
      xml = xml.documentElement;
    var json = this.toJson(this.toObj(this.removeWhite(xml)), xml.nodeName, "\t");
    return JSON.parse('{'+json+'}');
    //return "{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) + "\n}";
  }

  toObj(xml) {
    var o = {};
    if (xml.nodeType==1) {   // element node ..
      if (xml.attributes.length)   // element with attributes  ..
         for (var i=0; i<xml.attributes.length; i++)
            o["@"+xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue||"").toString();
      if (xml.firstChild) { // element has child nodes ..
         var textChild=0, cdataChild=0, hasElementChild=false;
         for (var n=xml.firstChild; n; n=n.nextSibling) {
            if (n.nodeType==1) hasElementChild = true;
            else if (n.nodeType==3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++; // non-whitespace text
            else if (n.nodeType==4) cdataChild++; // cdata section node
         }
         if (hasElementChild) {
            if (textChild < 2 && cdataChild < 2) { // structured element with evtl. a single text or/and cdata node ..
               this.removeWhite(xml);
               for (var n=xml.firstChild; n; n=n.nextSibling) {
                  if (n.nodeType == 3)  // text node
                     o["#text"] = this.escape(n.nodeValue);
                  else if (n.nodeType == 4)  // cdata node
                     o["#cdata"] = this.escape(n.nodeValue);
                  else if (o[n.nodeName]) {  // multiple occurence of element ..
                     if (o[n.nodeName] instanceof Array)
                        o[n.nodeName][o[n.nodeName].length] = this.toObj(n);
                     else
                        o[n.nodeName] = [o[n.nodeName], this.toObj(n)];
                  }
                  else  // first occurence of element..
                     o[n.nodeName] = this.toObj(n);
               }
            }
            else { // mixed content
               if (!xml.attributes.length)
                  o = this.escape(this.innerXml(xml));
               else
                  o["#text"] = this.escape(this.innerXml(xml));
            }
         }
         else if (textChild) { // pure text
            if (!xml.attributes.length)
               o = this.escape(this.innerXml(xml));
            else
               o["#text"] = this.escape(this.innerXml(xml));
         }
         else if (cdataChild) { // cdata
            if (cdataChild > 1)
               o = this.escape(this.innerXml(xml));
            else
               for (var n=xml.firstChild; n; n=n.nextSibling)
                  o["#cdata"] = this.escape(n.nodeValue);
         }
      }
      if (!xml.attributes.length && !xml.firstChild) o = null;
    }
    else if (xml.nodeType==9) { // document.node
      o = this.toObj(xml.documentElement);
    }
    else
      alert("unhandled node type: " + xml.nodeType);
    return o;
  }

  toJson(o, name, ind) {
     var json = name ? ("\""+name+"\"") : "";
     if (o instanceof Array) {
        for (var i=0,n=o.length; i<n; i++)
           o[i] = this.toJson(o[i], "", ind+"\t");
        json += (name?":[":"[") + (o.length > 1 ? ("\n"+ind+"\t"+o.join(",\n"+ind+"\t")+"\n"+ind) : o.join("")) + "]";
     }
     else if (o == null)
        json += (name&&":") + "null";
     else if (typeof(o) == "object") {
        var arr = [];
        for (var m in o)
           arr[arr.length] = this.toJson(o[m], m, ind+"\t");
        json += (name?":{":"{") + (arr.length > 1 ? ("\n"+ind+"\t"+arr.join(",\n"+ind+"\t")+"\n"+ind) : arr.join("")) + "}";
     }
     else if (typeof(o) == "string")
        json += (name&&":") + "\"" + o.toString() + "\"";
     else
        json += (name&&":") + o.toString();
     return json;
  }

  innerXml(node) {
    var s = ""
    if ("innerHTML" in node)
      s = node.innerHTML;
    else {
      var asXml = function(n) {
         var s = "";
         if (n.nodeType == 1) {
            s += "<" + n.nodeName;
            for (var i=0; i<n.attributes.length;i++)
               s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue||"").toString() + "\"";
            if (n.firstChild) {
               s += ">";
               for (var c=n.firstChild; c; c=c.nextSibling)
                  s += asXml(c);
               s += "</"+n.nodeName+">";
            }
            else
               s += "/>";
         }
         else if (n.nodeType == 3)
            s += n.nodeValue;
         else if (n.nodeType == 4)
            s += "<![CDATA[" + n.nodeValue + "]]>";
         return s;
      };
      for (var c=node.firstChild; c; c=c.nextSibling)
         s += asXml(c);
    }
    return s;
  }

  escape(str) {
    return str.replace(/[\\]/g, "\\\\")
      .replace(/[\"]/g, '\\"')
      .replace(/[\n]/g, '\\n')
      .replace(/[\r]/g, '\\r');
  }

  removeWhite(str) {
    str.normalize();
      for (var n = str.firstChild; n; ) {
        if (n.nodeType == 3) {  // text node
            if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) { // pure whitespace text node
              var nxt = n.nextSibling;
              str.removeChild(n);
              n = nxt;
            }
            else
              n = n.nextSibling;
        }
        else if (n.nodeType == 1) {  // element node
          this.removeWhite(n);
          n = n.nextSibling;
        }
        else                      // any other node
          n = n.nextSibling;
     }
     return str;
  }
}
