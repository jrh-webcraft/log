describe('createLocalLogger()', () => {
  const createLocalLogger = require('./createLocalLogger')

  beforeEach(() => {
    stub(console, 'log')
    stub(console, 'error')
  })

  afterEach(() => {
    console.log.restore()
    console.error.restore()
  })

  describe('the created logger', () => {
    describe('.info()', () => {
      it('passes all arguments through to console.log', () => {
        const logger = createLocalLogger()
        logger.info(1, 2, 3, {})

        expect(console.log).to.have.been.calledOnceWith(1, 2, 3, {})
      })
    })

    describe('.error()', () => {
      it('passes all arguments through to console.error', () => {
        const logger = createLocalLogger()
        logger.error(1, 2, 3, {})

        expect(console.error).to.have.been.calledOnceWith(1, 2, 3, {})
      })
    })
  })
})
