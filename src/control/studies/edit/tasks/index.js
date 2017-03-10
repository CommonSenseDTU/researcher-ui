// @flow
'use strict';

/**
 * Module dependencies.
 */
import Controller from '../../../../base.controller';
import request from 'request-promise';
import uuid from 'node-uuid';
import winston from 'winston';
import fs from 'fs';
import promisify from 'es6-promisify';
import { naiveShallowCopy } from '../../../../lib/shallow-copy';

/**
 * Type declarations.
 */
import type { Options } from '../../../../options.type';
import type { Template } from '../../../../template.type';
import type { Survey } from '../../survey.type';
import type { Step } from '../../survey.type';

/**
 * Promise based version of fs methods.
 */
const access = promisify(fs.access, {multiArgs: true});
const readFile = promisify(fs.readFile, {multiArgs: true});

/**
 * Class for '/studies/:id/tasks' editing routes.
 */
class Task extends Controller {

  /**
   * Create a Task instance.
   * Configure routes.
   *
   * @param {Options} opts - The options passed to pug when compiling
   */
  constructor(opts: Options) {
    super("./src/view/studies/edit/tasks", opts);

    var self = this;
    this.router.get('/studies/:id/tasks', async (ctx, next) => {
      await self.list(ctx, next);
    });

    this.router.get('/studies/tasks/step/create/:type', async (ctx, next) => {
      await self.createTaskStep(ctx, next);
    });
  }

  /**
   * Create a configuration for a survey request.
   * The context is expected to contain a bearer cookie with authentication for
   * the request for the resource server.
   *
   * @param {any} ctx - The Koa context
   * @param {string} surveyId - The id of the survey to request
   * @return {any} A dictionary with the request configuration
   */
  surveyRequest(ctx: any, surveyId: string): any {
    var bearer: string = ctx.cookies.get('bearer');
    return {
      uri: 'http://' + this.opts.resourceServer + '/v1.0.M1/surveys/' + surveyId,
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + bearer,
      },
      json: true
    };
  }

  /**
   * Handle Survey request errors.
   *
   * @param {any} ctx - The Koa context
   * @param {any} err - The error returned from the request method
   */
  surveyRequestError(ctx: any, err: any) {
    winston.error('Something went wrong: ' + err);
    winston.debug("code: " + err.response.statusCode);
    if (err.response.statusCode == 404) {
      // bubble file not found errors up
      ctx.throw(404);
    } else if (err.response.statusCode >= 400 && err.response.statusCode < 500) {
      // fall back to login page for all other client errors
      ctx.redirect('/join?return=' + ctx.path);
    } else {
      var copy = naiveShallowCopy(this.opts);
      Controller.setNoCacheHeaders(ctx);
      copy.tasks = [];
      copy.error = err;
      ctx.body = this.template(copy);
    }
  }

  /**
   * Asynchronously serve edit task settings UI
   * Handle /studies/:id/tasks GET requests
   *
   * @param {Context} ctx - Koa context
   * @param {Function} next - The next handler to proceed to after processing is complete
   */
  async list(ctx: any, next: Function) {
    var self = this;
    await request(
      self.surveyRequest(ctx, ctx.params.id)
    ).then(function (survey) {
      Controller.setNoCacheHeaders(ctx);
      var copy = naiveShallowCopy(self.opts);
      copy.surveyId = ctx.params.id;
      copy.tasks = survey.task.steps;
      ctx.body = self.template(copy);
    }).catch(function (err) {
      self.surveyRequestError(ctx, err);
    });
  }

  /**
   * Create a new task step.
   * Handle /studies/tasks/step/create/:type GET requests.
   *
   * @param {Context} ctx - Koa context
   * @param {Function} next - The next handler to proceed to after processing is complete
   */
  async createTaskStep(ctx: any, next: Function) {
    switch (ctx.params.type) {
      case 'gait':
      case 'custom':
        const filename: string = this.dirname + "/" + ctx.params.type + ".json";
        await access(filename, fs.R_OK).then(
          async () => {
            await readFile(filename).then(
              function (data) {
                return JSON.parse(data);
              }
            ).then(
              function (json) {
                var step: Step = json;
                step.id = uuid.v1();
                ctx.body = step;
                ctx.status = 201;
                ctx.type = 'application/json';
              }
            );
          }
        ).catch(function (err) {
          winston.error("Caught error: " + err);
          ctx.status = 500;
          ctx.type = 'application/json';
          ctx.body = JSON.stringify({
            error: err,
            type: ctx.params.type
          });
          winston.debug("Setting body to: " + ctx.body);
        });
        break;
      default:
        ctx.status = 406;
        ctx.type = 'application/json';
        ctx.body = JSON.stringify({ error: 'Unknown type: ' + ctx.params.type });
        return;
    }
  }
}

export default Task;
