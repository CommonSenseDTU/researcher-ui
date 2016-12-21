import Base from '../base.router.js';

export default class extends Base {
  
  constructor(opts) {
    super('./src/logout', opts);
    
    var self = this;
    this.router.get('/logout', function (ctx, next) {
      ctx.body = self.template(opts);
    });
  }
}
