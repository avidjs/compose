/**
 * @file lib/index.js
 */
'use strict';


/**
 * An Avid context object.
 * @typedef {Object} Context
 * @property {Request}  request
 * @property {Response} response
 */


/**
 * An Avid middleware function.
 * @callback Middleware
 * @param {Context}  ctx
 * @param {Function} next
 */


/**
 * Composes an array of middleware functions into a call-able middleware stack.
 * Throws TypeError if the middleware argument is not an array.
 * @param  {Array.<Middleware>} middleware
 * @return {Function}
 * @throws {TypeError}
 * @example
 *    const avid    = require('@avidjs/avid');
 *    const compose = require('@avidjs/compose');
 *
 *    let app = avid();
 *
 *    let middleware = compose([
 *      async (ctx, next) => {
 *        console.log('first');
 *        await next();
 *        console.log('fifth');
 *      },
 *      async (ctx, next) => {
 *        console.log('second');
 *        await next();
 *        console.log('fourth');
 *      }
 *    ]);
 *
 *    app.use(middleware);
 *
 *    app.use(async (ctx, next) => {
 *      console.log('third');
 *      ctx.res.end();
 *    });
 *
 *    app.listen(3000);
 */
module.exports = function compose(middleware) {
  if (!Array.isArray(middleware)) {
    throw new TypeError('middleware stack must be an array');
  }


  /**
   * Returns a call-able middleware stack.
   * @param  {Context}     ctx
   * @param  {Middleware} next
   * @return {Promise.<Context>}
   */
  return function stack(ctx, next) {


    /**
     * Used to determine if `next()` has been called too often. Begins at -1,
     * corresponding to an index "before" the bounds of an array, and is
     * incremented by one with each call to `next()` for comparison in order
     * to ensure that the middleware is traversed one at a time.
     * @type {Number}
     */
    let counter = -1;


    /**
     * Recursively executes the next middleware in the stack with the given
     * context object. Resolves to the context object if there are no more
     * middleware functions remaining in the middleware to be composed, or if
     * there are no more middleware functions left in the external stack.
     * @param  {Context} ctx
     * @param  {Number}  index
     * @return {Promise.<Context>}
     * @private
     */
    return (function unwind(index) {
      if (index <= counter) {
        return Promise.reject(new Error('`next()` called multiple times'));
      }

      counter = index;

      let fn = (index === middleware.length) ? next : middleware[index];

      if (!fn) {
        return Promise.resolve(ctx);
      }

      try {
        return Promise.resolve(fn(ctx, () => unwind(index + 1)));
      } catch (error) {
        return Promise.reject(error);
      }
    })(0);
  };
};
