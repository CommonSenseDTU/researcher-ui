// @flow
'use strict';

/**
 * Module dependencies.
 */
import Controller from '../../../../base.controller';
import request from 'request-promise';
import uuid from 'node-uuid';
import fs from 'fs';
import promisify from 'es6-promisify';
import { naiveShallowCopy } from '../../../../lib/shallow-copy';

/**
 * Type declarations.
 */
import type { Options } from '../../../../options.type';
import type { Template } from '../../../../template.type';
import type { ConsentSection } from '../../survey.type';

/**
 * Promise based version of fs methods.
 */
const access = promisify(fs.access, {multiArgs: true});
const readFile = promisify(fs.readFile, {multiArgs: true});

/**
 * Class for '/studies/consent' routes.
 */
class ConsentSections extends Controller {

  stepTemplate: Template;

  /**
   * Create a ConsentSections instance.
   * Configure routes.
   *
   * @param {Options} opts - The options passed to pug when compiling
   */
  constructor(opts: Options) {
    super("./src/view/studies/edit/consent", opts);

    this.stepTemplate = this.compileFile('step.pug');

    var self = this;
    this.router.get('/studies/:id/consent', function (ctx, next) {
      self.consent(ctx, next);
    });

    this.router.get('/studies/consent/step/create/:type', async (ctx, next) => {
      await self.createConsentSection(ctx, next);
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
    var copy = naiveShallowCopy(this.opts);
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
  async createConsentSection(ctx: any, next: Function) {
    switch (ctx.params.type) {
      case 'overview':
      case 'datagathering':
      case 'privacy':
      case 'datause':
      case 'timecommitment':
      case 'studysurvey':
      case 'studytasks':
      case 'withdrawing':
      case 'onlyindocument':
        const filename: string = this.dirname + "/" + ctx.params.type + ".json";
        await access(filename, fs.R_OK).then(
          async () => {
            await readFile(filename).then(
              function (data) {
                return JSON.parse(data);
              }
            ).then(
              function (json) {
                var section: ConsentSection = json;
                section.id = uuid.v1();
                section.creation_date_time = (new Date()).toJSON();
                section.modification_date_time = (new Date()).toJSON();
                ctx.body = section;
                ctx.status = 201;
                ctx.type = 'application/json';
              }
            );
          }
        ).catch(function (err) {
          ctx.status = 500;
          ctx.type = 'application/json';
          ctx.body = JSON.stringify({
            error: err,
            type: ctx.params.type
          });
        });
        break;
      default:
        ctx.status = 406;
        ctx.type = 'application/json';
        ctx.body = JSON.stringify({ error: 'Unknown type: ' + ctx.params.type });
        return;
    }
  }

  /**
   * Serve new consent section template UI
   * Handle /studies/consent/steps/template/:type GET requests
   *
   * @param {Context} ctx - Koa context
   * @param {Function} next - The next handler to proceed to after processing is complete
   */
  consentStepTemplate(ctx: any, next: Function) {
    var copy = naiveShallowCopy(this.opts);
    copy.stepId = ctx.query.id;
    switch (ctx.params.type) {
    case 'overview':
      copy.image = '/dist/public/transparent.png';
      break;
    case 'datagathering':
    case 'privacy':
    case 'datause':
    case 'timecommitment':
    case 'studysurvey':
    case 'studytasks':
    case 'withdrawing':
    case 'onlyindocument':
      copy.image = "/dist/public/view/studies/edit/consent/" + ctx.params.type + ".png";
      break;
    default:
      ctx.status = 406;
      ctx.type = 'application/json';
      ctx.body = JSON.stringify({ error: 'Unknown type: ' + ctx.params.type });
      return;
    }
    ctx.body = this.stepTemplate(copy);
  }

}

export default ConsentSections;
