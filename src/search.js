import {customAttribute, noView, skipContentProcessing, bindable, inject, computedFrom} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';
import Rx from 'rx';

@noView()
@skipContentProcessing()
@inject(Element, HttpClient)
@bindable("value")
@customAttribute('search')
export class TypeAhead {
    constructor(element, http) {
        this.element = element;
        this.http = http;
    }
    bind() {
        console.log("bind value: ", this.value);
    }
    valueChanged(newValue) {
        console.log("valueChanged value: ", newValue);
        this.value = newValue;
    }
    attached() {
        this.select = $(this.element).closest('.ui.search').search({
            type: 'category',
            minCharacters: 3,
            apiSettings: {
                onResponse: function(githubResponse) {
                    var
                        response = {
                            results: {}
                        };
                    // translate github api response to work with search
                    $.each(githubResponse.items, function(index, item) {
                        var
                            language = item.language || 'Unknown',
                            maxResults = 8;
                        if (index >= maxResults) {
                            return false;
                        }
                        // create new language category
                        if (response.results[language] === undefined) {
                            response.results[language] = {
                                name: language,
                                results: []
                            };
                        }
                        // add result to category
                        response.results[language].results.push({
                            title: item.name,
                            description: item.description,
                            url: item.html_url
                        });
                    });
                    return response;
                },
                url: '//api.github.com/search/repositories?q={query}'
            }
        });
        console.log(this.element)
    }
}
