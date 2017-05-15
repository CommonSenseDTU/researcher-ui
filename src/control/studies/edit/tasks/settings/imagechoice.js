// @flow
'use strict';

/**
 * Module dependencies.
 */
import Controller from '../../../../../base.controller';
import winston from 'winston';
import koaBody from 'koa-body';
import Icon from '../../icon';

/**
 * Type declarations.
 */
import type { Options } from '../../../../../options.type';

/**
 * Class for image choice task setting editing routes.
 */
class ImageChoiceSettings extends Controller {

  icon: Icon;

  /**
   * Create a ImageChoiceSettings instance.
   * Configure routes.
   *
   * @param {Options} opts - The options passed to pug when compiling
   */
  constructor(opts: Options) {
    super("./src/view/studies/edit/tasks/settings", opts);
    this.icon = new Icon(opts);

    var self = this;
    this.router.put('/studies/:id/tasks/imageChoice/upload',
        koaBody({
          multipart: true,
          formLimit: opts.uploadSizeLimit
        }),
        async (ctx, next) => {
      await self.icon.uploadIcon(ctx, next, false);
    });
  }


}

export default ImageChoiceSettings;
