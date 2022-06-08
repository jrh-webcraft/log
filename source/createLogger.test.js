const { EventEmitter } = require('events')

describe('createLogger()', () => {
  const createLogger = require('./createLogger')

  const fake = {
    dependencies: {
      createLocalLogger() { return fake.logger },
      createRemoteLogger() { return fake.logger },
      createUniqueId() {}
    },

    logger: {
      error() {},
      info() {}
    }
  }

  const valid = {
    options: {}
  }

  it('returns a configured logging function', () => {
    const createLocalLogger = spy()
    const createRemoteLogger = spy()

    const dependencies = {
      ...fake.dependencies,
      createLocalLogger,
      createRemoteLogger
    }

    const options = { application: 'app', key: 'key', source: 'source' }
    const result = createLogger.provide(dependencies).run(options)

    expect(createLocalLogger).to.have.been.calledOnceWith()

    expect(createRemoteLogger).to.have.been.calledOnceWith({
      key: 'key',
      application: 'app',
      source: 'source'
    })

    expect(result).to.be.a('function')
  })

  describe('the logging function', () => {
    it('logs the message', () => {
      const localLogger = { ...fake.logger, info: spy() }
      const remoteLogger = { ...fake.logger, info: spy() }

      const dependencies = {
        ...fake.dependencies,
        createLocalLogger: () => localLogger,
        createRemoteLogger: () => remoteLogger
      }

      const log = createLogger.provide(dependencies).run(valid.options)

      log('Message')

      expect(localLogger.info).to.have.been.calledOnce
      expect(localLogger.info.firstCall.args[0]).to.include('Message')

      expect(remoteLogger.info).to.have.been.calledOnce
      expect(remoteLogger.info.firstCall.args[0]).to.include('Message')
    })

    context('in testing mode', () => {
      it('does not log the message', () => {
        const localLogger = { ...fake.logger, info: spy() }
        const remoteLogger = { ...fake.logger, info: spy() }

        const dependencies = {
          ...fake.dependencies,
          createLocalLogger: () => localLogger,
          createRemoteLogger: () => remoteLogger
        }

        const options = { ...valid.options, mode: 'testing' }
        const log = createLogger.provide(dependencies).run(options)

        log('Message')
        expect(localLogger.info).not.to.have.been.called
        expect(remoteLogger.info).not.to.have.been.called
      })
    })

    it('uses the same request ID for each message', () => {
      const localLogger = { ...fake.logger, error: spy(), info: spy() }
      const remoteLogger = { ...fake.logger, error: spy(), info: spy() }
      const createUniqueId = stub().returns('id')

      const dependencies = {
        ...fake.dependencies,
        createLocalLogger: () => localLogger,
        createRemoteLogger: () => remoteLogger,
        createUniqueId
      }

      const log = createLogger.provide(dependencies).run(valid.options)

      log('Message 1')
      log('Message 2')
      log.error('Error message.')

      expect(createUniqueId).to.have.been.calledOnceWith(8)

      expect(localLogger.info).to.have.been.calledTwice
      expect(remoteLogger.info).to.have.been.calledTwice
      expect(localLogger.error).to.have.been.calledOnce
      expect(remoteLogger.error).to.have.been.calledOnce

      const calls = [
        ...localLogger.info.getCalls(),
        ...remoteLogger.info.getCalls(),
        ...localLogger.error.getCalls(),
        ...remoteLogger.error.getCalls()
      ]

      calls.forEach(call => {
        expect(call.args[0]).to.include('id')
      })
    })

    context('when unique IDs are disabled', () => {
      it('does not include a request ID in each message', () => {
        const localLogger = { ...fake.logger, error: spy(), info: spy() }
        const remoteLogger = { ...fake.logger, error: spy(), info: spy() }
        const createUniqueId = stub().returns('id')

        const dependencies = {
          ...fake.dependencies,
          createLocalLogger: () => localLogger,
          createRemoteLogger: () => remoteLogger,
          createUniqueId
        }

        const options = {
          ...valid.options,
          includeUniqueId: false
        }

        const log = createLogger.provide(dependencies).run(options)

        log('Message 1')
        log('Message 2')
        log.error('Error message.')

        expect(createUniqueId).to.have.been.calledOnceWith(8)

        expect(localLogger.info).to.have.been.calledTwice
        expect(remoteLogger.info).to.have.been.calledTwice
        expect(localLogger.error).to.have.been.calledOnce
        expect(remoteLogger.error).to.have.been.calledOnce

        const calls = [
          ...localLogger.info.getCalls(),
          ...remoteLogger.info.getCalls(),
          ...localLogger.error.getCalls(),
          ...remoteLogger.error.getCalls()
        ]

        calls.forEach(call => {
          expect(call.args[0]).not.to.include('id')
        })
      })
    })

    context('with data', () => {
      it('includes the data', () => {
        const localLogger = { ...fake.logger, info: spy() }
        const remoteLogger = { ...fake.logger, info: spy() }

        const dependencies = {
          ...fake.dependencies,
          createLocalLogger: () => localLogger,
          createRemoteLogger: () => remoteLogger
        }

        const log = createLogger.provide(dependencies).run(valid.options)

        log('Message', { data: 'data' })

        expect(localLogger.info).to.have.been.calledOnce
        expect(localLogger.info.firstCall.args[1]).to.exist.and.to.deep.eq({ data: 'data' })

        expect(remoteLogger.info).to.have.been.calledOnce
        expect(remoteLogger.info.firstCall.args[1]).to.exist.and.to.deep.eq({ meta: { data: 'data' } })
      })
    })

    context('without data', () => {
      it('does not include any data', () => {
        const localLogger = { ...fake.logger, info: spy() }
        const remoteLogger = { ...fake.logger, info: spy() }

        const dependencies = {
          ...fake.dependencies,
          createLocalLogger: () => localLogger,
          createRemoteLogger: () => remoteLogger
        }

        const log = createLogger.provide(dependencies).run(valid.options)

        log('Message')

        expect(localLogger.info).to.have.been.calledOnce
        expect(localLogger.info.firstCall.args).to.have.length(1)

        expect(remoteLogger.info).to.have.been.calledOnce
        expect(remoteLogger.info.firstCall.args).to.have.length(1)
      })
    })

    describe('.error()', () => {
      it('logs the error', () => {
        const localLogger = { ...fake.logger, error: spy() }
        const remoteLogger = { ...fake.logger, error: spy() }

        const dependencies = {
          ...fake.dependencies,
          createLocalLogger: () => localLogger,
          createRemoteLogger: () => remoteLogger
        }

        const log = createLogger.provide(dependencies).run(valid.options)

        log.error('Message')

        expect(localLogger.error).to.have.been.calledOnce
        expect(localLogger.error.firstCall.args[0]).to.include('Message')

        expect(remoteLogger.error).to.have.been.calledOnce
        expect(remoteLogger.error.firstCall.args[0]).to.include('Message')
      })

      context('in testing mode', () => {
        it('does not log the error', () => {
          const localLogger = { ...fake.logger, error: spy() }
          const remoteLogger = { ...fake.logger, error: spy() }

          const dependencies = {
            ...fake.dependencies,
            createLocalLogger: () => localLogger,
            createRemoteLogger: () => remoteLogger
          }

          const options = { ...valid.options, mode: 'testing' }
          const log = createLogger.provide(dependencies).run(options)

          log.error('Message')
          expect(localLogger.error).not.to.have.been.called
          expect(remoteLogger.error).not.to.have.been.called
        })
      })
    })

    describe('.complete()', () => {
      it('finishes after sending remote logs', async () => {
        const remoteLogger = { ...fake.remoteLogger, send: stub().resolves() }
        const dependencies = { ...fake.dependencies, createRemoteLogger: () => remoteLogger }
        const log = createLogger.provide(dependencies).run(valid.options)

        await log.complete()
        expect(remoteLogger.send).to.have.been.called
      })

      context('in testing mode', () => {
        it('finishes without sending remote logs', async () => {
          const options = { ...valid.options, mode: 'testing' }
          const remoteLogger = { ...fake.remoteLogger, send: spy() }
          const dependencies = { ...fake.dependencies, createRemoteLogger: () => remoteLogger }
          const log = createLogger.provide(dependencies).run(options)

          await log.complete()
          expect(remoteLogger.send).not.to.have.been.called
        })
      })
    })
  })
})
