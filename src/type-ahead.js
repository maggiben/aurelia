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
    states = ["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Dakota","North Carolina","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"];

    constructor(element, http) {
        this.element = element;
        this.http = http;
    }

    substringMatcher(strs) {
        console.log("invoked")
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
            console.log("matches: ", matches)
            cb(matches);
        };
    };

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
    }
 
    getSuggestions() {
        //var keyup = Rx.Observable.fromEvent($(this.element).find('input'), 'keyup')
        var keyup = Rx.Observable.fromEvent($(this.element), 'typeahead:asyncrequest')
            .map(function (e) {
                return e.target.value; // Project the text from the input
            })
            .filter(function (text) {
                var regex = new RegExp("^[a-zA-Z0-9_]*$"); // Match only alphanumric strings
                return regex.test(text);
            })
            .debounce(550)
            .distinctUntilChanged(); // Only if the value has changed

        var searcher = keyup.flatMapLatest(this.searchTerm);

        this.searcher = searcher;

        return (query, syncResults, asyncResults) => {
            var subscription = this.searcher.first().subscribe(
                (data) => {
                    return asyncResults(data);
                },
                function (error) {
                    return asyncResults([]);
                }
            );
        };
    }
    bind() {
        console.log("bind: ", this.value);
    }
    valueChanged(newValue) {
        console.log("valueChanged: ", newValue);
    }
    attached() {

        this.typeAhead = $(this.element).find('input').typeahead({
            hint: true,
            async: true,
            highlight: true,
            minLength: 2,
            display: 'symbol'
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
                suggestion: function(data) {
                    return '<div><strong class="symbol">' + data.symbol + '</strong><span class="name">' + data.name + '</span><span class="exchange">' + data.exchange + '</span></div>';
                }
            }
        });

        this.typeAhead.bind("typeahead:selected", (event, datum, name) => {
            this.value = datum.symbol;
        });
        this.typeAhead.bind("typeahead:autocomplete", (event, datum, name) => {
            this.value = datum.symbol;
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
