export type Primitive = string | number | boolean | null

interface Setable<Interface> {
  set<K extends keyof Interface>(key: K, value: Interface[K]): this;
  set<K extends keyof Interface>(key: K, value: (state: Interface) => Interface[K]): this;
}

interface Mergeable<Interface> {
  mergeTo<T extends Record<string, any>>(target: T): T & Interface
  mergeTo<T extends Record<string, any>, P extends string>(target: T, prop?: P): T & { [K in P]: Interface }
}

export interface SyncBuilder<Interface extends Record<string, any>> extends Mergeable<Interface>, Setable<Interface> {
  build(): Interface
  transform<NewInterface>(transformFn: (state: Interface) => NewInterface): SyncBuilder<NewInterface>
}

export interface AsyncBuilder<Interface extends Record<string, any>> extends Mergeable<Interface>, Setable<Interface> {
  build(): Promise<Interface>
  setAsync<K extends keyof Interface>(key: K, value: ((state: Interface) => Promise<Primitive> )): this
  transform<NewInterface>(transformFn: (state: Interface) => NewInterface): AsyncBuilder<NewInterface>
}
