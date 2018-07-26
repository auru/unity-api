import test from 'ava';
import sinon from 'sinon';
import createAPI from '../src/createAPI';
import * as applyMiddleware from '../src/applyMiddleware';

test.beforeEach(t => {
    t.context.stubApplyMiddleware = sinon.stub(applyMiddleware, 'default');
});
test.afterEach.always(t => {
    t.context.stubApplyMiddleware.restore();
});

test('undefined resources', t => {
    const API = createAPI();
    t.deepEqual(API, {}, 'empty API object');
});

test('0 resources', t => {
    const API = createAPI({});
    t.deepEqual(API, {}, 'empty API object');
});

test('supports correct applyMiddleware call', t => {
    const user = {
        prefix: 'user-endpoint',
        methods: {
            get: ({ id }) => ({ path: ['get', id] })
        }
    };
    const resources = { user };
    const API = createAPI(resources, [], 'https://example.com', 'cancel');

    API.user.get({ id: 1 });

    t.true(t.context.stubApplyMiddleware.calledOnce);
    t.deepEqual(t.context.stubApplyMiddleware.lastCall.args[0], []);
    t.is(t.context.stubApplyMiddleware.lastCall.args[1], undefined);
    t.is(t.context.stubApplyMiddleware.lastCall.args[2], 'https://example.com');
    t.is(t.context.stubApplyMiddleware.lastCall.args[3], 'user-endpoint');
    t.is(t.context.stubApplyMiddleware.lastCall.args[4], 'cancel');
    t.deepEqual(t.context.stubApplyMiddleware.lastCall.args[5], { path: ['get', 1] });
    t.is(t.context.stubApplyMiddleware.lastCall.args[6], 'user');
    t.is(t.context.stubApplyMiddleware.lastCall.args[7], 'get');
});

test('general behaviour', t => {
    const userResource = {
        namespace: 'user',
        methods: {
            get: ({ id }) => ({ path: ['get', id] }),
            delete: ({ id }) => ({ path: ['delete', id], options: { method: 'DELETE'} })
        }
    };
    const projectResource = {
        namespace: 'project',
        methods: {
            get: ({ id }) => ({ path: ['get', id] }),
            delete: ({ id }) => ({ path: ['delete', id], options: { method: 'DELETE'} })
        }
    };
    const resources = {
        user: userResource,
        project: projectResource
    };
    const middleware = [ _ => _, _ => _];

    const API = createAPI(resources, middleware, 'https://example.com', 'cancel');

    t.deepEqual(Object.keys(API), ['user', 'project'], 'resources');

    Object.keys(API).forEach(resource => {
        t.deepEqual(Object.keys(API[resource]), ['get', 'delete'], 'methods');
        Object.keys(API[resource]).forEach(method => {
            t.true(API[resource][method] instanceof Function, 'methods are functions');
        });
    });

    const methodOptions = { specific: 'option' };

    API.user.delete({ id: 1 }, methodOptions);

    t.true(t.context.stubApplyMiddleware.calledOnce);
    t.deepEqual(t.context.stubApplyMiddleware.lastCall.args[0], middleware);
    t.deepEqual(t.context.stubApplyMiddleware.lastCall.args[1], methodOptions);
    t.is(t.context.stubApplyMiddleware.lastCall.args[2], 'https://example.com');
    t.is(t.context.stubApplyMiddleware.lastCall.args[3], 'user');
    t.is(t.context.stubApplyMiddleware.lastCall.args[4], 'cancel');
    t.deepEqual(t.context.stubApplyMiddleware.lastCall.args[5], { path: ['delete', 1], options: { method: 'DELETE'} });
    t.is(t.context.stubApplyMiddleware.lastCall.args[6], 'user');
    t.is(t.context.stubApplyMiddleware.lastCall.args[7], 'delete');

    API.user.delete({ id: 1 });

    t.true(t.context.stubApplyMiddleware.calledTwice);
});
