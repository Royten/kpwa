const assert = require('assert')
const add = require('../src/add')

describe('Demo', () => {
  it('should add correctly', () => {
    assert.equal(add(1,1), 2)
  })
})
