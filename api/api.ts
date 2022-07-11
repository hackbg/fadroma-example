import * as Fadroma from '@hackbg/fadroma'

export class Echo extends Fadroma.Client {
  static init = (fail: boolean) => {
    if (fail) console.warn('init with fail=true')
    return { fail }
  }
  async queryEcho () {
    return await this.query('echo')
  }
  async queryFail () {
    return await this.query('fail')
  }
  async txEcho () {
    return await this.execute('echo')
  }
  async txFail () {
    return await this.execute('fail')
  }
}

export class KV extends Fadroma.Client {
  static init = (value?: string) => {
    if (value) {
      return { value }
    } else {
      return {}
    }
  }
  async get () {
    return await this.query('get')
  }
  async set (value: string) {
    return await this.execute({set: value})
  }
  async del () {
    return await this.execute('del')
  }
}
