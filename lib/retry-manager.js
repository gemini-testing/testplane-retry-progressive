'use strict';

const logger = require('./logger');

class RetryManager {
    constructor({extraRetry, errorPatterns}) {
        this._maxExtraRetry = extraRetry;
        this._errorPatterns = errorPatterns.map(patternInfo => ({
            ...patternInfo,
            regexp: new RegExp(patternInfo.pattern)
        }));
        this._extraRetries = new Map();
    }

    updateExtraRetry(testId, errorMessage) {
        const matchedErrorName = this._matchErrorPattern(errorMessage);

        if (matchedErrorName) {
            if (this._tryIncreaseExtraRetry(testId)) {
                logger.info(`add extra retry for test "${testId}" because of error "${matchedErrorName}"`);
            }
        }

        return this._getExtraRetry(testId);
    }

    _matchErrorPattern(message) {
        for (const patternInfo of this._errorPatterns) {
            if (message.match(patternInfo.regexp)) {
                return patternInfo.name;
            }
        }

        return null;
    }

    _getExtraRetry(testId) {
        if (!this._extraRetries.has(testId)) {
            this._extraRetries.set(testId, 0);
        }

        return this._extraRetries.get(testId);
    }

    _tryIncreaseExtraRetry(testId) {
        const extraRetry = this._getExtraRetry(testId);

        if (extraRetry < this._maxExtraRetry) {
            this._extraRetries.set(testId, extraRetry + 1);
            return true;
        }

        return false;
    }
}

module.exports = RetryManager;
