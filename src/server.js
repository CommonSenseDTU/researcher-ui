import Koa from 'koa';
import serve from 'koa-static-folder';
//import serve from './lib/static-offset';
import convert from 'koa-convert';

import Join from './join';
import Studies from './studies';

var opts = {
  clientAuth: process.env.CLIENT_AUTH
};

function addRouter(app, koaRouter, assetPath) {
  //app.use(serve('./src/' + assetPath, { offset: '/src' }));
  app.use(convert(serve('./src/' + assetPath)));
  app.use(koaRouter.routes());
  app.use(koaRouter.allowedMethods());
}

function requestTimer(ctx, next) {
  var start = new Date;
  return next().then(() => {
    var ms = new Date - start;
    console.log('%s %s - %sms', ctx.method, ctx.url, ms);
  });
}

function bearerAuth(ctx, next) {
  opts.bearer = ctx.cookies.get('bearer');
  if (!opts.bearer) {
    // TODO: attempt to use refresh token
    ctx.redirect('/join?return=' + ctx.url);
  } else {
    return next().then(() => {});
  }
}

export default function() {
  const port = process.env.PORT || 3000;
	console.log("Listening on port " + port);
  
  const app = new Koa();

  app.use(requestTimer);

  app.use(convert(serve('./node_modules')));
  app.use(convert(serve('./public')));

  addRouter(app, new Join(opts), 'join/assets');
  
  app.use(bearerAuth);

  addRouter(app, new Studies(opts), 'studies/assets');
  
  app.listen(port);
}
