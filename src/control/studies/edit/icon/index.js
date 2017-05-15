// @flow
'use strict';

/**
 * Module dependencies.
 */
import Controller from '../../../../base.controller';
import request from 'request-promise';
import uuid from 'node-uuid';
import winston from 'winston';
import koaBody from 'koa-body';
import fs from 'fs';
import promisify from 'es6-promisify';
import { naiveShallowCopy } from '../../../../lib/shallow-copy';

/**
 * Type declarations.
 */
import type { Options } from '../../../../options.type';
import type { Template } from '../../../../template.type';
import type { Survey } from '../../survey.type';

type KoaBodyFile = {
  size: number,
  path: string,
  name: string,
  type: string,
  mtime: string
};

/**
 * Promise based version of fs methods.
 */
const access = promisify(fs.access, {multiArgs: true});
const rename = promisify(fs.rename, {multiArgs: true});
const mkdir = promisify(fs.mkdir, {multiArgs: true});
const unlink = promisify(fs.unlink);

/**
 * Class for '/studies/:id/*' editing routes.
 */
class Icon extends Controller {

  /**
   * Create a Icon instance.
   * Configure routes.
   *
   * @param {Options} opts - The options passed to pug when compiling
   */
  constructor(opts: Options) {
    super("./src/view/studies/edit/icon", opts);

    winston.info("Using upload folder: " + opts.uploadFolder);
    winston.info("Using upload size limit: " + opts.uploadSizeLimit);

    var self: Icon = this;
    this.router.get('/studies/:id/icon', function (ctx, next) {
      self.icon(ctx, next);
    });

    this.router.put('/studies/:id/icon',
        koaBody({
          multipart: true,
          formLimit: opts.uploadSizeLimit
        }),
        async (ctx, next) => {
      await self.uploadIcon(ctx, next, true);
    });
  }

  /**
   * Serve edit survey icon UI
   * Handle /studies/:id/icon GET requests
   *
   * @param {Context} ctx - Koa context
   * @param {Function} next - The next handler to proceed to after processing is complete
   */
  icon(ctx: any, next: Function) {
    var copy = naiveShallowCopy(this.opts);
    copy.studyId = ctx.params.id;
    ctx.body = this.template(copy);
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
   * Remove icon file in given survey.
   * Only files inside the '/files/' sandbox should be deleted.
   *
   * @param {Survey} survey - the survey whose icon to remove.
   */
  async removeIcon(survey: Survey) {
    var self: Icon = this;
    var currentFilename: ?string = survey.icon;
    if (currentFilename) {
      if (currentFilename.indexOf("/../") != -1) {
        // Attempts to escape file sandbox are not allowed.
        throw "Illegal current file name: " + currentFilename;
      }
      if (currentFilename.startsWith("/files/")) {
        // Delete existing file
        currentFilename = self.opts.uploadFolder + currentFilename;
        await unlink(currentFilename).then(function(){
          winston.debug("Unlinked previous file", currentFilename);
        }).catch(function (error) {
          // Proceed even if deleting old file failed
          winston.error("Unable to delete previous file %s: %s", currentFilename, error);
        });
      }
    }
  }

  /**
   * Create a promise to request the survey from the resource server.
   *
   * Throws exception if the user doesn't own a survey with the given id.
   *
   * @param {string} studyId - the survey to find
   * @param {string} bearer - the credentials to use when requesting surveys
   * @return {Survey} the survey if the user owns it
   */
  requestSurvey(studyId: string, bearer: string) {
    var self: Icon = this;
    return promisify(function(callback) { request({
      uri: 'http://' + self.opts.resourceServer + '/v1.0.M1/surveys/my',
      qs: {
        schema_version: "1.0"
      },
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + bearer,
      },
      transform: function (body, response, resolveWithFullResponse) {
        var surveys: Survey[] = JSON.parse(body);
        winston.debug("got " + surveys.length + " surveys");
        winston.debug("looking for studyId: " + studyId);
        for (var survey: Survey of surveys) {
          // Find the survey in the list of my surveys
          winston.debug("comparing " + survey.id + " to " + studyId);
          if (survey.id == studyId) {
            winston.debug("returning survey: " + survey.id);
            return JSON.stringify(survey);
          }
        }
        throw "Survey not found";
      }
    }).then(callback) });
  }

  /**
   * Asynchronously handle file uploads
   * Handle /studies/:id/icon PUT requests
   *
   * @param {Context} ctx - Koa context
   * @param {Function} next - The next handler to proceed to after processing is complete
   * @param {boolean} uopdateSurvey - true if survey should be updated with uploaded icon
   */
  async uploadIcon(ctx: any, next: Function, updateSurvey: boolean) {
    var self: Icon = this;
    var studyId: string = ctx.params.id;
    var bearer: string = ctx.cookies.get('bearer');

    winston.debug("in uploadIcon");

    try {
      // Throw errors for various not acceptable reasons (caught below)
      if (!ctx.request.body.files) throw "Missing files";
      var file: ?KoaBodyFile = ctx.request.body.files.file;
      if (!file) throw "Missing file";
      var extension: ?string;
      switch (file.type) {
        case "image/png":
          extension = ".png";
          break;
        case "image/jpeg":
          extension = ".jpg";
          break;
        case "application/pdf":
          extension = ".pdf";
          break;
        default:
          throw "Unsupported file type";
      }
      var filename: string = file.path;

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
        await self.removeIcon(survey);

        await access(filename, fs.R_OK).then(
          async () => {
            var targetName: string = uuid.v1() + extension;

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

            await rename(filename, targetFolder + "/" + targetName).then(
              async () => {
                var iconPath: string = "/files/" +
                  targetName.substr(0, 2) + "/" +
                  targetName.substr(2, 2) + "/" +
                  targetName;

                if (updateSurvey) {
                  if (!survey) throw "Missing survey";
                  survey.icon = iconPath;

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
                  }).then(function (response) {
                    ctx.status = response.statusCode;
                    ctx.type = 'application/json';
                    ctx.body = JSON.stringify({
                      path: iconPath
                    });
                  });
                } else {
                  ctx.status = 201;
                  ctx.type = 'application/json';
                  ctx.body = JSON.stringify({
                    path: iconPath
                  });
                }
              }
            );
          }
        ).catch(function (error) {
          // Handle file errors
          winston.error("Caught error: " + error);
          ctx.status = 500;
          ctx.type = 'application/json';
          ctx.body = JSON.stringify({
            error: error,
          });
        });

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

export default Icon;
