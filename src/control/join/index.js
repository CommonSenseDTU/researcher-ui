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
 * Class for '/join' route.
 */
class Join extends Controller {

  /**
   * Create a Join instance.
   *
   * @param {Options} opts - The options passed to pug when compiling
   */
  constructor(opts: Options) {
    super(opts);

    var self = this;
    this.router.get('/join', function (ctx, next) {
      ctx.body = self.template(opts);
    });
  }
}

export default Join;
