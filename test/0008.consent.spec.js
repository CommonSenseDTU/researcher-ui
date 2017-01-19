'use strict'

import assert from 'assert';
import winston from 'winston';
import http from 'http';
import Koa from 'koa';
import jsdom from 'jsdom';
import fs from 'fs';

import Studies from '../src/control/studies';
import ConsentSections from '../src/control/studies/edit/consent';

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
class Context {
  cookies: Cookies;
  body: any;
  type: string;
  status: number;
  params: any;

  constructor() {
    this.params = {};
  }

  set(header: string, value: string) {
    winston.debug("setting header " + header + " to " + value);
  }

}

async function testSectionType(type: string, done: Function) {
  try {
    var context: Context = new Context();
    context.params.type = type;
    var consent: ConsentSections = new ConsentSections({});
    await consent.createConsentSection(context, next);
    assert.equal(context.status, 201, "Did not create section");
    done();
  } catch (error) {
    done(error);
  }
}

describe('## ConsentSections view', () => {
  describe('# ConsentSections ', () => {
    before(function () {
      winston.level = 'none';
    });

    it('can create overview section', async function (done) {
      testSectionType("overview", done);
    });

    it('can create datagathering section', async function (done) {
      testSectionType("datagathering", done);
    });

    it('can create privacy section', async function (done) {
      testSectionType("privacy", done);
    });

    it('can create datause section', async function (done) {
      testSectionType("datause", done);
    });

    it('can create timecommitment section', async function (done) {
      testSectionType("timecommitment", done);
    });

    it('can create studysurvey section', async function (done) {
      testSectionType("studysurvey", done);
    });

    it('can create studytasks section', async function (done) {
      testSectionType("studytasks", done);
    });

    it('can create withdrawing section', async function (done) {
      testSectionType("withdrawing", done);
    });

    it('can create sharingoptions section', async function (done) {
      testSectionType("sharingoptions", done);
    });

    it('can create review section', async function (done) {
      testSectionType("review", done);
    });

    it('can create signature section', async function (done) {
      testSectionType("signature", done);
    });

  });
});
