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
 * Class for '/logout' route.
 */
class Logout extends Base {
  
  /**
   * Create a Logout instance.
   * 
   * @param {Options} opts - The options passed to pug when compiling 
   */
  constructor(opts: Options) {
    super('./src/logout', opts);
    
    var self = this;
    this.router.get('/logout', function (ctx, next) {
      ctx.body = self.template(opts);
    });
  }
}

export default Logout;