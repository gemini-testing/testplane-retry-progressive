'use strict';

const _ = require('lodash');

const RetryManager = require('../../lib/retry-manager');
const logger = require('../../lib/logger');

const defaultTestId = 'default test (id)';
const defaultErrorMessage = 'default foo bar';
const notMatchedErrorMessage = 'foo bar';

const mkParams = (opts = {}) => {
    return _.defaults(opts, {
        extraRetry: 1,
        errorPatterns: [
            {
                name: 'default error',
                pattern: 'default .*'
            }
        ]
    });
};

describe('lib/retry-manager', () => {
    const sandbox = sinon.createSandbox();

    beforeEach(() => {
        sandbox.stub(logger, 'info');
    });

    afterEach(() => sandbox.restore());

    it('should not increase retries if error message does not match patterns', () => {
        const retryManager = new RetryManager(mkParams());

        const extraRetry = retryManager.updateExtraRetry(defaultTestId, notMatchedErrorMessage);

        assert.equal(extraRetry, 0);
    });

    it('should increase retries if error message match patterns', () => {
        const retryManager = new RetryManager(mkParams());

        const extraRetry = retryManager.updateExtraRetry(defaultTestId, defaultErrorMessage);

        assert.equal(extraRetry, 1);
    });

    it('should increase retries for testId', () => {
        const retryManager = new RetryManager(mkParams({extraRetry: 10}));

        retryManager.updateExtraRetry(defaultTestId, defaultErrorMessage);
        const extraRetry = retryManager.updateExtraRetry(defaultTestId, defaultErrorMessage);

        assert.equal(extraRetry, 2);
    });

    it('should not increase retries if it greater than extraRetry from config', () => {
        const retryManager = new RetryManager(mkParams());

        retryManager.updateExtraRetry(defaultTestId, defaultErrorMessage);
        const extraRetry = retryManager.updateExtraRetry(defaultTestId, defaultErrorMessage);

        assert.equal(extraRetry, 1);
    });

    it('should log adding extra retries', () => {
        const retryManager = new RetryManager(mkParams());

        retryManager.updateExtraRetry(defaultTestId, defaultErrorMessage);

        assert.calledWith(logger.info, 'add extra retry for test "default test (id)" because of error "default error"');
    });

    it('should clear extra retries', () => {
        const retryManager = new RetryManager(mkParams());

        const oldExtraRetry = retryManager.updateExtraRetry(defaultTestId, defaultErrorMessage);
        retryManager.clear();
        const newExtraRetry = retryManager.updateExtraRetry(defaultTestId, notMatchedErrorMessage);

        assert.equal(oldExtraRetry, 1);
        assert.equal(newExtraRetry, 0);
    });
});
