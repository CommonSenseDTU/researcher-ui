// @flow
'use strict';

/**
 * Module dependencies.
 */
import Controller from '../../../../../base.controller';
import request from 'request-promise';
import uuid from 'node-uuid';
import winston from 'winston';
import koaBody from 'koa-body';
import fs from 'fs';
import promisify from 'es6-promisify';
import { naiveShallowCopy } from '../../../../../lib/shallow-copy';
import amqp from 'amqplib/callback_api';

/**
 * Promise based version of fs methods.
 */
const access = promisify(fs.access, {multiArgs: true});
const writeFile = promisify(fs.writeFile, {multiArgs: true});
const mkdir = promisify(fs.mkdir, {multiArgs: true});

/**
 * Promise based version of amqp methods
 */
const amqp_connect = promisify(amqp.connect);

/**
 * Type declarations.
 */
import type { Options } from '../../../../../options.type';
import type { Template } from '../../../../../template.type';
import type { Survey } from '../../../survey.type';
import type { Step } from '../../../survey.type';

/**
 * Class for '/studies/:surveyId/tasks/:taskId' task setting editing routes.
 */
class TaskSettings extends Controller {

  gaitTemplate: Template;
  formTemplate: Template;
  customTemplate: Template;
  imageChoiceTemplate: Template;

  /**
   * Create a TaskSettings instance.
   * Configure routes.
   *
   * @param {Options} opts - The options passed to pug when compiling
   */
  constructor(opts: Options) {
    super("./src/view/studies/edit/tasks/settings", opts);

    winston.info("Using RabbitMQ server: " + opts.rabbitMQ);

    this.gaitTemplate = this.compileFile('gait.pug');
    this.customTemplate = this.compileFile('custom.pug');
    this.formTemplate = this.compileFile('form.pug');
    this.imageChoiceTemplate = this.compileFile('imagechoice.pug');

    var self = this;
    this.router.get('/studies/:surveyId/tasks/:taskId', async (ctx, next) => {
      await self.settings(ctx, next);
    });

    this.router.post('/studies/:surveyId/tasks/:taskId/clientSource',
        koaBody({
          multipart: true
        }),
        async (ctx, next) => {
      await self.uploadSource(ctx, next);
    });
  }

  /**
   * Get the proper body for a given step.
   * The step type determines which settings template should be used.
   *
   * @param {Step} step - the step to get the type for
   * @param {Options} opts - the runtime options to pass to the compiled template
   * @return {string} body from compiled template with the given options
   */
  bodyForStep(step: Step, opts: Options): string {
    switch (step.type) {
      case "gait":
        return this.gaitTemplate(opts);
      case "form":
        return this.formTemplate(opts);
      case "imagechoice":
        return this.imageChoiceTemplate(opts);
      case "custom":
        return this.customTemplate(opts);
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

  /**
   * Create folder if it doesn't exist.
   *
   * @param {string} name - folder name
   */
  async mkFolder(name: string) {
    await access(name, fs.X_OK).catch(async (error) => {
      // If folder isn't executable
      await mkdir(name).catch(function (error) {
        winston.error("Failed making folder %s: %s", name, error);
        throw error;
      });
    });
  }

  /**
   * Asynchronously handle file uploads
   * Handle /studies/:surveyId/tasks/:taskId/clientSource POST requests
   *
   * @param {Context} ctx - Koa context
   * @param {Function} next - The next handler to proceed to after processing is complete
   */
  async uploadSource(ctx: any, next: Function) {
    var self: TaskSettings = this;
    var studyId: string = ctx.params.surveyId;
    var stepId: string = ctx.params.taskId;
    var bearer: string = ctx.cookies.get('bearer');

    try {
      // Throw errors for various not acceptable reasons (caught below)
      if (!ctx.request.body.fields) throw "Missing fields";
      var contents = ctx.request.body.fields.clientCode;
      if (!contents) throw "Missing code";

      // Verify that survey belongs to user before performing any file operations
      await request({
        uri: 'http://' + self.opts.resourceServer + '/v1.0.M1/surveys/my',
        qs: {
          schema_version: "1.0"
        },
        headers: {
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + bearer
        },
        transform: function (body, response, resolveWithFullResponse) {
          var surveys: ?Survey[] = JSON.parse(body);
          if (!surveys) throw "Could not parse reponse";
          for (var current: Survey of surveys) {
            // Find the survey in the list of my surveys
            if (current.id == studyId) {
              return current;
            }
          }
          throw "Survey not found";
        }
      }).then(async (survey) => {
        var targetName: string = uuid.v1() + ".flow.js";

        /* Create a folder with format <prefix>/aa/bb/ given a uuid
         * aabbccdd-xxxx-xxxx-xxxx-xxxxxxxxxxxx to attempt to ensure that
         * files are evenly distributed into folder and that each folder
         * does not contain too many files.
         */
        var targetFolder: string = self.opts.uploadFolder;
        await self.mkFolder(targetFolder);
        targetFolder += "/files";
        await self.mkFolder(targetFolder);
        targetFolder += "/" + targetName.substr(0, 2);
        await self.mkFolder(targetFolder);
        targetFolder += "/" + targetName.substr(2, 2);
        await self.mkFolder(targetFolder);

        await writeFile(targetFolder + "/" + targetName, contents).then(
          async () => {
            var contentPath: string = "/files/" +
              targetName.substr(0, 2) + "/" +
              targetName.substr(2, 2) + "/" +
              targetName;

            if (!survey) throw "Missing survey";
            var steps: Step[] = survey.task.steps;
            for (var index: number = 0 ; index < steps.length ; index++ ) {
              if (steps[index].id == stepId) {
                var step = steps[index];
                var settings = step.settings;
                if (!settings) {
                  settings = {};
                  step.settings = settings;
                }
                settings["client"] = contentPath;
                break;
              }
            }

            await request({
              uri: 'http://' + self.opts.resourceServer + '/v1.0.M1/surveys',
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + bearer,
                'Content-Type': 'application/json'
              },
              resolveWithFullResponse: true,
              body: JSON.stringify(survey)
            }).then(async (response) => {
              await amqp_connect("amqp://" + self.opts.rabbitMQ).then(function (connection) {
                ctx.status = 201;
                ctx.type = 'application/json';
                ctx.body = JSON.stringify({
                  path: contentPath
                });
                connection.createChannel(function (err, channel) {
                  if (err) {
                    winston.error("amqp create channel error:", err);
                    return;
                  }
                  var q = 'babel';
                  channel.assertQueue(q, {durable: true});
                  if (!stepId) {
                    winston.error("Missing step id - bailing out");
                    return;
                  }
                  channel.sendToQueue(q, Buffer.from(JSON.stringify({
                    surveyId: survey.id,
                    stepId: stepId,
                    path: contentPath
                  })));
                  winston.info("Sent " + contentPath + " to babel queue");
                });
            }).catch(function (err) {
                winston.error("amqp connect error:", err);
                ctx.status = 500;
                ctx.type = 'application/json';
                ctx.body = JSON.stringify({
                  error: err
                });
              });
            });
          }
        );
      }).catch(function (error) {
        // Return error if the survey does not belong to the current user
        ctx.status = 403;
        ctx.type = 'application/json';
        ctx.body = JSON.stringify({
          error: "Survey not owned by user",
          causedBy: error
        });
        winston.debug("error body: ", ctx.body);
      });
    } catch (error) {
      // Handle not acceptable responses
      ctx.status = 406;
      ctx.type = 'application/json';
      ctx.body = JSON.stringify({
        error: error
      });
    }
  }
}

export default TaskSettings;
