// @flow
'use strict';

/**
 * Type declarations.
 */
import type { Options } from './options.type';

/**
 * Template function which generates html with given options.
 * This is a function return from pug when compiling index.pug in
 * a route module.
 */
export type Template = (opts: Options) => string;
