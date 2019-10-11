# hermione-retry-progressive [![Build Status](https://travis-ci.org/gemini-testing/hermione-retry-progressive.svg?branch=master)](https://travis-ci.org/gemini-testing/hermione-retry-progressive)

Plugin for [hermione](https://github.com/gemini-testing/hermione/) to adding extra retries at runtime if error message 
(from failed test) matched by patterns (from config). 

You can read more about hermione plugins [here](https://github.com/gemini-testing/hermione#plugins).

## Installation

```bash
$ npm install hermione-retry-progressive
```

## Usage

Plugin has following configuration:

-   **enabled** (optional) `Boolean` – enable/disable the plugin; default `true`.
-   **extraRetry** (optional) `Number` – how many times a test should be retried if it fails with error matched by **errorPatterns**. Global value for all browsers; default `5`.
-   **errorPatterns** (optional) - `Array` - error message patterns for adding retries.
    Array element must be `Object` ({'_name_': `String`, '_pattern_': `String`}) or `String` (interpret as `name` and `pattern`).
    `name` is needed for pretty console output. `pattern` must be valid for RegExp constructor.

Also there is ability to override plugin parameters by CLI options or environment variables
(see [configparser](https://github.com/gemini-testing/configparser)).
Use `hermione_retry_progressive` prefix for the environment variables and `--retry-progressive-` for the cli options.

For example you can override `extraRetry` option like so:

```bash
$ hermione_retry_progressive_extra_retry=3 hermione
$ hermione --retry-progressive-extra-retry 3
```

Add plugin to your `hermione` config file:

```js
module.exports = {
    // ...
    plugins: {
        'hermione-retry-progressive': {
            enabled: true,
            extraRetry: 7,
            errorPatterns: [
                'Parameter .* must be a string',
                {
                    name: 'Cannot read property of undefined',
                    pattern: 'Cannot read property .* of undefined',
                },
            ],
        },
    },
    // ...
};
```

## Testing

Run [mocha](http://mochajs.org) tests:

```bash
npm run test-unit
```

Run [eslint](http://eslint.org) codestyle verification

```bash
npm run lint
```
