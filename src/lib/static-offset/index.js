import send from '../send2';
import fs from 'fs';
import convert from 'koa-convert';

/**
* Serve static files from `root`.
*
* Traverses the specified folder and serves all underlying files. Can be used for public and asset folders.
*
* @param {String} root
* @return {Function}
* @api public
*/
export default function(root, opts) {
  if (!root) throw Error('Root must be defined.');
  if (typeof root !== 'string') throw TypeError('Path must be a defined string.');
  opts = opts || {};
  opts.root = process.cwd();

  var rootStat = fs.statSync(root);
  if (!rootStat.isDirectory()) throw Error('Root should be a directory.');

  var finalFiles = walk(root, opts);

  root = fs.realpathSync(root);
  if (!root) throw Error('Root must be a valid path.');

  return function staticFolder(ctx, next) {
    console.log('Requesting ' + ctx.path);
    var file = finalFiles[ctx.path];
    console.log('File: ' + file);
    if (!file) return next().then(() => {});
    return next().then(send(ctx, file, opts));
  }
}

function walk(directory, opts, finalFiles) {
  opts = opts || {};
  opts.offset = opts.offset || '';
  var finalFiles = finalFiles || [];
  var files = fs.readdirSync(directory);
  for (var i=0; i<files.length; i++) {
    var file = files[i];
    if (!file) continue;
    file = directory + '/' + file;
    if (fs.statSync(file).isDirectory()) {
      walk(file, opts, finalFiles);
    } else {
      finalFiles[file.replace('.', '').replace(opts.offset, '')] = file;
      console.log('Setting file ' + file.replace('.', '').replace(opts.offset, '') + ' offset: ' + opts.offset);
    }
  }
  return finalFiles;
}
