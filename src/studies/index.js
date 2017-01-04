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
 * Class for '/studies' route.
 */
class Studies extends Base {
  
  editTemplate: Template;
  editInfoTemplate: Template;
  editIconTemplate: Template;
  
  /**
   * Create a Studies instance.
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
      var bearer: string = ctx.cookies.get('bearer');
      await request({
        uri: 'http://' + opts.resourceServer + '/v1.0.M1/surveys/my',
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
    });
    
    this.router.post('/studies/create', function (ctx, next) {
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
    });
    
    this.router.get('/studies/:id', function (ctx, next) {
      var copy = self.naiveShallowCopy(self.opts);
      copy.title = 'Edit Survey';
      copy.surveyId = ctx.params.id;
      ctx.body = self.editTemplate(copy);
    });

    this.router.get('/studies/info/:id', function (ctx, next) {
      var copy = self.naiveShallowCopy(self.opts);
      copy.surveyId = ctx.params.id;
      ctx.body = self.editInfoTemplate(copy);
    });

    this.router.get('/studies/icon/:id', function (ctx, next) {
      var copy = self.naiveShallowCopy(self.opts);
      copy.surveyId = ctx.params.id;
      ctx.body = self.editIconTemplate(copy);
    });

  }
}

export default Studies;
