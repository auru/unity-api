import test from 'ava';
import sinon from 'sinon';
import * as applyMiddleware from '../src/applyMiddleware';
import callAPIMethod from '../src/callAPIMethod';
import createAPI from '../src/createAPI';

const boundCallAPIMethod = _ => _;
test.beforeEach(t => {
    t.context.stubCallAPIMethod = sinon.stub(callAPIMethod, 'bind');
    t.context.stubCallAPIMethod.returns(boundCallAPIMethod);
    t.context.stubApplyMiddleware = sinon.stub(applyMiddleware, 'default');
});
test.afterEach.always(t => {
    t.context.stubApplyMiddleware.restore();
    t.context.stubCallAPIMethod.restore();
});

test('undefined resources', t => {
    const API = createAPI();
    t.deepEqual(API, {}, 'empty API object');
});

test('0 resources', t => {
    const API = createAPI({});
    t.deepEqual(API, {}, 'empty API object');
});

test('supports resource prefix insted of namespace', t => {
    const user = {
        prefix: 'user-endpoint',
        methods: {
            get: ({ id }) => ({ path: ['get', id] })
        }
    };
    const resources = { user };
    const API = createAPI(resources, [], 'https://example.com');

    API.user.get(1);

    t.true(t.context.stubCallAPIMethod.calledWithExactly(
        null, 'https://example.com', undefined, 'user-endpoint'
    ), 'correct arguments passed to callAPIMethod');
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

    const API = createAPI(resources, middleware, 'https://example.com');

    t.deepEqual(Object.keys(API), ['user', 'project'], 'resources');

    Object.keys(API).forEach(resource => {
        t.deepEqual(Object.keys(API[resource]), ['get', 'delete'], 'methods');
        Object.keys(API[resource]).forEach(method => {
            t.true(API[resource][method] instanceof Function, 'methods are functions');
        });
    });

    const methodOptions = { specific: 'option' };
    API.user.delete({ id: 1 }, methodOptions);

    t.true(t.context.stubCallAPIMethod.calledOnce);
    t.true(t.context.stubApplyMiddleware.calledOnce);
    t.true(t.context.stubCallAPIMethod.calledBefore(t.context.stubApplyMiddleware));
    t.true(t.context.stubCallAPIMethod.calledWithExactly(
        null, 'https://example.com', undefined, 'user'
    ));

    t.is(t.context.stubApplyMiddleware.lastCall.args[0], boundCallAPIMethod, 'applyMiddleware called with boundCallAPIMethod');
    t.is(t.context.stubApplyMiddleware.lastCall.args[1], middleware, 'applyMiddleware called with middleware');
    t.is(t.context.stubApplyMiddleware.lastCall.args[2], methodOptions, 'applyMiddleware called with methodOptions');
    t.deepEqual(t.context.stubApplyMiddleware.lastCall.args[3], {
        path: ['delete', 1], options: { method: 'DELETE'}
    }, 'applyMiddleware called with correct apiParams');
    t.is(t.context.stubApplyMiddleware.lastCall.args[4], 'user', 'applyMiddleware called with correct resourceId');
    t.is(t.context.stubApplyMiddleware.lastCall.args[5], 'delete', 'applyMiddleware called with correct method');

    API.user.delete({ id: 1 });

    t.true(t.context.stubCallAPIMethod.calledTwice);
    t.true(t.context.stubApplyMiddleware.calledTwice);
    t.true(t.context.stubCallAPIMethod.calledBefore(t.context.stubApplyMiddleware));
});
