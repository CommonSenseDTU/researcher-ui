// @flow
'use strict';

/**
 * Module dependencies.
 */
import Base from '../../base.router';
import request from 'request-promise';
import uuid from 'node-uuid';

/**
 * Type declarations.
 */
import type { Options } from '../../options.type';
import type { Template } from '../../template.type';
import type { ConsentSection } from '../survey.type';

/**
 * Class for '/studies/consent' routes.
 */
class ConsentSections extends Base {
  
  overviewTemplate: Template;
  
  /**
   * Create a ConsentSections instance.
   * Configure routes.
   * 
   * @param {Options} opts - The options passed to pug when compiling 
   */
  constructor(opts: Options) {
    const dirname: string = './src/studies/consent';
    
    super(dirname, opts);

    this.overviewTemplate = this.compileFile(dirname, 'overview.step.pug');
    
    var self = this;
    this.router.get('/studies/:id/consent', function (ctx, next) {
      self.consent(ctx, next);
    });

    this.router.get('/studies/consent/step/create/:type', function (ctx, next) {
      self.createConsentSection(ctx, next);
    });

    this.router.get('/studies/consent/steps/template/:type', function (ctx, next) {
      self.consentStepTemplate(ctx, next);
    });
  }

  /**
   * Serve edit survey consent UI
   * Handle /studies/consent/:id GET requests
   *
   * @param {Context} ctx - Koa context
   * @param {Function} next - The next handler to proceed to after processing is complete
   */
  consent(ctx: any, next: Function) {
    var copy = this.naiveShallowCopy(this.opts);
    copy.studyId = ctx.params.id;
    ctx.body = this.template(copy);
  }
  
  /**
   * Create a new consent section.
   * Handle /studies/consent/step/create/:type GET requests.
   *
   * @param {Context} ctx - Koa context
   * @param {Function} next - The next handler to proceed to after processing is complete
   */
  createConsentSection(ctx: any, next: Function) {
    switch (ctx.params.type) {
    case 'overview':
      ctx.body = this.createOverviewSection();
      break;
    default:
      ctx.status = 406;
      ctx.type = 'application/json';
      ctx.body = JSON.stringify({ error: 'Unknown type: ' + ctx.params.type });
      return;
    }
    ctx.status = 201;
    ctx.type = 'application/json';
  }
  
  /**
   * Create a new overview consent section.
   */
  createOverviewSection() {
    var step: ConsentSection = {
      id: uuid.v1(),
      creation_date_time: (new Date()).toJSON(),
      modification_date_time: (new Date()).toJSON(),
      type: 'overview',
      title: 'Welcome',
      summary: 'Replace this with an introduction to the survey which the users are joining.' +
        'This should be a short explanation of the consent flow which will follow. The' +
        'in-depth explanation can go in the full description which is accessible from the' +
        '"learn more" link below.',
      content: '# Welcome\r\n\r\n' +
        'Replace this with complete documentation of everything involved in consenting ' +
        'to this step in the consent document.'
    };
    return step;
  }
  
  /**
   * Serve new consent section template UI
   * Handle /studies/consent/steps/template/:type GET requests
   *
   * @param {Context} ctx - Koa context
   * @param {Function} next - The next handler to proceed to after processing is complete
   */
  consentStepTemplate(ctx: any, next: Function) {
    switch (ctx.params.type) {
    case 'overview':
      var copy = this.naiveShallowCopy(this.opts);
      copy.stepId = ctx.query.id;
      ctx.body = this.overviewTemplate(copy);
      break;
    default:
      ctx.status = 406;
      ctx.type = 'application/json';
      ctx.body = JSON.stringify({ error: 'Unknown type: ' + ctx.params.type });
      return;
    }
  }
  
}

export default ConsentSections;
