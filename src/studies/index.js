import router from 'koa-router';
import pug from 'pug';
import PugPluginNg from 'pug-plugin-ng';

export default class {
  
  constructor(opts) {
    this.opts = opts || {};
    this.router = router();
    
    this.template = pug.compileFile('./src/studies/index.pug', { 
      plugins: [PugPluginNg] 
    });
    
    var self = this;
    this.router.get('/', function (ctx, next) {
      opts.referer = ctx.headers.referer;
      ctx.body = self.template(opts);
    });
  }
  
  routes() {
    return this.router.routes();
  }
  
  allowedMethods() {
    return this.router.allowedMethods();
  }
}