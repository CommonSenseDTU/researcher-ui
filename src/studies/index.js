// @flow
'use strict';

/**
 * Module dependencies.
 */
import Base from '../base.router.js';
import request from 'request-promise';

/**
 * Type declarations.
 */
import type { Options } from '../options.type';

/**
 * Class for '/studies' route.
 */
class Studies extends Base {
  
  /**
   * Create a Studies instance.
   * 
   * @param {Options} opts - The options passed to pug when compiling 
   */
  constructor(opts: Options) {
    super('./src/studies', opts);
    
    var self = this;
    this.router.get('/', async (ctx, next) => {
      var bearer = ctx.cookies.get('bearer');
      await request({
        uri: 'http://localhost:8083/v1.0.M1/surveys/my',
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
  }
}

export default Studies;
