/* eslint-env browser */
// patched version of debug because there's actually not a way to disable colors globally!

/**
 * This is the web browser implementation of `debug()`.
 */

exports.formatArgs = formatArgs
exports.save = save
exports.load = load
exports.useColors = useColors
exports.storage = localstorage()
exports.destroy = (() => {
  let warned = false

  return () => {
    if (!warned) {
      warned = true
      console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.')
    }
  }
})()

/**
 * Colors.
 */

exports.colors = [6, 2, 3, 4, 5, 1]

const { formatters = {} } = module.exports

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

// eslint-disable-next-line complexity
function useColors () {
  return true
}

/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs (args) {
  const { namespace: name, useColors } = this

  if (useColors) {
    const c = this.color
    const colorCode = '\u001B[3' + (c < 8 ? c : '8;5;' + c)
    const prefix = `  ${colorCode};1m${name} \u001B[0m`

    args[0] = prefix + args[0].split('\n').join('\n' + prefix) + ' ' + colorCode + ';1m+' + module.exports.humanize(this.diff) + ' \u001B[0m'
  } else {
    args[0] = new Date().toISOString() + ' ' + name + ' ' + args[0]
  }
}

/**
 * Invokes `console.debug()` when available.
 * No-op when `console.debug` is not a "function".
 * If `console.debug` is not available, falls back
 * to `console.log`.
 *
 * @api public
 */
