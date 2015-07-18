import {customElement, noView, skipContentProcessing, bindable, inject, computedFrom} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';
import select from 'select2';
import Rx from 'rx';
//import 'styles/type-ahead.css!'

@noView()
@skipContentProcessing()
@inject(Element, HttpClient)
@bindable("value")
@customElement('select')
export class TypeAhead {
    constructor(element, http) {
        this.element = element;
        this.http = http;
    }
    bind() {
        console.log("bind value: ", this.value);
    }
    valueChanged(newValue) {
        console.log("bind value: ", newValue);
    }
    attached() {
        this.select = $(this.element).select2();
        console.log(this.element)
    }
}
