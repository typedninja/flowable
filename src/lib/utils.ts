export function restack (error: Error, ignore: Function = restack): Error {
  if (error.stack !== undefined) {
    const stackObj = { stack: '' }

    Error.captureStackTrace(stackObj, ignore)

    const stackLines = stackObj.stack.split('\n')

    stackLines.shift()

    const newStack = stackLines.join('\n')

    error.stack = error.stack + '\n' + newStack
  }

  return error
}
