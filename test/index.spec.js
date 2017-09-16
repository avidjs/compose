/**
 * @file Tests for lib/index.js
 */


const chai           = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon          = require('sinon');
const sinonChai      = require('sinon-chai');


chai.use(chaiAsPromised);
chai.use(sinonChai);
const should = chai.should();


const compose = require('../lib/index.js');


describe('compose', () => {
  it('should export a function', () => {
    compose.should.be.a('Function');
  });

  it('should throw `TypeError` if not called on an Array', () => {
    (() => {
      compose('not an array');
    }).should.throw(TypeError);
  });

  it('should return a function', () => {
    compose([]).should.be.a('function');
  });

  describe('empty stack', () => {
    let stack;

    beforeEach(() => {
      stack = compose([]);
    });

    it('should return a Promise', () => {
      stack({}).constructor.name.should.equal('Promise');
    });

    it('should eventually resolve to the context', (done) => {
      stack('context').should.eventually.equal('context').notify(done);
    });
  });

  describe('single-element stack', () => {
    let spy = sinon.spy();

    let stack = compose([
      async (ctx, next) => {
        spy();
        await next();
      }
    ]);

    it('should call the middleware function', (done) => {
      stack({}).then(() => {
        spy.should.have.been.calledOnce;
      }).should.be.fulfilled.notify(done);
    });
  });

  describe('multi-element stack', () => {
    let spy1 = sinon.spy();
    let spy2 = sinon.spy();
    let spy3 = sinon.spy();
    let spy4 = sinon.spy();
    let spy5 = sinon.spy();
    let spy6 = sinon.spy();

    let stack = compose([
      async (ctx, next) => {
        spy1();
        await next();
        spy6();
      },
      async (ctx, next) => {
        spy2();
        await next();
        spy5();
      },
      async (ctx, next) => {
        spy3();
        await next();
        spy4();
      }
    ]);

    beforeEach(() => {
      spy1.reset();
      spy2.reset();
      spy3.reset();
      spy4.reset();
      spy5.reset();
      spy6.reset();
    });

    it('should call each middleware function', (done) => {
      stack({}).then(() => {
        spy1.should.have.been.calledOnce;
        spy2.should.have.been.calledOnce;
        spy3.should.have.been.calledOnce;
        spy4.should.have.been.calledOnce;
        spy5.should.have.been.calledOnce;
        spy6.should.have.been.calledOnce;
      }).should.be.fulfilled.notify(done);
    });

    it('should call each middleware function in the proper order', (done) => {
      stack({}).then(() => {
        spy1.should.have.been.calledBefore(spy2);
        spy2.should.have.been.calledBefore(spy3);
        spy3.should.have.been.calledBefore(spy4);
        spy4.should.have.been.calledBefore(spy5);
        spy5.should.have.been.calledBefore(spy6);
      }).should.be.fulfilled.notify(done);
    });
  });

  describe('nested compositions', () => {
    it('should compose with other compositions', (done) => {
      let spy1 = sinon.spy();
      let spy2 = sinon.spy();
      let spy3 = sinon.spy();
      let spy4 = sinon.spy();

      let stack1 = compose([
        async (ctx, next) => {
          spy1();
          await next();
          spy4();
        }
      ]);

      let stack2 = compose([
        stack1,
        async (ctx, next) => {
          spy2();
          await next();
          spy3();
        }
      ]);

      stack2({}).then(() => {
        spy1.should.have.been.calledOnce;
        spy2.should.have.been.calledOnce;
        spy3.should.have.been.calledOnce;
        spy4.should.have.been.calledOnce;
        spy1.should.have.been.calledBefore(spy2);
        spy2.should.have.been.calledBefore(spy3);
        spy3.should.have.been.calledBefore(spy4);
      }).should.be.fulfilled.notify(done);
    });
  });

  describe('errors', () => {
    it('should reject on errors in middleware', (done) => {
      let spy1 = sinon.spy();
      let spy2 = sinon.spy();

      let stack = compose([
        (ctx, next) => {
          spy1();
          throw new Error();
          spy2();
        }
      ]);

      stack({}).catch((error) => {
        error.should.be.instanceOf(Error);
        spy1.should.have.been.calledOnce;
        spy2.should.not.have.been.called;
      }).should.be.fulfilled.notify(done);
    });

    it('should reject on errors in async middleware', (done) => {
      let spy1 = sinon.spy();
      let spy2 = sinon.spy();

      let stack = compose([
        async (ctx, next) => {
          spy1();
          throw new Error();
          spy2();
        }
      ]);

      stack({}).catch((error) => {
        error.should.be.instanceOf(Error);
        spy1.should.have.been.calledOnce;
        spy2.should.not.have.been.called;
      }).should.be.fulfilled.notify(done);
    });

    it('should reject if `next()` called multiple times', (done) => {
      let spy1 = sinon.spy();
      let spy2 = sinon.spy();

      let stack = compose([
        async (ctx, next) => {
          spy1();
          await next();
          await next();
          spy2();
        }
      ]);

      stack({}).catch((error) => {
        error.should.be.instanceOf(Error);
        spy1.should.have.been.calledOnce;
        spy2.should.not.have.been.called;
      }).should.be.fulfilled.notify(done);
    });
  });
});
