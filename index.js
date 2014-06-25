
/**
 * Module dependencies.
 */
var fs = require('fs');
var quote = require('quote-stream');
var through = require('through2');

/**
 * @param   {String}    file
 * @param   {Object}    options
 * @returns {Stream}
 */
module.exports = function(file, options) {

  /**
   * The file extensions of file which should be stringified
   * @type    {string[]}
   */
  var extensions = [
    '.text',
    '.txt',
    '.html',
    '.tmpl',
    '.tpl'
  ];

  if (options) {
    if (Object.prototype.toString.call(options) === '[object Array]') {
      extensions = options;
    } else if(options.extensions) {
      extensions = options.extensions;
    }
  }

  /**
   * Returns whether the file ends in an extension
   * @param   {String} file
   * @return  {Boolean}
   */
  function has_stringify_extension(file) {
    for (var i=0; i<extensions.length; ++i) {
      if (file.substr(-1*extensions[i].length) === extensions[i]) {
        return true;
      }
    }
    return false;
  }

  if (!has_stringify_extension(file)) {
    return through();
  }

  /**
   * Modify content and add to stream.
   * @param {Buffer} buffer
   * @param {String} encoding
   * @param {Function} next
   */
  function write(buffer, enc, next) {
    var str = new String(buffer)
      .replace(/'/g, "\\'")
      .replace(/\r\n|\r|\n/g, "\\n");
    this.push(str);
    next();
  }

  /**
   * Close require-call and iterate to next.
   * @param {Function} next
   */
  function end(next) {
    this.push("';");
    this.push(null);
    next();
  }

  var stream = through(write, end);
  stream.push("module.exports = '");
  var handle = fs.createReadStream(file, {encoding: 'utf-8'})
    .pipe(quote()).pipe(stream);

  return handle;
};

