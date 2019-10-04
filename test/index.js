'use strict';

const RetryManager = require('../lib/retry-manager');
const plugin = require('../index');
const logger = require('../lib/logger');

const defaultBrowserName = 'def-bro';

const mkDefaultBrowsersConfig = () => ({
    [defaultBrowserName]: {}
});

const stubHermione = (browsers = mkDefaultBrowsersConfig()) => {
    return {
        config: {
            getBrowserIds: () => Object.keys(browsers),
            forBrowser: id => browsers[id]
        },
        isWorker: () => false
    };
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

    it('should call updateExtraRetry', () => {
        const hermione = init_();

        hermione.config.forBrowser(defaultBrowserName).shouldRetry({ctx: mtTest(), retriesLeft: 0});

        assert.calledWith(RetryManager.prototype.updateExtraRetry, 'test name stub (def-bro)', 'error message stub');
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
});
