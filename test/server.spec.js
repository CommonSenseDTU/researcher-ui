'use strict'

import assert from 'assert';
import { bearerAuth } from '../src/server';

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
  didRedirect: boolean
  cookies: Cookies
  authMethod: Function
  
  constructor(shouldRedirect, authMethod) {
    this.didRedirect = false;
    this.cookies = new Cookies();
    this.authMethod = authMethod;
    if (!shouldRedirect) {
      this.cookies.bearer = 'some:auth';
    }
  }
  
  redirect(url) {
    this.didRedirect = true;
  }
}

describe('## Server', () => {
  describe('# Bearer auth ', () => {
    it('redirects', function(done) {
      var context: Context = new Context(true, bearerAuth);
      context.authMethod(context, next);
      assert.ok(context.didRedirect == true);
      done();
    });

    it('passes requests with bearer cookie set', function(done) {
      var context: Context = new Context(false, bearerAuth);
      context.authMethod(context, next);
      assert.ok(context.didRedirect == false);
      done();
    });

  });
});
