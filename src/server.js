// @flow
'use strict';

/**
 * Module dependencies.
 */
import Koa from 'koa';
import serve from 'koa-static-folder';
import convert from 'koa-convert';
import fs from 'fs';

/**
 * Routes.
 */
import Base from './base.router';
import Join from './join';
import Logout from './logout';
import Studies from './studies';
import ConsentSections from './studies/consent';

/**
 * Type declarations.
 */
import type { Options } from './options.type';

/**
 * Global options to be passed to all routes 
 */
var opts: Options = {
  clientAuth: process.env.CLIENT_AUTH || "no:auth",
  resourceServer: process.env.RESOURCE_SERVER || "localhost:8083",
  port: parseInt(process.env.PORT, 10) || 3000
};

/**
 * Add a koa-router and a static asset path from a Base router to koa.
 * @param {Koa} app - the Koa app instance to add routes to
 * @param {Base} koaRouter - the Base router specialization which contains the router
 * @param {string} assetPath - path to the public assets to be served
 */
function addRouter(app: Koa, koaRouter: Base, assetPath: string) {
  app.use(convert(serve('./src/' + assetPath)));
  app.use(koaRouter.routes());
  app.use(koaRouter.allowedMethods());
}

/**
 * Log request handling time to console.
 *
 * @param {Context} ctx - the Koa context
 * @param {Function} - the next handler to yield control to before logging passed time
 */
function requestTimer(ctx: any, next: any) {
  var start = new Date;
  return next().then(() => {
    var ms = new Date - start;
    console.log('%s %s - %sms', ctx.method, ctx.url, ms);
  });
}

/**
 * Read bearer auth token into opts.
 *
 * @param {Context} ctx - the Koa context
 * @param {Function} - the next handler to yield control to before logging passed time
 */
export function bearerAuth(ctx: any, next: Function) {
  opts.bearer = ctx.cookies.get('bearer');
  
  if (!opts.bearer) {
    // TODO: attempt to use refresh token
    ctx.redirect('/join?return=' + ctx.url);
  } else {
    return next().then(() => {});
  }
}

/**
 * Create a Koa instance, add routes and start listening on given port.
 */
export function server() {
  if (fs.existsSync('app.config.json')) {
    console.log('Reading configuration from app.config.json');
    var readOpts: Options = JSON.parse(fs.readFileSync('app.config.json').toString());
    var key: string;
    for (key in readOpts) {
      opts[key] = readOpts[key];
    }
  }
  
  if (opts.clientAuth == "no:auth") {
    console.log("No CLIENT_AUTH specified!");
    return;
  }
  
	console.log("Listening on port " + opts.port);
  
  const app: Koa = new Koa();

  // Use request timer for all requests
  app.use(requestTimer);

  // Statically serve public and node modules
  app.use(convert(serve('./node_modules')));
  app.use(convert(serve('./public')));

  // Add unauthorized routes for login
  addRouter(app, new Join(opts), 'join/assets');
  addRouter(app, new Logout(opts), 'logout/assets');
  
  // Add authorization filter
  app.use(bearerAuth);

  // Add routes which require authorization
  addRouter(app, new Studies(opts), 'studies/assets');
  addRouter(app, new ConsentSections(opts), 'studies/consent/assets');
  
  console.log('Ready and accepting connections!');
  app.listen(opts.port);
}
