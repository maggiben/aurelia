import 'bootstrap';
import 'bootstrap/css/bootstrap.css!';
import 'styles/styles.css!'

export class App {
  configureRouter(config, router){
    config.title = 'Aurelia';
    //config.options.pushState = true;
    config.map([
      //{ route: ['','welcome'], name: 'welcome',      moduleId: './welcome',      nav: true, title:'Welcome' },
      { route: ['', 'welcome', 'welcome/:id'], name: 'welcome',      moduleId: 'welcome',        nav: true, title: 'Welcome'},
      { route: ['flickr'],                     name: 'flickr',       moduleId: './flickr',       nav: true, title: 'Flickr' },
      { route: ['stock', 'stock/:symbol'],     name: 'stock',        moduleId: './stock',        nav: true, title: 'Stock' },
      { route: 'child-router',                 name: 'child-router', moduleId: './child-router', nav: true, title: 'Child Router' }
    ]);

    this.router = router;
  }
}
