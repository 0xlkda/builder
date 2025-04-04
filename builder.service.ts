import { SyncBuilder, AsyncBuilder, Primitive } from './builder.types'

export class BuilderService {
  static createBuilder<Interface>(): SyncBuilder<Interface> {
    return new class implements SyncBuilder<Interface> {
      private state: Interface = {} as Interface

      build(): Interface {
        return this.state
      }
      mergeTo<T extends KeyValue, P extends string>(target: T, prop?: P) {
        return Object.assign(target, prop ? { [prop]: this.state } : this.state)
      }
      transform<U>(transformFn: (state: Interface) => Interface & U) {
        this.state = transformFn(this.state)
        return this as SyncBuilder<ReturnType<typeof transformFn>>
      }
      set<K extends keyof Interface>(key: K, value: Interface[K] | ((state: Interface) => Interface[K])) {
        this.state[key] = typeof value === 'function'
          ? (value as (state: Interface) => Primitive)(this.state) as Interface[K]
          : value
        return this
      }
    }
  }
  static createAsyncBuilder<Interface>(): AsyncBuilder<Interface> {
    return new class implements AsyncBuilder<Interface> {
      private state: Interface = {} as Interface
      private tasks: Promise<any>[] = []

      async build(): Promise<Interface> {
        await Promise.all(this.tasks)
        return this.state
      }
      mergeTo<T extends KeyValue, P extends string>(target: T, prop?: P) {
        return Object.assign(target, prop ? { [prop]: this.state } : this.state)
      }
      transform<U>(transformFn: (state: Interface) => Interface & U) {
        this.state = transformFn(this.state)
        return this as AsyncBuilder<ReturnType<typeof transformFn>>
      }
      set<K extends keyof Interface>(key: K, value: Interface[K] | ((state: Interface) => Interface[K])) {
        this.state[key] = typeof value === 'function'
          ? (value as (state: Interface) => Primitive)(this.state) as Interface[K]
          : value
        return this
      }
      setAsync<K extends keyof Interface>(key: K, asyncFn: ((state: Interface) => Promise<Primitive>)) {
        const task = asyncFn(this.state).then((result) => {
          this.state[key] = result as Interface[K]
        })
        this.tasks.push(task)
        return this
      }
    }
  }
}
