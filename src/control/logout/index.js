// @flow
'use strict';

/**
 * Module dependencies.
 */
import Controller from '../../base.controller';

/**
 * Type declarations.
 */
import type { Options } from '../../options.type';

/**
 * Class for '/logout' route.
 */
class Logout extends Controller {

  /**
   * Create a Logout instance.
   *
   * @param {Options} opts - The options passed to pug when compiling
   */
  constructor(opts: Options) {
    super("./src/view/logout", opts);

    var self = this;
    this.router.get('/logout', function (ctx, next) {
      ctx.body = self.template(opts);
    });
  }
}

export default Logout;
