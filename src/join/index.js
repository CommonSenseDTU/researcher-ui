// @flow
'use strict';

/**
 * Module dependencies.
 */
import Base from '../base.router.js';

/**
 * Type declarations.
 */
import type { Options } from '../options.type';

/**
 * Class for '/join' route.
 */
class Join extends Base {
  
  /**
   * Create a Join instance.
   * 
   * @param {Options} opts - The options passed to pug when compiling 
   */
  constructor(opts: Options) {
    super('./src/join', opts);
    
    var self = this;
    this.router.get('/join', function (ctx, next) {
      ctx.body = self.template(opts);
    });
  }
}

export default Join;
