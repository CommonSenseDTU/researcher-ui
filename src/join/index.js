import Base from '../base.router.js';

export default class extends Base {
  
  constructor(opts) {
    super('./src/join', opts);
    
    var self = this;
    this.router.get('/join', function (ctx, next) {
      ctx.body = self.template(opts);
    });
  }
}
