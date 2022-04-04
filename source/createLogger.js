const rely = require('@jrh/rely')

// -----------------------------------------------------

function createLogger({ application, key, mode, source }, dependencies) {
  const { createLocalLogger, createRemoteLogger, createUniqueId } = dependencies

  // -----------------------------------------------------

  const id = createUniqueId(8)
  const localLogger = createLocalLogger()
  const remoteLogger = createRemoteLogger({ application, key, source })

  // -----------------------------------------------------

  function decorateMessage(message) {
    return `(${ id }) ${ message }`
  }

  // -----------------------------------------------------

  function log(message, data) {
    if (mode === 'testing') {
      return
    }

    message = decorateMessage(message)

    if (!data) {
      localLogger.info(message)
      remoteLogger.info(message)
    }

    if (data) {
      localLogger.info(message, data)
      remoteLogger.info(message, { meta: data })
    }
  }

  log.error = (message) => {
    if (mode === 'testing') {
      return
    }

    message = decorateMessage(message)

    localLogger.error(message)
    remoteLogger.error(message)
  }

  log.complete = async () => {
    if (mode === 'testing') {
      return
    }

    await remoteLogger.send()
  }

  // -----------------------------------------------------

  return log
}

// -----------------------------------------------------

module.exports = rely
  .on('createLocalLogger', 'createRemoteLogger', 'createUniqueId')
  .to(createLogger)
