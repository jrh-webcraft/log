describe('createRemoteLogger()', () => {
  const createRemoteLogger = require('./createRemoteLogger')

  const valid = {
    configuration: {
      application: '',
      key: '',
      now: 1,
      source: ''
    }
  }

  describe('the created logger', () => {
    describe('.info()', () => {
      it('queues a request with all required data', async () => {
        const configuration = { ...valid.configuration, application: 'application' }
        const now = new Date().getTime()
        const request = { post: spy() }

        const clock = useFakeTimers(now)

        const logger = createRemoteLogger.provide({ request }).run(configuration)
        logger.info('Message', { data: 'Info' })
        await logger.send()

        expect(request.post).to.have.been.calledOnce
        expect(request.post.firstCall.args[1].lines).to.have.length(1)
        expect(request.post.firstCall.args[1].lines[0]).to.deep.eql({
          timestamp: now,
          line: 'Message',
          app: 'application',
          level: 'info',
          meta: { data: 'Info' }
        })

        clock.restore()
      })
    })

    describe('.error()', () => {
      it('queues a request with all required data', async () => {
        const configuration = { ...valid.configuration, application: 'application' }
        const now = new Date().getTime()
        const request = { post: spy() }

        const clock = useFakeTimers(now)

        const logger = createRemoteLogger.provide({ request }).run(configuration)
        logger.error('Message')
        await logger.send()

        expect(request.post).to.have.been.calledOnce
        expect(request.post.firstCall.args[1].lines).to.have.length(1)
        expect(request.post.firstCall.args[1].lines[0]).to.deep.eql({
          timestamp: now,
          line: 'Message',
          app: 'application',
          level: 'error'
        })

        clock.restore()
      })
    })

    describe('.send()', () => {
      it('sends all queued requests', async () => {
        const configuration = {
          ...valid.configuration,
          application: 'application',
          key: 'key',
          source: 'source'
        }

        const now = new Date().getTime()
        const request = { post: spy() }

        const clock = useFakeTimers(now)

        const logger = createRemoteLogger.provide({ request }).run(configuration)

        logger.info('Message 1')
        logger.error('Message 2')

        const later = now + 1000
        clock.tick(1000)
        logger.info('Message 3')
        logger.error('Message 4')

        await logger.send()

        const url = `https://logs.logdna.com/logs/ingest?apikey=key&hostname=source&now=${ now }`

        expect(request.post).to.have.been.calledOnce
        expect(request.post.firstCall.args[0]).to.eq(url)

        expect(request.post.firstCall.args[1].lines).to.have.length(4)
        expect(request.post.firstCall.args[1].lines[0]).to.deep.eql({
          timestamp: now,
          line: 'Message 1',
          app: 'application',
          level: 'info'
        })

        expect(request.post.firstCall.args[1].lines[1]).to.deep.eql({
          timestamp: now,
          line: 'Message 2',
          app: 'application',
          level: 'error'
        })

        expect(request.post.firstCall.args[1].lines[2]).to.deep.eql({
          timestamp: later,
          line: 'Message 3',
          app: 'application',
          level: 'info'
        })

        expect(request.post.firstCall.args[1].lines[3]).to.deep.eql({
          timestamp: later,
          line: 'Message 4',
          app: 'application',
          level: 'error'
        })

        clock.restore()
      })
    })
  })
})
