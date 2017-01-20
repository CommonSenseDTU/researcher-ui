// @flow
'use strict';

/**
 * Module dependencies.
 */
import Controller from '../../../base.controller';
import request from 'request-promise';
import uuid from 'node-uuid';
import winston from 'winston';
import { naiveShallowCopy } from '../../../lib/shallow-copy';

/**
 * Type declarations.
 */
import type { Options } from '../../../options.type';
import type { Template } from '../../../template.type';
import type { Survey } from '../survey.type';

/**
 * Class for '/studies/:id/*' editing routes.
 */
class Edit extends Controller {

  infoTemplate: Template;
  iconTemplate: Template;

  /**
   * Create a Studies instance.
   * Configure routes.
   *
   * @param {Options} opts - The options passed to pug when compiling
   */
  constructor(opts: Options) {
    super("./src/view/studies/edit", opts);

    winston.info("Using resource server: " + opts.resourceServer);

    this.infoTemplate = this.compileFile('info.pug');
    this.iconTemplate = this.compileFile('icon.pug');

    var self = this;
    this.router.get('/studies/:id', async (ctx, next) => {
      await self.readStudy(ctx, next);
    });

    this.router.get('/studies/:id/info', function (ctx, next) {
      self.info(ctx, next);
    });

    this.router.get('/studies/:id/icon', function (ctx, next) {
      self.icon(ctx, next);
    });

    this.router.get('/studies/:id/tasks', function (ctx, next) {
      ctx.body = 'Task info here';
    });

    this.router.get('/studies/:id/test', function (ctx, next) {
      ctx.body = 'Test flight info here';
    });

    this.router.get('/studies/:id/appstore', function (ctx, next) {
      ctx.body = 'App store flight info here';
    });
  }

  /**
   * Asynchronously serve edit survey UI
   * Handle /studies/:id GET requests
   *
   * @param {Context} ctx - Koa context
   * @param {Function} next - The next handler to proceed to after processing is complete
   */
  async readStudy(ctx: any, next: Function) {
    var self: Edit = this;
    var bearer: string = ctx.cookies.get('bearer');
    await request({
      uri: 'http://' + self.opts.resourceServer + '/v1.0.M1/surveys/' + ctx.params.id,
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + bearer,
      },
      json: true
    }).then(function (survey) {
      var copy = naiveShallowCopy(self.opts);
      Controller.setNoCacheHeaders(ctx);
      copy.title = 'Edit Survey';
      copy.survey = survey;
      copy.json = JSON.stringify(survey);
      ctx.body = self.template(copy);
    }).catch(function (err) {
      winston.error('Something went wrong: ' + err);
      winston.debug("code: " + err.response.statusCode);
      if (err.response.statusCode >= 400 && err.response.statusCode < 500) {
        // fall back to login page for all client errors
        ctx.redirect('/join?return=' + ctx.path);
      } else {
        var copy = naiveShallowCopy(self.opts);
        Controller.setNoCacheHeaders(ctx);
        copy.title = 'Edit Survey';
        copy.survey = {};
        copy.json = '{}';
        copy.error = err;
        ctx.body = self.template(copy);
      }
    });
  }

  /**
   * Serve edit survey general information UI
   * Handle /studies/:id/info GET requests
   *
   * @param {Context} ctx - Koa context
   * @param {Function} next - The next handler to proceed to after processing is complete
   */
  info(ctx: any, next: Function) {
    var copy = naiveShallowCopy(this.opts);
    copy.surveyId = ctx.params.id;
    ctx.body = this.infoTemplate(copy);
  }

  /**
   * Serve edit survey icon UI
   * Handle /studies/:id/icon GET requests
   *
   * @param {Context} ctx - Koa context
   * @param {Function} next - The next handler to proceed to after processing is complete
   */
  icon(ctx: any, next: Function) {
    var copy = naiveShallowCopy(this.opts);
    copy.studyId = ctx.params.id;
    ctx.body = this.iconTemplate(copy);
  }
}

export default Edit;
