/**
 * @file Benchmarks for lib/index.js
 */
'use strict';


[ {
  name: '@avidjs/compose',
  fn:   require('../lib/index.js')
}, {
  name: 'koa-compose',
  fn:   require('koa-compose')
}].forEach((o) => {
  const logic = () => Promise.resolve(true);

  const fn = (ctx, next) => {
    return logic().then(next).then(logic);
  };

  suite(`${o.name} - Creating stack`, () => {
    set('iterations', 10000);
    set('type', 'adaptive');
    set('mintime', 1000);
    set('delay', 100);

    for (let exp = 0; exp <= 10; exp++) {
      const count = Math.pow(2, exp);
      const arr = [];
      for (let i = 0; i < count; i++) {
        arr.push(fn);
      }

      bench(`compose ${count}`, () => {
        o.fn(arr);
      });
    }
  });

  suite(`${o.name} - Executing stack`, () => {
    set('iterations', 10000);
    set('type', 'adaptive');
    set('mintime', 1000);
    set('delay', 100);

    for (let exp = 0; exp <= 10; exp++) {
      const count = Math.pow(2, exp);
      const arr = [];
      for (let i = 0; i < count; i++) {
        arr.push(fn);
      }

      const stack = o.fn(arr);

      bench(`(fn * ${count})`, (done) => {
        stack({}).then(done);
      });
    }
  });
});
