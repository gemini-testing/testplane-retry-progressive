'use strict';

const parseConfig = require('./lib/parse-config');
const RetryManager = require('./lib/retry-manager');

module.exports = (hermione, opts) => {
    if (hermione.isWorker()) {
        return;
    }

    const config = parseConfig(opts);
    if (!config.enabled) {
        return;
    }

    const retryManager = new RetryManager(config);

    hermione.on(hermione.events.RUNNER_START, () => {
        retryManager.clear();
    });

    hermione.config.getBrowserIds().forEach((browserId) => {
        const browserConfig = hermione.config.forBrowser(browserId);

        const oldShouldRetry = browserConfig.shouldRetry;

        browserConfig.shouldRetry = (options) => {
            if (typeof oldShouldRetry === 'function') {
                if (oldShouldRetry(options)) {
                    return true;
                }
            }

            const {ctx, retriesLeft} = options;
            const testId = `${ctx.fullTitle()} (${browserId})`;

            const extraRetry = retryManager.updateExtraRetry(testId, ctx.err.message);

            return retriesLeft + extraRetry > 0;
        };
    });
};
