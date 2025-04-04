import { SyncBuilder, AsyncBuilder, Primitive } from './builder.types'

export class BuilderService {
  static createBuilder<Interface extends Record<string, any>>(): SyncBuilder<Interface> {
    return new class implements SyncBuilder<Interface> {
      private state: Interface = {} as Interface

      build(): Interface {
        return this.state
      }
      set<K extends keyof Interface>(key: K, value: Interface[K] | ((state: Interface) => Interface[K])): this {
        this.state[key] = typeof value === 'function'
          ? (value as (state: Interface) => Primitive)(this.state) as Interface[K]
          : value
        return this
      }
      mergeTo<T extends Record<string, any>, P extends string>(target: T, prop?: P) {
        return Object.assign(target, prop ? { [prop]: this.state } : this.state)
      }
      transform<NewInterface extends Record<string, any>>(transformFn: (state: Interface) => NewInterface): SyncBuilder<NewInterface> {
        this.state = transformFn(this.state) as unknown as Interface
        return this as unknown as SyncBuilder<NewInterface>
      }
    }
  }
  static createAsyncBuilder<Interface extends Record<string, any>>(): AsyncBuilder<Interface> {
    return new class implements AsyncBuilder<Interface> {
      private state: Interface = {} as Interface
      private tasks: Promise<any>[] = []

      async build(): Promise<Interface> {
        await Promise.all(this.tasks)
        return this.state
      }
      mergeTo<T extends Record<string, any>, P extends string>(target: T, prop?: P) {
        return Object.assign(target, prop ? { [prop]: this.state } : this.state)
      }
      set<K extends keyof Interface>(key: K, value: Interface[K] | ((state: Interface) => Interface[K])): this {
        this.state[key] = typeof value === 'function'
          ? (value as (state: Interface) => Primitive)(this.state) as Interface[K]
          : value
        return this
      }
      setAsync<K extends keyof Interface>(key: K, asyncFn: ((state: Interface) => Promise<Primitive>)): this {
        const task = asyncFn(this.state).then((result) => {
          this.state[key] = result as Interface[K]
        })
        this.tasks.push(task)
        return this
      }
      transform<NewInterface extends Record<string, any>>(transformFn: (state: Interface) => NewInterface): AsyncBuilder<NewInterface> {
        this.state = transformFn(this.state) as unknown as Interface
        return this as unknown as AsyncBuilder<NewInterface>
      }
    }
  }
}
