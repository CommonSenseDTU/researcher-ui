import router from 'koa-router';
import pug from 'pug';
import PugPluginNg from 'pug-plugin-ng';

export default class {
  
  constructor(dirname, opts) {
    this.opts = opts || {};
    this.router = router();
    
    this.template = pug.compileFile(dirname + '/index.pug', {
      basedir: process.cwd() + '/src/lib/pug',
      plugins: [PugPluginNg] 
    });
  }
  
  routes() {
    return this.router.routes();
  }
  
  allowedMethods() {
    return this.router.allowedMethods();
  }

  naiveShallowCopy(original) {
    // First create an empty object
    // that will receive copies of properties
    var clone = {};
    var key;
      
    for (key in original) {
      // copy each property into the clone
      clone[key] = original[key];
    }
      
    return clone;
  }
}
