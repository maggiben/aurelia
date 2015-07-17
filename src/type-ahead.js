import {inject, customElement, bindable} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';
import typeahead from 'typeahead';
import Rx from 'rx';
import 'styles/type-ahead.css!'


@inject(Element, HttpClient)
@bindable("value")
@customElement('type-ahead')
export class TypeAhead {
 
    @bindable format = "DD/MM/YY";
    isSearching = false;
    //states = ["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Dakota","North Carolina","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"];
    states = ["Alabama","Alaska"];

    constructor(element, http) {
        this.element = element;
        this.http = http;
    }

    substringMatcher(strs) {
      return function findMatches(q, cb) {
        var matches, substringRegex;
     
        // an array that will be populated with substring matches
        matches = [];
     
        // regex used to determine if a string contains the substring `q`
        substringRegex = new RegExp(q, 'i');
     
        // iterate through the pool of strings and for any string that
        // contains the substring `q`, add it to the `matches` array
        $.each(this.states, function(i, str) {
          if (substringRegex.test(str)) {
            matches.push(str);
          }
        });
     
        cb(matches);
      };
    };
    searchTerm() {
        return function findMatches(query, syncResults, asyncResults) {
            if(!query.length) {
                syncResults([]);
                return;
            }
            var client = new HttpClient();
            client.createRequest('api/v2/Lookup/jsonp')
            .asJsonp()
            .withBaseUrl('http://dev.markitondemand.com')
            .withParams({
                input: query
            })
            .withCallbackParameterName('callback')
            .send()
            .then(result => {
                var suggestions = result.response.map(function(item, index){
                    return {
                        symbol: item.Symbol,
                        name: item.Name,
                        exchange: item.Exchange
                    };
                })/*.filter(function(item, index, array){
                    return array.indexOf(item) === index;
                })*/;

                //console.log("result: ", suggestions);

                return asyncResults(suggestions);
                //asyncResults([{"Symbol":"IBM","Name":"International Business Machines Corp","Exchange":"BATS Trading Inc"},{"Symbol":"IBMSY","Name":"IBM ALPHA INDEX","Exchange":"NASDAQ"},{"Symbol":"VXIBM","Name":"CBOE IBM VIX Index","Exchange":"Market Data Express"},{"Symbol":"AXI","Name":"NAS OMX Alpha   IBM vs. SPY Settle","Exchange":"NASDAQ"}])
            });
        };
    }
    searchTerm2(term) {
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
    }
 
    searchTerm3() {
        return (query, syncResults, asyncResults) => {
            var subscription = this.searcher.first().subscribe(
                (data) => {
                    console.log("HAS INPUTC: ", data)
                    return asyncResults(data);
                    //this.states = this.states.concat(data[1]);
                },
                function (error) {

                }
            );
            //return syncResults([{"Symbol":"IBM","Name":"International Business Machines Corp","Exchange":"BATS Trading Inc"},{"Symbol":"IBMSY","Name":"IBM ALPHA INDEX","Exchange":"NASDAQ"},{"Symbol":"VXIBM","Name":"CBOE IBM VIX Index","Exchange":"Market Data Express"},{"Symbol":"AXI","Name":"NAS OMX Alpha   IBM vs. SPY Settle","Exchange":"NASDAQ"}])
        };
    }
    bind() {
        console.log("bind value: ", this.value);
    }
    valueChanged(newValue) {

    }
    attached() {
        var keyup = Rx.Observable.fromEvent($(this.element).find('input'), 'keyup')
            .map(function (e) {
                return e.target.value; // Project the text from the input
            })
            .filter(function (text) {
                return text.length > 2; // Only if the text is longer than 2 characters
            })
            .debounce(250)
            .distinctUntilChanged(); // Only if the value has changed

        var searcher = keyup.flatMapLatest(this.searchTerm2);

        this.searcher = searcher;
        /*var subscription = searcher.first().subscribe(
            (data) => {
                console.log("HAS INPUT: ", data)
                //this.states = this.states.concat(data[1]);
            },
            function (error) {

            }
        );*/

        //$('#the-basics .typeahead')
        this.typeAhead = $(this.element).find('input').typeahead({
            hint: true,
            async: true,
            highlight: true,
            minLength: 2,
            //display: 'symbol'
        },
        {
            name: 'tickers',
            //valueKey: 'name',
            //limit: 4,
            displayKey: 'symbol',
            source: this.searchTerm3(),
            matcher: function(item) {
                console.log("matcher: !", item)
            },
            templates: {
                notFound: [
                    '<div class="empty-message">',
                        'unable to find any symbols that match the current query',
                    '</div>'
                ].join('\n'),
                suggestion: function(data) {
                    console.log("suggestions: ", data);
                    return '<div><strong class="symbol">' + data.symbol + '</strong><span class="name">' + data.name + '</span><span class="exchange">' + data.exchange + '</span></div>';
                }
            }
        });

        this.typeAhead.bind("typeahead:selected", (event, datum, name) => {
            this.value = datum.symbol;
        });
        this.typeAhead.bind('typeahead:asyncrequest', (event, query, name) => {
            this.isSearching = true;
        });
        this.typeAhead.bind('typeahead:asyncreceive', (event, query, name) => {
            this.isSearching = false;
        });
        this.typeAhead.bind('typeahead:asynccancel', (event, query, name) => {
            this.isSearching = false;
        });
        /*
        this.datePicker = $(this.element).find('.input-group.date')
            .datetimepicker({
                format: this.format,
                showClose: true,
                showTodayButton: true
            });
 
        this.datePicker.on("dp.change", (e) => {
            this.value = moment(e.date).format(this.format);
        });
        */
    }
}
