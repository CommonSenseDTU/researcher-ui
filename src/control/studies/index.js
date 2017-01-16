// @flow
'use strict';

/**
 * Module dependencies.
 */
import Controller from '../../base.controller';
import request from 'request-promise';
import uuid from 'node-uuid';
import { naiveShallowCopy } from '../../lib/shallow-copy';

/**
 * Type declarations.
 */
import type { Options } from '../../options.type';
import type { Template } from '../../template.type';
import type { Survey } from './survey.type';

/**
 * Class for '/' and '/studies' routes.
 */
class Studies extends Controller {

  /**
   * Create a Studies instance.
   * Configure routes.
   *
   * @param {Options} opts - The options passed to pug when compiling
   */
  constructor(opts: Options) {
    super("./src/view/studies", opts);

    var self = this;
    this.router.get('/', async (ctx, next) => {
      await self.root(ctx, next);
    });

    this.router.get('/studies/create', function (ctx, next) {
      self.createStudy(ctx, next);
    });
  }

  /**
   * Asynchronously serve root navigation and studies list UI
   * Handle / GET requests.
   *
   * @param {Context} ctx - Koa context
   * @param {Function} next - The next handler to proceed to after processing is complete
   */
  async root(ctx: any, next: Function) {
    var self = this;
    var bearer: string = ctx.cookies.get('bearer');
    await request({
      uri: 'http://' + this.opts.resourceServer + '/v1.0.M1/surveys/my',
      qs: {
        schema_version: '1.0'
      },
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + bearer,
      },
      json: true
    }).then(function (surveys) {
      var copy = naiveShallowCopy(self.opts);
      Controller.setNoCacheHeaders(ctx);
      copy.studies = surveys;
      copy.title = 'Surveys';
      console.log('User has %d surveys', surveys.length);
      ctx.body = self.template(copy);
    }).catch(function (err) {
      var copy = naiveShallowCopy(self.opts);
      console.log('Call failed: ' + err);
      Controller.setNoCacheHeaders(ctx);
      copy.error = err;
      copy.studies = [];
      ctx.body = self.template(copy);
    });
  }

  /**
   * Create a new study with no content.
   * Handle /studies/create GET requests.
   *
   * @param {Context} ctx - Koa context
   * @param {Function} next - The next handler to proceed to after processing is complete
   */
  createStudy(ctx: any, next: Function) {
    var userId: string = ctx.cookies.get('userid');
    var survey: Survey = {
      id: uuid.v1(),
      user_id: userId,
      title: 'Unnamed Survey',
      icon: '/dist/public/view/studies/app-icon.png',
      creation_date_time: (new Date()).toJSON(),
      consent_document: {
        id: uuid.v1(),
        creation_date_time: (new Date()).toJSON(),
        modification_date_time: (new Date()).toJSON(),
        sections: []
      },
      task: {
        id: uuid.v1(),
        steps: []
      },
      participant_ids: []
    };

    Controller.setNoCacheHeaders(ctx);
    ctx.status = 201;
    ctx.type = 'application/json';
    ctx.body = JSON.stringify(survey);
  }
}

export default Studies;
