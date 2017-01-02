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
    this.router.get('/', function (ctx, next) {
      var copy = self.naiveShallowCopy(self.opts);
      // TODO: load data from service instead of mockup
      copy.studies = [
        {
          title: 'Mood study',
          icon: '/src/studies/assets/app-icon.png',
          participantIds: [1, 2, 3],
          consentDocument: {
            sections: [
              {
                title: 'Introduction'
              }
            ]
          },
          task: {
            steps: [
              {
                question: 'How are you feeling?'
              }
            ]
          }
        }
      ];
      ctx.body = self.template(copy);
    });
  }
}

export default Studies;
