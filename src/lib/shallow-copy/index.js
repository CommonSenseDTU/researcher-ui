// @flow
'use strict';

/**
 * A simple shallow copy function.
 *
 * @param {any} original - an object to be copied
 * @return {any} A shallow copy of the original
 */
export function naiveShallowCopy(original: any) {
  // First create an empty object
  // that will receive copies of properties
  var clone: any = {};
  var key: string;

  for (key in original) {
    // copy each property into the clone
    clone[key] = original[key];
  }

  return clone;
}
