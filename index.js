'use strict';

const _ = require('lodash');
const parseConfig = require('./lib/parse-config');
const RetryManager = require('./lib/retry-manager');

module.exports = (testplane, opts) => {
    if (testplane.isWorker()) {
        return;
    }

    const config = parseConfig(opts);
    if (!config.enabled) {
        return;
    }

    const retryManager = new RetryManager(config);

    testplane.on(testplane.events.RUNNER_START, () => {
        retryManager.clear();
    });

    testplane.config.getBrowserIds().forEach((browserId) => {
        const browserConfig = testplane.config.forBrowser(browserId);

        const oldShouldRetry = browserConfig.shouldRetry;

        browserConfig.shouldRetry = (options) => {
            if (typeof oldShouldRetry === 'function') {
                if (oldShouldRetry(options)) {
                    return true;
                }
            }

            const {ctx, retriesLeft} = options;
            const testId = `${ctx.fullTitle()} (${browserId})`;

            const errorMessage = _.get(ctx, 'err.message', '');
            const extraRetry = retryManager.updateExtraRetry(testId, errorMessage);

            return retriesLeft + extraRetry > 0;
        };
    });
};
