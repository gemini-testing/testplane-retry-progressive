'use strict';

const EventEmitter = require('events').EventEmitter;

const RetryManager = require('../lib/retry-manager');
const plugin = require('../index');
const logger = require('../lib/logger');

const defaultBrowserName = 'def-bro';

const events = {
    RUNNER_START: 'fooBarRunnerStart'
};

const mkDefaultBrowsersConfig = () => ({
    [defaultBrowserName]: {}
});

const stubHermione = (browsers = mkDefaultBrowsersConfig()) => {
    const hermione = new EventEmitter();

    hermione.events = events;
    hermione.config = {
        getBrowserIds: () => Object.keys(browsers),
        forBrowser: id => browsers[id]
    };
    hermione.isWorker = () => false;

    return hermione;
};

const init_ = () => {
    const hermione = stubHermione();

    plugin(hermione, {enabled: true});

    return hermione;
};

const mtTest = () => {
    return {
        fullTitle: () => 'test name stub',
        err: {
            message: 'error message stub'
        }
    };
};

describe('index', () => {
    const sandbox = sinon.createSandbox();

    beforeEach(() => {
        sandbox.stub(logger, 'info');
        sandbox.stub(RetryManager.prototype, 'updateExtraRetry').returns(0);
        sandbox.stub(RetryManager.prototype, 'clear');
    });

    afterEach(() => sandbox.restore());

    it('should do nothing in worker', () => {
        const hermione = stubHermione();
        hermione.isWorker = () => true;

        plugin(hermione);

        assert.isUndefined(hermione.config.forBrowser(defaultBrowserName).shouldRetry);
    });

    it('should do nothing if plugin is disabled', () => {
        const hermione = stubHermione();

        plugin(hermione, {enabled: false});

        assert.isUndefined(hermione.config.forBrowser(defaultBrowserName).shouldRetry);
    });

    describe('should call "updateExtraRetry"', () => {
        it('with test id and error message', () => {
            const hermione = init_();
            const ctx = {
                fullTitle: () => 'test',
                err: {message: 'o.O'}
            };

            hermione.config.forBrowser(defaultBrowserName).shouldRetry({ctx, retriesLeft: 0});

            assert.calledWith(RetryManager.prototype.updateExtraRetry, 'test (def-bro)', 'o.O');
        });

        it('with test id and empty error message', () => {
            const hermione = init_();
            const ctx = {
                fullTitle: () => 'test',
                err: undefined
            };

            hermione.config.forBrowser(defaultBrowserName).shouldRetry({ctx, retriesLeft: 0});

            assert.calledWith(RetryManager.prototype.updateExtraRetry, 'test (def-bro)', '');
        });
    });

    it('should not retry if sum retries === 0', () => {
        const hermione = init_();

        RetryManager.prototype.updateExtraRetry.returns(1);

        const shouldRetry = hermione.config
            .forBrowser(defaultBrowserName)
            .shouldRetry({ctx: mtTest(), retriesLeft: -1});

        assert.equal(shouldRetry, false);
    });

    it('should not retry if sum retries < 0', () => {
        const hermione = init_();

        RetryManager.prototype.updateExtraRetry.returns(0);

        const shouldRetry = hermione.config
            .forBrowser(defaultBrowserName)
            .shouldRetry({ctx: mtTest(), retriesLeft: -1});

        assert.equal(shouldRetry, false);
    });

    it('should retry if sum retries > 0', () => {
        const hermione = init_();

        RetryManager.prototype.updateExtraRetry.returns(2);

        const shouldRetry = hermione.config
            .forBrowser(defaultBrowserName)
            .shouldRetry({ctx: mtTest(), retriesLeft: -1});

        assert.equal(shouldRetry, true);
    });

    it('should retry if "shouldRetry" handler from config return true', () => {
        const shouldRetryStub = sandbox.stub().returns(true);
        const hermione = stubHermione({
            [defaultBrowserName]: {shouldRetry: shouldRetryStub}
        });
        plugin(hermione, {enabled: true});

        const shouldRetry = hermione.config
            .forBrowser(defaultBrowserName)
            .shouldRetry({ctx: mtTest(), retriesLeft: 0});

        assert.equal(shouldRetry, true);
        assert.calledWith(shouldRetryStub, {ctx: sinon.match.object, retriesLeft: 0});
    });

    it('should retry if "shouldRetry" handler from config return false and sum retries > 0', () => {
        const shouldRetryStub = sandbox.stub().returns(false);
        const hermione = stubHermione({
            [defaultBrowserName]: {shouldRetry: shouldRetryStub}
        });
        plugin(hermione, {enabled: true});

        const shouldRetry = hermione.config
            .forBrowser(defaultBrowserName)
            .shouldRetry({ctx: mtTest(), retriesLeft: 1});

        assert.equal(shouldRetry, true);
        assert.calledWith(shouldRetryStub, {ctx: sinon.match.object, retriesLeft: 1});
    });

    it('should not retry if "shouldRetry" handler from config return false and sum retries === 0', () => {
        const shouldRetryStub = sandbox.stub().returns(false);
        const hermione = stubHermione({
            [defaultBrowserName]: {shouldRetry: shouldRetryStub}
        });
        plugin(hermione, {enabled: true});

        const shouldRetry = hermione.config
            .forBrowser(defaultBrowserName)
            .shouldRetry({ctx: mtTest(), retriesLeft: 0});

        assert.equal(shouldRetry, false);
        assert.calledWith(shouldRetryStub, {ctx: sinon.match.object, retriesLeft: 0});
    });

    it('should clear retryManager on RUNNER_START event', () => {
        const hermione = init_();

        hermione.emit(hermione.events.RUNNER_START);

        assert.calledOnce(RetryManager.prototype.clear);
    });
});
