// @flow
'use strict';

/**
 * Module dependencies.
 */
import Base from '../base.router';
import request from 'request-promise';
import uuid from 'node-uuid';

/**
 * Type declarations.
 */
import type { Options } from '../options.type';
import type { Template } from '../template.type';
import type { Survey } from './survey.type';

/**
 * Class for '/' and '/studies' routes.
 */
class Studies extends Base {
  
  editTemplate: Template;
  editInfoTemplate: Template;
  editIconTemplate: Template;
  
  /**
   * Create a Studies instance.
   * Inline handle / GET requests
   * 
   * @param {Options} opts - The options passed to pug when compiling 
   */
  constructor(opts: Options) {
    const dirname: string = './src/studies';
    
    super(dirname, opts);

    console.log("Using resource server: " + opts.resourceServer);

    this.editTemplate = this.compileFile(dirname, 'edit.pug');
    this.editInfoTemplate = this.compileFile(dirname, 'edit.info.pug');
    this.editIconTemplate = this.compileFile(dirname, 'edit.icon.pug');
    
    var self = this;
    this.router.get('/', async (ctx, next) => {
      await self.root(ctx, next);
    });
    
    this.router.post('/studies/create', function (ctx, next) {
      self.createStudy(ctx, next);
    });
    
    this.router.get('/studies/:id', async (ctx, next) => {
      await self.readStudy(ctx, next);
    });

    this.router.get('/studies/info/:id', function (ctx, next) {
      self.info(ctx, next);
    });

    this.router.get('/studies/icon/:id', function (ctx, next) {
      self.icon(ctx, next);
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
      var copy = self.naiveShallowCopy(self.opts);
      copy.studies = surveys;
      copy.title = 'Surveys';
      console.log('User has %d surveys', surveys.length);
      ctx.body = self.template(copy);
    }).catch(function (err) {
      var copy = self.naiveShallowCopy(self.opts);
      console.log('Call failed: ' + err);
      copy.error = err;
      copy.studies = [];
      ctx.body = self.template(copy);
    });
  }

  /**
   * Create a new study with no content.
   * Handle /studies/create POST requests.
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
      icon: '/src/studies/assets/app-icon.png',
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
    
    ctx.status = 201;
    ctx.type = 'application/json';
    ctx.body = JSON.stringify(survey);
  }

  /**
   * Asynchronously serve edit survey UI
   * Handle /studies/:id GET requests
   *
   * @param {Context} ctx - Koa context
   * @param {Function} next - The next handler to proceed to after processing is complete
   */
  async readStudy(ctx: any, next: Function) {
    var self = this;
    var bearer: string = ctx.cookies.get('bearer');
    await request({
      uri: 'http://' + self.opts.resourceServer + '/v1.0.M1/surveys/' + ctx.params.id,
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + bearer,
      },
      json: true
    }).then(function (survey) {
      var copy = self.naiveShallowCopy(self.opts);
      copy.title = 'Edit Survey';
      copy.survey = survey;
      copy.json = JSON.stringify(survey);
      ctx.body = self.editTemplate(copy);
    }).catch(function (err) {
      console.log('Something went wrong: ' + err);
      var copy = self.naiveShallowCopy(self.opts);
      copy.title = 'Edit Survey';
      copy.survey = {};
      copy.json = '{}';
      copy.error = err;
      ctx.body = self.editTemplate(copy);
    });
  }
  
  /**
   * Serve edit survey general information UI
   * Handle /studies/info/:id GET requests
   *
   * @param {Context} ctx - Koa context
   * @param {Function} next - The next handler to proceed to after processing is complete
   */
  info(ctx: any, next: Function) {
    var copy = this.naiveShallowCopy(this.opts);
    copy.surveyId = ctx.params.id;
    ctx.body = this.editInfoTemplate(copy);
  }
  
  /**
   * Serve edit survey icon UI
   * Handle /studies/icon/:id GET requests
   *
   * @param {Context} ctx - Koa context
   * @param {Function} next - The next handler to proceed to after processing is complete
   */
  icon(ctx: any, next: Function) {
    var copy = this.naiveShallowCopy(this.opts);
    copy.surveyId = ctx.params.id;
    ctx.body = this.editIconTemplate(copy);
  }
}

export default Studies;
