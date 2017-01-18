'use strict'

import assert from 'assert';
import winston from 'winston';

import Controller from '../src/base.controller';
import Join from '../src/control/join';
import Logout from '../src/control/logout';
import Studies from '../src/control/studies';
import Edit from '../src/control/studies/edit';
import ConsentSections from '../src/control/studies/edit/consent';

/**
 * Test if an object is a function
 * @param functionToCheck - The object to test
 * @return true if the passed object is a function
 */
function isFunction(functionToCheck) {
 var getType = {};
 return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

describe('## Controller classes', () => {
  before(function () {
    winston.level = 'error';
  });

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

  describe('# Subclasses ', () => {
    it('join initializes', function(done) {
      assert.doesNotThrow(function() { new Join({}) });
      done();
    });

    it('logout initializes', function(done) {
      assert.doesNotThrow(function() { new Logout({}) });
      done();
    });

    it('studies initializes', function(done) {
      assert.doesNotThrow(function() { new Studies({}) });
      done();
    });

    it('edit initializes', function(done) {
      assert.doesNotThrow(function() { new Edit({}) });
      done();
    });

    it('consent sections initializes', function(done) {
      assert.doesNotThrow(function() { new ConsentSections({}) });
      done();
    });

  });
});