exports.log = console.debug || console.log || (() => {})

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */
function save (namespaces) {
  try {
    if (namespaces) {
      exports.storage.setItem('debug', namespaces)
    } else {
      exports.storage.removeItem('debug')
    }
  } catch (error) {
    // Swallow
    // XXX (@Qix-) should we be logging these?
  }
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */
function load () {
  let r
  try {
    r = exports.storage.getItem('debug')
  } catch (error) {
    // Swallow
    // XXX (@Qix-) should we be logging these?
  }

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = process.env.DEBUG
  }

  return r
}

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage () {
  try {
    // TVMLKit (Apple TV JS Runtime) does not have a window object, just localStorage in the global context
    // The Browser also has localStorage in the global context.
    return localStorage
  } catch (error) {
    // Swallow
    // XXX (@Qix-) should we be logging these?
  }
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

formatters.j = function (v) {
  try {
    return JSON.stringify(v)
  } catch (error) {
    return '[UnexpectedJSONParseError]: ' + error.message
  }
}

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 */

function setup (env) {
  createDebug.debug = createDebug
  createDebug.default = createDebug
  createDebug.coerce = coerce
  createDebug.disable = disable
  createDebug.enable = enable
  createDebug.enabled = enabled
  createDebug.humanize = require('ms')
  createDebug.destroy = destroy

  Object.keys(env).forEach(key => {
    createDebug[key] = env[key]
  })

  /**
  * The currently active debug mode names, and names to skip.
  */

  createDebug.names = []
  createDebug.skips = []

  /**
  * Map of special "%n" handling functions, for the debug "format" argument.
  *
  * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
  */
  createDebug.formatters = {}

  /**
  * Selects a color for a debug namespace
  * @param {String} namespace The namespace string for the debug instance to be colored
  * @return {Number|String} An ANSI color code for the given namespace
  * @api private
  */
  function selectColor (namespace) {
    let hash = 0

    for (let i = 0; i < namespace.length; i++) {
      hash = ((hash << 5) - hash) + namespace.charCodeAt(i)
      hash |= 0 // Convert to 32bit integer
    }

    return createDebug.colors[Math.abs(hash) % createDebug.colors.length]
  }
  createDebug.selectColor = selectColor

  /**
  * Create a debugger with the given `namespace`.
  *
  * @param {String} namespace
  * @return {Function}
  * @api public
  */
  function createDebug (namespace) {
    let prevTime
    let enableOverride = null
    let namespacesCache
    let enabledCache

    function debug (...args) {
      // Disabled?
      if (!debug.enabled) {
        return
      }

      const self = debug

      // Set `diff` timestamp
      const curr = Number(new Date())
      const ms = curr - (prevTime || curr)
      self.diff = ms
      self.prev = prevTime
      self.curr = curr
      prevTime = curr

      args[0] = createDebug.coerce(args[0])

      if (typeof args[0] !== 'string') {
        // Anything else let's inspect with %O
        args.unshift('%O')
      }

      // Apply any `formatters` transformations
      let index = 0
      args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
        // If we encounter an escaped % then don't increase the array index
        if (match === '%%') {
          return '%'
        }
        index++
        const formatter = createDebug.formatters[format]
        if (typeof formatter === 'function') {
          const val = args[index]
          match = formatter.call(self, val)

          // Now we need to remove `args[index]` since it's inlined in the `format`
          args.splice(index, 1)
          index--
        }
        return match
      })

      // Apply env-specific formatting (colors, etc.)
      createDebug.formatArgs.call(self, args)

      const logFn = self.log || createDebug.log
      logFn.apply(self, args)
    }

    debug.namespace = namespace
    debug.useColors = createDebug.useColors()
    debug.color = createDebug.selectColor(namespace)
    debug.extend = extend
    debug.destroy = createDebug.destroy // XXX Temporary. Will be removed in the next major release.

    Object.defineProperty(debug, 'enabled', {
      enumerable: true,
      configurable: false,
      get: () => {
        if (enableOverride !== null) {
          return enableOverride
        }
        if (namespacesCache !== createDebug.namespaces) {
          namespacesCache = createDebug.namespaces
          enabledCache = createDebug.enabled(namespace)
        }

        return enabledCache
      },
      set: v => {
        enableOverride = v
      }
    })

    // Env-specific initialization logic for debug instances
    if (typeof createDebug.init === 'function') {
      createDebug.init(debug)
    }

    return debug
  }

  function extend (namespace, delimiter) {
    const newDebug = createDebug(this.namespace + (typeof delimiter === 'undefined' ? ':' : delimiter) + namespace)
    newDebug.log = this.log
    return newDebug
  }

  /**
  * Enables a debug mode by namespaces. This can include modes
  * separated by a colon and wildcards.
  *
  * @param {String} namespaces
  * @api public
  */
  function enable (namespaces) {
    createDebug.save(namespaces)
    createDebug.namespaces = namespaces

    createDebug.names = []
    createDebug.skips = []

    let i
    const split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/)
    const len = split.length

    for (i = 0; i < len; i++) {
      if (!split[i]) {
        // ignore empty strings
        continue
      }

      namespaces = split[i].replace(/\*/g, '.*?')

      if (namespaces[0] === '-') {
        createDebug.skips.push(new RegExp('^' + namespaces.slice(1) + '$'))
      } else {
        createDebug.names.push(new RegExp('^' + namespaces + '$'))
      }
    }
  }

  /**
  * Disable debug output.
  *
  * @return {String} namespaces
  * @api public
  */
  function disable () {
    const namespaces = [
      ...createDebug.names.map(toNamespace),
      ...createDebug.skips.map(toNamespace).map(namespace => '-' + namespace)
    ].join(',')
    createDebug.enable('')
    return namespaces
  }

  /**
  * Returns true if the given mode name is enabled, false otherwise.
  *
  * @param {String} name
  * @return {Boolean}
  * @api public
  */
  function enabled (name) {
    if (name[name.length - 1] === '*') {
      return true
    }

    let i
    let len

    for (i = 0, len = createDebug.skips.length; i < len; i++) {
      if (createDebug.skips[i].test(name)) {
        return false
      }
    }

    for (i = 0, len = createDebug.names.length; i < len; i++) {
      if (createDebug.names[i].test(name)) {
        return true
      }
    }

    return false
  }

  /**
  * Convert regexp to namespace
  *
  * @param {RegExp} regxep
  * @return {String} namespace
  * @api private
  */
  function toNamespace (regexp) {
    return regexp.toString()
      .substring(2, regexp.toString().length - 2)
      .replace(/\.\*\?$/, '*')
  }

  /**
  * Coerce `val`.
  *
  * @param {Mixed} val
  * @return {Mixed}
  * @api private
  */
  function coerce (val) {
    if (val instanceof Error) {
      return val.stack || val.message
    }
    return val
  }

  /**
  * XXX DO NOT USE. This is a temporary stub function.
  * XXX It WILL be removed in the next major release.
  */
  function destroy () {
    console.warn('Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.')
  }

  createDebug.enable(createDebug.load())

  return createDebug
}

module.exports = setup(exports)
