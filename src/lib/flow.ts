import { Flags } from './flags'
import { restack } from './utils'

interface FlowFlags {
  wantValues: () => void
  hasValues: () => void
}

export class Flow<T> {
  private readonly values: T[] = []
  private closed = false
  private readonly flags: Flags<FlowFlags>
  private thrown?: any

  constructor (
    private readonly buffer = 1
  ) {
    this.flags = new Flags()
  }

  public async want (): Promise<number | undefined> {
    while (!this.closed) {
      if (this.buffer > this.values.length) {
        return this.buffer - this.values.length
      }

      await this.flags.up('wantValues')
    }

    return undefined
  }

  public next (value: T): void {
    if (this.closed) return

    this.values.push(value)

    this.flags.raise('hasValues')

    if (this.values.length >= this.buffer) this.flags.lower('wantValues')
  }

  public error (error: any): void {
    if (this.closed) return

    this.thrown = error

    this.complete()
  }

  public complete (): void {
    if (this.closed) return

    this.closed = true

    this.flags.raise('wantValues', 'hasValues')
  }

  private async iteratorNext (): Promise<IteratorResult<T>> {
    while (this.values.length === 0) {
      if (this.closed) {
        if (this.thrown !== undefined) {
          if (this.thrown instanceof Error) {
            throw restack(this.thrown, this.iteratorNext)
          } else {
            throw new Error(this.thrown)
          }
        } else {
          return {
            value: undefined,
            done: true
          }
        }
      }

      this.flags.raise('wantValues')

      await this.flags.up('hasValues')
    }

    return {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      value: this.values.shift()!
    }
  }

  private async iteratorReturn (): Promise<IteratorResult<T>> {
    this.complete()

    return {
      value: undefined,
      done: true
    }
  }

  public iterator (): AsyncIterator<T> {
    return {
      next: this.iteratorNext.bind(this),
      return: this.iteratorReturn.bind(this)
    }
  }
}
