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
  }
}

export default Studies;
