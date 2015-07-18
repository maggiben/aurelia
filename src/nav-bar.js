import {bindable} from 'aurelia-framework';

export class NavBar {
  @bindable router = null;
  term = '';
  stateChanged(newValue) {
    console.log(newValue)
  }
}
