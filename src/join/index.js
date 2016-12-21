import Base from '../base.router.js';
import router from 'koa-router';
import pug from 'pug';
import PugPluginNg from 'pug-plugin-ng';

export default class extends Base {
  
  constructor(opts) {
    super('./src/join', opts);
    
    var self = this;
    this.router.get('/join', function (ctx, next) {
      ctx.body = self.template(opts);
    });
  }
}