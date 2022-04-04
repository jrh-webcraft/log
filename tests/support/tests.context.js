const configureAdapt = require('@jrh/adapt')

// -----------------------------------------------------

module.exports = configureAdapt({
  environment: {
    mode: 'development',
    ...require('./tests.environment')
  },

  configuration: {
    key: '[logdna_key]'
  }
})
