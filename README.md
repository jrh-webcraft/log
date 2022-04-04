# @jrh/log

Combined local and remote logging (via [LogDNA](https://logdna.com)) for Node.js applications.

## Installation

`npm install @jrh/log`

## Logging

```javascript
const log = require('@jrh/log')(options)

async function initialize() {
  try {
    log(message, [metadata])
    log(message, [metadata])
  }

  catch (error) {
    log.error(error.stack)
  }

  await log.complete()
}
```

### Syntax: `createLogger()`

| Name | Type | Description |
| :-- | :-- | :-- |
| options | [Object: Options](#the-options-object) | Configuration for the logging function. |

#### Returns

| Type | Description |
| :-- | :-- |
| Function | A logging function. |

---

#### The Options Object

| Property | Type | Description |
| :-- | :-- | :-- |
| application | String | The name of the application. |
| key | String | The LogDNA API key. |
| mode | String | The mode of the running application (i.e. `production`). **When the mode is set to `testing`, remote logs are disabled.** |
| source | String | The source of the log message. |

---

### Syntax: Logging Function

Log general information.

| Name | Type | Description |
| :-- | :-- | :-- |
| message | String | A message to log. |
| metadata | Object *(optional)* | Metadata to be included with the log message. |

### Effects

- Logs will appear locally via `console.log`.
- The LogDNA log level will be `info`.

### Methods

#### `.error()`

Log errors.

| Name | Type | Description |
| :-- | :-- | :-- |
| message | String | An error message to log. |

- Logs will appear locally via `console.error`.
- The LogDNA log level will be `error`.

#### `.complete()`

To reduce HTTP traffic, LogDNA sends logs in batches. Calling this method will send the current batch and resolve when it is finished.

When `mode` in the [options object](#the-options-object) is set to `testing`, no remote logs will be sent.

#### Returns

| Type | Description |
| :-- | :-- |
| Promise | A promise to send all logs. |

## Testing

To run the integration tests, create `tests/support/tests.environment.js` in the following format:

```javascript
module.exports = {
  logdna_key: 'your_logdna_key'
}
```

Test logs will appear in your LogDNA account.
