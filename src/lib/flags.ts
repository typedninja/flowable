export interface Watcher {
  promise: Promise<void>
  resolver: Function
}

export class Flags<T extends object> {
  private readonly raised: Set<keyof T> = new Set()
  private readonly watchers: Map<keyof T, Watcher> = new Map()

  public raise (...flags: Array<keyof T>): void {
    for (const flag of flags) {
      if (this.raised.has(flag)) continue

      this.raised.add(flag)

      const watcher = this.watchers.get(flag)

      if (watcher !== undefined) {
        watcher.resolver()

        this.watchers.delete(flag)
      }
    }
  }

  public lower (...flags: Array<keyof T>): void {
    for (const flag of flags) this.raised.delete(flag)
  }

  public isUp (flag: keyof T): boolean {
    return this.raised.has(flag)
  }

  public async up (flag: keyof T): Promise<void> {
    if (this.isUp(flag)) return

    let watcher = this.watchers.get(flag)

    if (watcher === undefined) {
      watcher = this.createWatcher()

      this.watchers.set(flag, watcher)
    }

    return await watcher.promise
  }

  private createWatcher (): Watcher {
    let resolver!: Function

    const promise = new Promise<void>(resolve => {
      resolver = resolve
    })

    return { promise, resolver }
  }
}
