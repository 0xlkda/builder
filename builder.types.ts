export type Primitive = string | number | boolean | null
export type KeyValue<K extends string = string, V = any> = Record<K, V>

interface Setable<Interface> {
  set<K extends keyof Interface>(key: K, value: Interface[K]): this;
  set<K extends keyof Interface>(key: K, value: (state: Interface) => Interface[K]): this;
}

interface Mergeable<Interface> {
  mergeTo<T extends KeyValue>(target: T): T & Interface
  mergeTo<T extends KeyValue, P extends string>(target: T, prop?: P): T & { [K in P]: Interface }
}

type RunType = 'SYNC' | 'ASYNC'

interface Transformable<T, R extends RunType> {
  transform<U>(transformFn: (state: T) => T & U): R extends 'SYNC'
    ? SyncBuilder<ReturnType<typeof transformFn>>
    : AsyncBuilder<ReturnType<typeof transformFn>>
}

export interface SyncBuilder<Interface extends KeyValue> extends
  Mergeable<Interface>,
  Setable<Interface>,
  Transformable<Interface, 'SYNC'> {
  build(): Interface
}

export interface AsyncBuilder<Interface extends KeyValue> extends
  Mergeable<Interface>,
  Setable<Interface>,
  Transformable<Interface, 'ASYNC'> {
  build(): Promise<Interface>
  setAsync<K extends keyof Interface>(key: K, value: ((state: Interface) => Promise<Primitive> )): this
}
