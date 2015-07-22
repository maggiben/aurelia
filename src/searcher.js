import {inject, customAttribute, bindable} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';
import typeahead from 'typeahead';
import Rx from 'rx';
import 'styles/type-ahead.css!'

@inject(Element, HttpClient)
@customAttribute('searcher')
//@bindable('value')

export class Searcher {

  @bindable searcher;
  //@bindable value;
  isSearching = false;

  constructor(element, http) {
    this.element = element;
    this.http = http;
  }

  searchTerm(term) {
    return new HttpClient().createRequest('api/v2/Lookup/jsonp')
      .asJsonp()
      .withBaseUrl('http://dev.markitondemand.com')
      .withParams({
        input: term
      })
      .withCallbackParameterName('callback')
      .send()
      .then(function(result) {
        return result.response.map(function(item, index){
          return {
            symbol: item.Symbol,
            name: item.Name,
            exchange: item.Exchange
          };
        });
      });

      // CNN LOOKUP: http://money.cnn.com/quote/quote.html?symb=IBM
      $.ajax({
         type: 'GET',
          url: 'http://markets.money.cnn.com/common/symbolLookup/getSymbols.asp',
          data: {
            q: 'ibm',
            render: 'JSON',
            '_': 1437357179839
          },
          jsonp: 'jsoncallback',
          contentType: "text/javascript",
          jsonpCallback: 'jQuery11110835057919844985_1437357179837',
          dataType: 'jsonp',
          success: function(json) {
             console.log(json);
          }
      });
  }

  getSuggestions() {
    //var keyup = Rx.Observable.fromEvent($(this.element).find('input'), 'keyup')
    var asyncrequest = Rx.Observable.fromEvent($(this.element), 'typeahead:asyncrequest')
      .map(function (e) {
        return e.target.value; // Project the text from the input
      })
      .filter(function (text) {
        var regex = new RegExp("^[a-zA-Z0-9_ ]*$"); // Match only alphanumric underscore and space
        return regex.test(text);
      })
      .debounce(500) // debounce events
      .distinctUntilChanged(); // Only if the value has changed

    var searcher = asyncrequest.flatMapLatest(this.searchTerm);
    return (query, syncResults, asyncResults) => {
      var subscription = searcher.first().subscribe(
        (data) => {
          return asyncResults(data);
        },
        (error) => {
          return asyncResults([]);
        }
      );
    };
  }

  bind() {
    console.log("bind: ", this.value, this.searcher);
  }
  valueChanged(newValue) {
    console.log("valueChanged: ", newValue);
    this.value = newValue;
  }
  searcherChanged(newValue) {
    //console.log("searcherChanged: ", newValue);
    //this.element.value = newValue;
  }

  attached() {
    this.typeAhead = $(this.element).typeahead({
      hint: true,
      async: true,
      highlight: true,
      minLength: 2,
      display: 'symbol',
      classNames: {
        menu: 'results'
      }
    },
    {
      name: 'tickers',
      //valueKey: 'name',
      limit: 4,
      displayKey: 'symbol',
      source: this.getSuggestions(),
      templates: {
        notFound: [
          '<div class="empty-message">',
            'unable to find any symbols that match the current query',
          '</div>'
        ].join('\n'),
        suggestion: data => {
          return `<div><strong class="symbol">${data.symbol}</strong><span class="name">${data.name}</span><span class="exchange">${data.exchange}</span></div>`;
        }
      }
    });

    this.typeAhead.bind("typeahead:selected", (event, datum, name) => {
      //this.value = datum.symbol;
      this.searcher = datum.symbol;
    });
    this.typeAhead.bind("typeahead:autocomplete", (event, datum, name) => {
      //this.value = datum.symbol;
      //this.searcher = datum.symbol;
    });
    // Typeahead will trigger an 'open' if input gains focus to display suggestions
    // This in turn triggers antoher async call 
    this.typeAhead.bind('typeahead:asyncrequest', (event, query, name) => {
      this.isSearching = true;
    });
    this.typeAhead.bind('typeahead:asyncreceive', (event, query, name) => {
      this.isSearching = false;
    });
    this.typeAhead.bind('typeahead:asynccancel', (event, query, name) => {
      this.isSearching = false;
    });
  }
}
