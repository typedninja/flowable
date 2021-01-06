import { Flow } from './flow'

export type ProducerFn<T> = (flow: Flow<T>) => Promise<void>

export interface Options {
  /** Number of values to buffer */
  buffer?: number
}

export class Flowable<T> implements AsyncIterable<T> {
  constructor (
    private readonly producerFn: ProducerFn<T>,
    private readonly options: Options = {}
  ) {}

  [Symbol.asyncIterator] (): AsyncIterator<T> {
    const flow = new Flow<T>(this.options.buffer)

    this.producerFn(flow)
      .then(() => flow.complete())
      .catch(error => flow.error(error))

    return flow.iterator()
  }

  /**
   * Returns a new Flowable with a different buffer setting
   *
   * @param buffer See {@link Options.buffer}
   */
  public buffer (buffer: number): Flowable<T> {
    return new Flowable(this.producerFn, { ...this.options, buffer })
  }
}
