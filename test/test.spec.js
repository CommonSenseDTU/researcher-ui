'use strict'

const assert = require('assert');

describe('## Test framework', () => {
  describe('# Assertions ', () => {
    it('are ok', function(done) {
      assert.ok(true === true);
      done();
    });

  });
});
