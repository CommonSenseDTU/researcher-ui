'use strict'

import assert from 'assert';
import Controller from '../src/base.controller';

/**
 * Test if an object is a function
 * @param functionToCheck - The object to test
 * @return true if the passed object is a function
 */
function isFunction(functionToCheck) {
 var getType = {};
 return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

describe('## Base controller class', () => {
  describe('# Router ', () => {
    it('initializes', function(done) {
      assert.doesNotThrow(function() {
        new Controller('./test/0004.controller/view', {});
      });
      done();
    });

    it('forwards allowedMethods', function(done) {
      var allowedMethods: Function = new Controller('./test/0004.controller/view', {}).allowedMethods();
      assert.ok(isFunction(allowedMethods) == true);
      done();
    });

    it('forwards routes', function(done) {
      var routes: Function = new Controller('./test/0004.controller/view', {}).routes();
      assert.ok(isFunction(routes) == true);
      done();
    });
  });

  describe('# Utility ', () => {
    it('compiles a pug file', function(done) {
      var controller: Controller = new Controller('./test/0004.controller/view', {});
      var template: Function = controller.compileFile('index.pug');
      assert.ok(isFunction(template) == true);
      done();
    });

  });
});
