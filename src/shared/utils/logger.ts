import chalk from "chalk";

type logMethod = (...args: unknown[]) => void
type supportedMethods = 'debug' | 'info' | 'log' | 'warn' | 'error'
type supportedColors = 'gray' | 'cyan' | 'blue' | 'yellow' | 'red'

let isVerbose = false;

export const setVerbose = (verbose: boolean): void => {
  isVerbose = verbose
}

const createLogMethod = (method: supportedMethods, color: supportedColors): logMethod => (
  (...args) => console[method](chalk[color](...args))
)

const withVerbose = (logFn: logMethod): logMethod => (
  (...args) => {
    if(isVerbose) {
      logFn(...args)
    }
  }
)

export const withContext = (context: string) => (
  (logFn: logMethod): logMethod => (
    (...args) => logFn(`[${context}]`, ...args)
  )
)

export const debug = createLogMethod('debug', 'gray')
export const info = createLogMethod('info', 'cyan')
export const log = createLogMethod('log', 'blue')
export const warn = createLogMethod('warn', 'yellow')
export const error = createLogMethod('error', 'red')

export const verboseDebug = withVerbose(debug)
export const verboseInfo = withVerbose(info)
export const verboseLog = withVerbose(log)
export const verboseWarn = withVerbose(warn)
export const verboseError = withVerbose(error)
