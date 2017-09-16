# @avidjs/compose

[![npm](https://img.shields.io/npm/v/@avidjs/compose.svg?style=flat-square)](https://www.npmjs.com/package/@avidjs/compose)
![Node.js](https://img.shields.io/badge/node.js-%3E=_7.6.0-blue.svg?style=flat-square)
[![Build Status](https://img.shields.io/travis/avidjs/compose/master.svg?style=flat-square)](https://travis-ci.org/avidjs/compose) [![Coverage](https://img.shields.io/codecov/c/github/avidjs/compose.svg?style=flat-square)](https://codecov.io/gh/avidjs/compose)
[![Dependencies Status](https://david-dm.org/avidjs/compose/status.svg?style=flat-square)](https://david-dm.org/avidjs/compose)
[![devDependencies Status](https://david-dm.org/avidjs/compose/dev-status.svg?style=flat-square)](https://david-dm.org/avidjs/compose?type=dev)
[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/avidjs/compose/blob/master/LICENSE)

> Composes an array of middleware functions into a call-able middleware stack.

Essentially, a fork of [`koa-compose`](https://github.com/koajs/compose) that features more exhaustive commenting, favors [`bluebird`](https://github.com/petkaantonov/bluebird/) for Promises, and doesn't perform type checking for every element in the array argument.

Part of [Avid](https://github.com/avidjs), an attempt to better understand [Koa](http://koajs.com/) and [Express](https://expressjs.com/) by taking them apart.

## Installation

```shell
npm install --save @avidjs/compose
```

## Usage

```javascript
const compose = require('@avidjs/compose');


let fn = compose([
  async (ctx, next) => {
    console.log('first');
    await next();
    console.log('sixth');
  },
  async (ctx, next) => {
    console.log('second');
    await next();
    console.log('fifth');
  },
  async (ctx, next) => {
    console.log('third');
    await next();
    console.log('fourth');
  }
]);


fn({});
```
