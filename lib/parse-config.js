'use strict';

const _ = require('lodash');
const {root, section, option} = require('gemini-configparser');
const {errorPatterns, extraRetry} = require('./defaults');

const ENV_PREFIX = 'testplane_retry_progressive_';
const CLI_PREFIX = '--retry-progressive-';

const assertType = (name, validationFn, type) => {
    return (v) => {
        if (!validationFn(v)) {
            throw new Error(`"${name}" option must be ${type}, but got ${typeof v}`);
        }
    };
};

const assertBoolean = (name) => assertType(name, _.isBoolean, 'boolean');
const assertNumber = (name) => assertType(name, _.isNumber, 'number');

const assertErrorPatterns = (errorPatterns) => {
    if (!_.isArray(errorPatterns)) {
        throw new Error(`"errorPatterns" option must be array, but got ${typeof errorPatterns}`);
    }
    for (const patternInfo of errorPatterns) {
        if (!_.isString(patternInfo) && !_.isPlainObject(patternInfo)) {
            throw new Error(`Element of "errorPatterns" option must be plain object or string, but got ${typeof patternInfo}`);
        }
        if (_.isPlainObject(patternInfo)) {
            for (const field of ['name', 'pattern']) {
                if (!patternInfo[field]) {
                    throw new Error(`Field "${field}" in element of "errorPatterns" option is required`);
                }

                if (!_.isString(patternInfo[field])) {
                    throw new Error(`Field "${field}" in element of "errorPatterns" option must be string, but got ${typeof patternInfo[field]}`);
                }
            }
        }
    }
};

const mapErrorPatterns = (errorPatterns) => {
    return errorPatterns.map(patternInfo => {
        if (typeof patternInfo === 'string') {
            return {
                name: patternInfo,
                pattern: patternInfo
            };
        }
        return patternInfo;
    });
};

function getParser() {
    return root(section({
        enabled: option({
            defaultValue: true,
            parseEnv: JSON.parse,
            parseCli: JSON.parse,
            validate: assertBoolean('enabled')
        }),
        errorPatterns: option({
            defaultValue: errorPatterns,
            parseEnv: JSON.parse,
            parseCli: JSON.parse,
            validate: assertErrorPatterns,
            map: mapErrorPatterns
        }),
        extraRetry: option({
            defaultValue: extraRetry,
            parseEnv: Number,
            parseCli: Number,
            validate: assertNumber('extraRetry')
        })
    }), {envPrefix: ENV_PREFIX, cliPrefix: CLI_PREFIX});
}

module.exports = (options) => {
    const {env, argv} = process;

    return getParser()({options, env, argv});
};
