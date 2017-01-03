// @flow
'use strict';

/**
 * Module dependencies.
 */
import router from 'koa-router';
import pug from 'pug';
import PugPluginNg from 'pug-plugin-ng';

/**
 * Type declarations.
 */
import type { Options } from './options.type';
import type { Template } from './template.type';

/**
 * Base class for a route.
 *
 * The module *must* have an 'assets' subdirectory which may contain assets which are
 * going to be statically served by the webserver.
 * The module also *must* have an index.pug file which is going to be compiled into
 * a Template function.
 */
class Base {
  
  opts: Options;
  router: any;
  template: Template;
  
  /**
   * Create a Base instance. 
   * 
   * @param {string} dirname - The name of the directory where the routed module lives.
   * @param {Options} opts - The options passed to pug when compiling 
   */
  constructor(dirname: string, opts: Options) {
    this.opts = opts || {};
    this.router = router();
    
    this.template = this.compileFile(dirname, 'index.pug');
  }
  
  /**
   * Compile file template into a function which can generate html with given options.
   *
   * @param {string} dirname - directory which the file lives in
   * @return {Template} A function for generating html from the given template
   */
  compileFile(dirname: string, filename: string) {
    return pug.compileFile(dirname + '/' + filename, {
      basedir: process.cwd() + '/src/lib/pug',
      plugins: [PugPluginNg] 
    });
  }
  
  /**
   * @return {Function} A middleware which dispatches a route matching the request.
   */
  routes() {
    return this.router.routes();
  }
  
  /**
   * @return {Function} A middleware for responding to OPTIONS requests with an Allow 
   * header containing the allowed methods, as well as responding with 405 Method Not 
   * Allowed and 501 Not Implemented as appropriate.
   */
  allowedMethods() {
    return this.router.allowedMethods();
  }

  /**
   * A simple shallow copy function.
   *
   * @param {any} original - an object to be copied
   * @return {any} A shallow copy of the original
   */
  naiveShallowCopy(original: any) {
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
}

export default Base;
