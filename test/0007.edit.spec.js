'use strict'

import assert from 'assert';
import winston from 'winston';
import http from 'http';
import Koa from 'koa';
import jsdom from 'jsdom';
import fs from 'fs';

import Studies from '../src/control/studies';
import Edit from '../src/control/studies/edit';

import type { Options } from '../src/options.type';

/**
 * Naive promise stub implementation
 */
class Next {
  then(func: Function) {}
}

function next() {
  return new Next();
}

/**
 * Naive stub Koa implementation
 */
class Cookies {
  bearer: string

  get(name) {
    return this.bearer;
  }
}

class Context {
  cookies: Cookies
  body: any
  type: string
  status: number
  params: any

  constructor() {
    this.params = {};
    this.cookies = new Cookies();
    this.cookies.bearer = 'some:auth';
  }

  set(header: string, value: string) {
    winston.debug("setting header " + header + " to " + value);
  }

}

const app: Koa = new Koa();
var server: ?any;
var scriptLoadingFeatures = {
  FetchExternalResources: ["script", "link"],
  ProcessExternalResources: ["script"],
  SkipExternalResources: false
};

/**
 * Load jsdom resources from pwd.
 *
 * @param {resource} resource - The resource to load
 * @param {Function} callback - the function to call with the content of the fetched resource
 */
function pwdRelativeLoader (resource, callback: Function) {
  var pathname: string = resource.url.pathname;
  resource.url.pathname = process.cwd() + pathname;
  winston.debug("fetching resource:", resource.url.pathname);
  return resource.defaultFetch(callback);
}

describe('## Edit view', () => {
  describe('# Edit ', () => {
    before(function () {
      winston.level = 'none';
    });

    beforeEach(function() {
      app.use(async (ctx) => {
        ctx.body = {
          "id" : "4d817460-dd5f-11e6-a353-51c7ab7c347a",
          "title" : "Unnamed Survey",
          "user_id" : "test",
          "icon" : "/dist/public/view/studies/app-icon.png",
          "creation_date_time" : "2017-01-18T09:20:07.334Z",
          "consent_document" : {
            "id" : "4d817461-dd5f-11e6-a353-51c7ab7c347a",
            "creation_date_time" : "2017-01-18T09:20:07.415Z",
            "modification_date_time" : "2017-01-18T09:20:07.415Z",
            "sections" : [ ]
          },
          "task" : {
            "id" : "4d817462-dd5f-11e6-a353-51c7ab7c347a",
            "steps" : [ ]
          },
          "participant_ids" : [ ]
        }
      });
      server = http.createServer(app.callback()).listen(3003);
    });

    it('generates a well formed document', async function (done) {
      var opts: Options = {
        resourceServer: 'localhost:3003'
      }
      var context: Context = new Context();
      context.params.id = "4d817460-dd5f-11e6-a353-51c7ab7c347a";

      try {
        var edit: Edit = new Edit(opts);
        await edit.readStudy(context, next);
        assert.ok(context.body, "No body was set");

        var document: Document = jsdom.jsdom(context.body);
        assert.ok(document, "Could not parse document");
        done();
      } catch (err) {
        done(err);
      }
    });

    it('has expected survey name', async function (done) {
      var opts: Options = {
        resourceServer: 'localhost:3003'
      }
      var context: Context = new Context();
      context.params.id = "4d817460-dd5f-11e6-a353-51c7ab7c347a";

      try {
        var edit: Edit = new Edit(opts);
        await edit.readStudy(context, next);

        jsdom.env({
          html: context.body,
          src: ["edit.showInfoForm()"],
          resourceLoader: pwdRelativeLoader,
          features: scriptLoadingFeatures,
          done: function(err, window) {
            assert.ok(!err, "Error: " + err);
            assert.ok(window, "Missing window");
            assert.ok(window.document, "Missing document");
            assert.ok(window.edit, "Missing edit object");

            var surveyname: ?HTMLInputElement = window.document.getElementById("surveyname");
            assert.ok(surveyname, "surveyname element not found");
            winston.debug("surveyname: " + surveyname + " has value " + surveyname.value);
            assert.equal(surveyname.value, "Unnamed Survey", "Unexpected survey name");
            done();
          }
        });
      } catch (err) {
        done(err);
      }
    });

    afterEach(function() {
      server.close();
    });
  });
});
