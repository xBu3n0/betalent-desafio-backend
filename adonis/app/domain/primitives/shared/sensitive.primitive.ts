import util from 'node:util'

export default abstract class SensitivePrimitive {
  [util.inspect.custom]() {
    return `{ value: '${this.toString()}' }`
  }

  toJSON() {
    return this.toString()
  }

  toString() {
    return '****'
  }
}
