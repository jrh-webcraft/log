const chai = require('chai')
const { spy, stub, useFakeTimers } = require('sinon')
const sinonChai = require('sinon-chai')

// ---------------------------------------------

chai.use(sinonChai)

// ---------------------------------------------

Object.assign(global, {
  expect: chai.expect,
  spy,
  stub,
  useFakeTimers
})
