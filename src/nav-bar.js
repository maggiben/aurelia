import {bindable} from 'aurelia-framework';

export class NavBar {
  @bindable router = null;
  term = 'vax';
  termx = 'caca';
  stateChanged(newValue) {
    console.log(newValue)
  }
  termChanged(newValue) {
    console.log("termChanged !!!", newValue)
  }
}
