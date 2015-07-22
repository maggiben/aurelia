import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';
import select from 'select2';
import Rx from 'rx';

@inject(HttpClient)
export class TypeAhead {
    baseUrl = 'http://dev.markitondemand.com';
    constructor(http) {
        this.http = http;
    }
    getQuote(symbol) {
        return new HttpClient().createRequest('api/v2/Lookup/jsonp')
            .asJsonp()
            .withBaseUrl(this.baseUrl)
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
}
