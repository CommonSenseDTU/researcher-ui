// @flow
'use strict';

/**
 * Module dependencies.
 */
import Controller from '../../../../../base.controller';
import request from 'request-promise';
import uuid from 'node-uuid';
import winston from 'winston';
import { naiveShallowCopy } from '../../../../../lib/shallow-copy';

/**
 * Type declarations.
 */
import type { Options } from '../../../../../options.type';
import type { Template } from '../../../../../template.type';
import type { Step } from '../../../survey.type';

/**
 * Class for '/studies/:surveyId/tasks/:taskId' task setting editing routes.
 */
class TaskSettings extends Controller {

  gaitTemplate: Template;

  /**
   * Create a TaskSettings instance.
   * Configure routes.
   *
   * @param {Options} opts - The options passed to pug when compiling
   */
  constructor(opts: Options) {
    super("./src/view/studies/edit/tasks/settings", opts);

    this.gaitTemplate = this.compileFile('gait.pug');

    var self = this;
    this.router.get('/studies/:surveyId/tasks/:taskId', async (ctx, next) => {
      await self.settings(ctx, next);
    });
  }

  /**
   * Get the proper body for a given step.
   * The step type determines which settings template should be used.
   *
   * @param {Step} step - the step to get the type for
   * @param {Options} opt - the runtime options to pass to the compiled template
   * @return {string} body from compiled template with the given options
   */
  bodyForStep(step: Step, opts: Options): string {
    switch (step.type) {
      case "gait":
        return this.gaitTemplate(opts);
      default:
        return this.template(opts);
    }
  }

  /**
   * Get settings for a task
   * Handle /studies/:surveyId/tasks/:taskId GET requests.
   *
   * @param {Context} ctx - Koa context
   * @param {Function} next - The next handler to proceed to after processing is complete
   */
  async settings(ctx: any, next: Function) {
    winston.debug("Running TaskSettings#settings");

    var self = this;
    var bearer: string = ctx.cookies.get('bearer');
    await request({
      uri: 'http://' + this.opts.resourceServer + '/v1.0.M1/surveys/' + ctx.params.surveyId + '/tasks/' + ctx.params.taskId,
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + bearer,
      },
      json: true
    }).then(function (step) {
      var copy = naiveShallowCopy(self.opts);
      Controller.setNoCacheHeaders(ctx);
      copy.surveyId = ctx.params.surveyId;
      copy.step = step;
      ctx.body = self.bodyForStep(step, copy);
    }).catch(function (err) {
      winston.error('Call failed: ' + err);
      if (err.response && err.response.statusCode >= 400 && err.response.statusCode < 500) {
        // fall back to login page for all client errors
        ctx.redirect('/join?return=' + ctx.path);
      } else {
        var copy = naiveShallowCopy(self.opts);
        Controller.setNoCacheHeaders(ctx);
        copy.surveyId = ctx.params.surveyId;
        copy.error = err;
        copy.step = {};
        ctx.body = self.template(copy);
      }
    });
  }
}

export default TaskSettings;
