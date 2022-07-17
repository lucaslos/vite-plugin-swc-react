import fs from 'fs'
import path from 'path'
import { transform } from '@swc/core'
import { PluginOption } from 'vite'
import MagicString from 'magic-string'

const runtimePublicPath = '/@react-refresh'

const preambleCode = `import { injectIntoGlobalHook } from "${runtimePublicPath}";
injectIntoGlobalHook(window);
window.$RefreshReg$ = () => {};
window.$RefreshSig$ = () => (type) => type;`

const importReactRE = /import\s+(\*\s+as\s+)?React(,|\s+)/

const prependReactImport = 'import React from "react"; '

let define: { [key: string]: string } | undefined
let isProduction = false
let needHiresSourcemap = false

export default (): PluginOption => ({
  name: 'react-refresh',
  config: (config, { command }) => {
    isProduction = command === 'build'

    if (!isProduction) {
      if (config.esbuild) define = config.esbuild.define
      config.esbuild = false
    }
  },
  configResolved(config) {
    needHiresSourcemap = config.command === 'build' && !!config.build.sourcemap
  },
  resolveId: (id) =>
    !isProduction && id === runtimePublicPath ? id : undefined,
  load: (id) => {
    if (isProduction) return

    return id === runtimePublicPath
      ? fs.readFileSync(path.join(__dirname, 'refresh-runtime.js'), 'utf-8')
      : undefined
  },
  transformIndexHtml: () => {
    if (isProduction) return

    return [
      { tag: 'script', attrs: { type: 'module' }, children: preambleCode },
    ]
  },
  async transform(code, id) {
    if (id.includes('node_modules')) return

    if (!/\.[jt]sx?$/.test(id)) return

    const hasReactImport = importReactRE.test(code)

    if (isProduction) {
      if (hasReactImport) return

      if (needHiresSourcemap) {
        const s = new MagicString(code)

        s.prepend(prependReactImport)

        return {
          code: s.toString(),
          map: s.generateMap({ hires: true, source: id }),
        }
      } else {
        return { code: prependReactImport + code }
      }
    }

    const isTS = /\.(ts|tsx)$/.test(id)

    const result = await transform(code, {
      filename: id,
      swcrc: false,
      configFile: false,
      jsc: {
        target: 'es2021',
        parser: {
          syntax: isTS ? 'typescript' : 'ecmascript',
          [isTS ? 'tsx' : 'jsx']: true,
        },
        transform: {
          react: {
            refresh: true,
            development: true,
            useBuiltins: true,
            runtime: 'classic',
          },
          optimizer: { globals: { vars: define } },
        },
      },
      sourceMaps: true,
    })

    if (!hasReactImport) {
      result.code = `${prependReactImport}${result.code}`
    }

    if (!result.code.includes('$RefreshReg$')) return result

    const header = `import * as RefreshRuntime from "${runtimePublicPath}"; let prevRefreshReg; let prevRefreshSig; if (!window.$RefreshReg$) throw new Error("React refresh preamble was not loaded. Something is wrong."); prevRefreshReg = window.$RefreshReg$; prevRefreshSig = window.$RefreshSig$; window.$RefreshReg$ = RefreshRuntime.getRefreshReg("${id}"); window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;`

    const footer = `
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;
import.meta.hot.accept();
RefreshRuntime.enqueueUpdate();`

    return { code: `${header}${result.code}${footer}`, map: result.map }
  },
})
