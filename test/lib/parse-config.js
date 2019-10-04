'use strict';

const parseConfig = require('../../lib/parse-config');

describe('lib/parse-config', () => {
    describe('"errorPatterns" option', () => {
        it('should set from configuration file', () => {
            const config = parseConfig({
                errorPatterns: [{name: 'stub', pattern: 'stub'}]
            });

            assert.deepEqual(config.errorPatterns, [{name: 'stub', pattern: 'stub'}]);
        });

        it('should convert string pattern to object', () => {
            const config = parseConfig({
                errorPatterns: ['stub']
            });

            assert.deepEqual(config.errorPatterns, [{name: 'stub', pattern: 'stub'}]);
        });

        it('should throw error if errorPatterns is not array', () => {
            const test = () =>
                parseConfig({
                    errorPatterns: 'stub'
                });

            assert.throws(test, '"errorPatterns" option must be array, but got string');
        });

        it('should throw error if pattern is not string or object', () => {
            const test = () =>
                parseConfig({
                    errorPatterns: [100]
                });

            assert.throws(test, 'Element of "errorPatterns" option must be plain object or string, but got number');
        });

        it('should throw error if field "name" in element of "errorPatterns" does not exist', () => {
            const test = () =>
                parseConfig({
                    errorPatterns: [{pattern: 'pattern'}]
                });

            assert.throws(test, 'Field "name" in element of "errorPatterns" option is required');
        });

        it('should throw error if field "pattern" in element of "errorPatterns" does not exist', () => {
            const test = () =>
                parseConfig({
                    errorPatterns: [{name: 'name'}]
                });

            assert.throws(test, 'Field "pattern" in element of "errorPatterns" option is required');
        });

        it('should throw error if field "name" in element of "errorPatterns" is not string', () => {
            const test = () =>
                parseConfig({
                    errorPatterns: [{name: 100, pattern: 'pattern'}]
                });

            assert.throws(test, 'Field "name" in element of "errorPatterns" option must be string, but got number');
        });

        it('should throw error if field "pattern" in element of "errorPatterns" is not string', () => {
            const test = () =>
                parseConfig({
                    errorPatterns: [{name: 'name', pattern: 100}]
                });

            assert.throws(test, 'Field "pattern" in element of "errorPatterns" option must be string, but got number');
        });
    });
});
