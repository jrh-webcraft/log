const adapt = require('../tests/support/tests.context')

// -----------------------------------------------------

describe('Logging: Integration', () => {
  it('correctly sends local and remote logs', async () => {
    stub(console, 'log')
    stub(console, 'error')

    const log = require('./index')({
      application: 'jrh-log',
      key: adapt('key'),
      mode: 'development',
      source: '@jrh/log'
    })

    log('Test 1')
    log('Test 2')
    log.error('Test 3')
    await log.complete()

    const id = console.log.firstCall.args[0].split(' ')[0]
    expect(console.log).to.have.been.calledTwice
    expect(console.log.firstCall.args[0]).to.include(id).and.to.include('Test 1')
    expect(console.log.secondCall.args[0]).to.include(id).and.to.include('Test 2')

    expect(console.error).to.have.been.calledOnce
    expect(console.error.firstCall.args[0]).to.include(id).and.to.include('Test 3')

    // ***
    // Manual: Confirm that expected logs display in LogDNA.
    // ***

    console.log.restore()
    console.error.restore()
  })
})
