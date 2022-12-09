# hermione-retry-progressive

## Overview

Use the `hermione-retry-progressive` plugin to additionally retry tests if the errors with which they fail correspond to a given set of patterns.

What might it be needed for?

Tests can fail not only because of developer errors, races between scripts executed on a web page, but also for infrastructural reasons. For example, when the network blinks, the browser is not given in time, temporary problems with DNS, etc.

### Examples of patterns for such errors

* Browser request was cancelled
* A window size operation failed because the window is not currently available
* chrome not reachable
* Tried to run command without establishing a connection
* No such driver
* no such window
* Session timed out or not found
* Reached error page
* getaddrinfo ENOTFOUND
* Browsing context has been discarded
* Cannot launch browser
* Failed to decode response from marionette
* session deleted because of page crash
* Couldn't connect to selenium server

## Install

```bash
npm install -D hermione-retry-progressive
```

## Setup

Add the plugin to the `plugins` section of the `hermione` config:

```javascript
module.exports = {
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

        // other hermione plugins...
    },

    // other hermione settings...
};
```

### Description of configuration parameters

| **Parameter** | **Type** | **Default&nbsp;value** | **Description** |
| ------------- | -------- | ---------------------- | --------------- |
| enabled | Boolean | true | Enable / disable the plugin. |
| extraRetry | Number | 5 | The number of times you need to retry the test if it crashes with an error that matches one of the _errorPatterns_. |
| errorPatterns | Array | `[ ]` | A list of patterns, one of which an error should match in order for the plugin to retry the test. For more information, see below. |

### errorPatterns

Each pattern in the `errorPatterns` array is either an object of the form:

```javascript
{
    name: 'A clear message for the user that will be output to the console',
    pattern: 'An error pattern that can be set, among other things, as a string for a regular expression'
}
```

or a string that will be interpreted by the plugin as an object of the form:

```javascript
{
    name: 'your string',
    pattern: 'your string'
}
```

The latter option is convenient if the readable format for the console and the error pattern completely match.

### Passing parameters via the CLI

All plugin parameters that can be defined in the config can also be passed as command-line options or through environment variables during the launch of Hermione. Use the prefix `--retry-progressive-` for command line options and `hermione_retry_progressive_` for environment variables. For example:

```bash
npx hermione --retry-progressive-extra-retry 3
```

```bash
hermione_retry_progressive_extra_retry=3 npx hermione
```
