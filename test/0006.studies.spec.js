'use strict'

import assert from 'assert';
import winston from 'winston';
import http from 'http';
import Koa from 'koa';
import jsdom from 'jsdom';

import Studies from '../src/control/studies';

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

  constructor() {
    this.cookies = new Cookies();
    this.cookies.bearer = 'some:auth';
  }

  set(header: string, value: string) {
    winston.debug("setting header " + header + " to " + value);
  }

}

const app: Koa = new Koa();
var server: ?any;

describe('## Studies view', () => {
  describe('# Root ', () => {
    before(function() {
      winston.level = 'error';
      app.use(async (ctx) => {
        ctx.body = {};
      });
      server = http.createServer(app.callback()).listen(3003);
    });

    it('root generates a well formed document', async function (done) {
      var opts: Options = {
        resourceServer: 'localhost:3003'
      }
      var context: Context = new Context();

      try {
        var studies: Studies = new Studies(opts);
        await studies.root(context, next);
        assert.ok(context.body, "No body was set");

        var document: Document = jsdom.jsdom(context.body);
        assert.ok(document, "Could not parse document");
        done();
      } catch (err) {
        done(err);
      }
    });

    it('has logout button', async function (done) {
      var opts: Options = {
        resourceServer: 'localhost:3003'
      }
      var context: Context = new Context();

      try {
        var studies: Studies = new Studies(opts);
        await studies.root(context, next);
        var document: Document = jsdom.jsdom(context.body);
        assert.ok(document.querySelector("a[href='/logout']"), "Could not find logout button");
        done();
      } catch (err) {
        done(err);
      }
    });

    it('has a create survey button', async function (done) {
      var opts: Options = {
        resourceServer: 'localhost:3003'
      }
      var context: Context = new Context();

      try {
        var studies: Studies = new Studies(opts);
        await studies.root(context, next);
        var document: Document = jsdom.jsdom(context.body);
        var list = document.evaluate("//li[text()='Create New Study']", document, null, 0, null);
        var element = list.iterateNext();
        assert.ok(element, "Create New Survey button not found");
        done();
      } catch (err) {
        done(err);
      }
    });

    after(function() {
      server.close();
    });
  });
});
