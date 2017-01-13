'use strict';

import assert from 'assert';
import { naiveShallowCopy } from '../src/lib/shallow-copy';

describe('## Library methods', () => {
  describe('# copy', () => {
    it('performs shallow copy', function(done) {
      var original = {
        clientAuth: "some:auth",
      }

      var copy = naiveShallowCopy(original);
      assert.ok(copy !== original);
      assert.ok(copy.clientAuth === original.clientAuth);
      done();
    });
  });
});
