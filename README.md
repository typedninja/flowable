# @typedninja/flowable

> Async generators done right

## Install

```
$ yarn add @typedninja/flowable

$ npm install --save @typedninja/flowable
```

## Usage

See also the [API documentation](https://typed.ninja/flowable/).

```typescript
import { Flowable } from '@typedninja/flowable';

async function main (): Promise<void> {
  const iterable = new Flowable<number>(async (flow) => {
    let i = 0

    while (await flow.want() !== undefined) {
      flow.next(i++)
    }
  })

  for await (const i of iterable) {
    console.log(i)

    if (i >= 10) break
  }
}

main().catch(console.log)
```

## License

[MIT](https://choosealicense.com/licenses/mit/)
