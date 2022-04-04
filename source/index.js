const createUniqueId = require('nanoid').nanoid
const request = require('axios')

// -----------------------------------------------------

const createLocalLogger = require('./createLocalLogger')

const createRemoteLogger = require('./createRemoteLogger')
  .provide({ request })

// -----------------------------------------------------

module.exports = require('./createLogger')
  .provide({ createLocalLogger, createRemoteLogger, createUniqueId })
