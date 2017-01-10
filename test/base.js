'use strict'

import assert from 'assert';
import Base from '../src/base.router';

/**
 * Test if an object is a function
 * @param functionToCheck - The object to test
 * @return true if the passed object is a function
 */
function isFunction(functionToCheck) {
 var getType = {};
 return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

describe('## Base class', () => {
  describe('# Router ', () => {
    it('initializes', function(done) {
      assert.doesNotThrow(function() {
        new Base('./src/join', {});
      });
      done();
    });

    it('forwards allowedMethods', function(done) {
      var allowedMethods: Function = new Base('./test/assets', {}).allowedMethods();
      assert.ok(isFunction(allowedMethods) == true);
      done();
    });

    it('forwards routes', function(done) {
      var routes: Function = new Base('./test/assets', {}).routes();
      assert.ok(isFunction(routes) == true);
      done();
    });
  });

  describe('# Utility ', () => {
    it('performs shallow copy', function(done) {
      var original = {
        clientAuth: "some:auth",
      }
      
      var copy = new Base.naiveShallowCopy(original);
      assert.ok(copy !== original);
      assert.ok(copy.clientAuth === original.clientAuth);
      done();
    });

    it('compiles a pug file', function(done) {
      var template: Function = Base.compileFile('./test/assets', 'index.pug');
      assert.ok(isFunction(template) == true);
      done();
    });

  });
});
