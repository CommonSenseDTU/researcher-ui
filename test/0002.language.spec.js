'use strict'

const assert = require('assert');

import f from './lib/module';

describe('## Language tests', () => {
  describe('# Transpiler', () => {
    
    it('handles import', function(done) {
      assert.ok(f);
      done();
    });

    it('parses and strips types', function(done) {
      assert.doesNotThrow(function () {
        type Options = {
          a: number
        };
        var option: Options = {
          a: 1
        };
      });
      done();
    });
    
  });
});
