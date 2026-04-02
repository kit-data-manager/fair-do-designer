import { JSModuleLoadResult, newQuickJSWASMModule, QuickJSWASMModule } from "quickjs-emscripten"

/**
 * Runtime for executing generated code in a sandboxed environment using
 * QuickJS.
 * Loads and reuses a WASM module of QuickJS, but uses a fresh QuickJS context
 * for each execution to ensure isolation.
 */
export class JsSandboxRuntime {
    private quickjs: QuickJSWASMModule | null
    private moduleCache: Map<string, string> = new Map()

    constructor() {
        this.quickjs = null
    }

    /**
     * Initializes the QuickJS runtime by loading the WASM module.
     * Must be called before any calls to run().
     * @returns this
     */
    async init(): Promise<JsSandboxRuntime> {
        this.quickjs = await newQuickJSWASMModule()
        await this.preloadModule("jsonpointer.js")
        await this.preloadModule("jsonpath.js")
        console.log("QuickJS runtime initialized")
        return this
    }

    /**
     * Runs code. Will call to init() internally if not done already.
     * @param code The code to run.
     * @returns The result of the code execution.
     */
    async run(code: string): Promise<{ error?: unknown; value?: unknown }> {
        if (!this.quickjs) {
            const error_message = "Failed to initialize QuickJS runtime"
            try {
                await this.init()
            } catch (error) {
                let with_error = error_message + ": " + error
                console.error(with_error)
                return { error: with_error }
            }
            // Satisfy type checker
            if (!this.quickjs) {
                return { error: error_message }
            }
        }

        // Take a fresh context for each run
        const context = this.quickjs.newContext()
        context.runtime.setModuleLoader((moduleName, context) => {
            console.log("Module loader called for:", moduleName)
            const code = this.getModule(moduleName)
            if (code) {
                console.log(`Module ${moduleName} loaded from cache`)
                return code
            } else {
                const error_message: string = `Module not found: ${moduleName}`
                console.error(error_message)
                const e = { error: error_message }
                return e as unknown as JSModuleLoadResult
            }
        })

        // Make console partially available inside the sandbox
        // `console.log`
        const logHandle = context.newFunction("log", (...args) => {
            const nativeArgs = args.map(context.dump)
            console.log("QuickJS:", ...nativeArgs)
        })
        // `console.error`
        const errorHandle = context.newFunction("error", (...args) => {
            const nativeArgs = args.map(context.dump)
            console.log("QuickJS error:", ...nativeArgs)
        })
        // Partially implement `console` object
        const consoleHandle = context.newObject()
        context.setProp(consoleHandle, "log", logHandle)
        context.setProp(consoleHandle, "error", errorHandle)
        context.setProp(context.global, "console", consoleHandle)
        consoleHandle.dispose()
        logHandle.dispose()
        errorHandle.dispose()

        console.log("Running code in sandbox:", code)

        try {
            const result = context.evalCode(
                code,
                "generated.js",
                {
                    // required because we import dependencies with import statements.
                    type: "module"
                },
            )
            
            if (result.error) {
                const error = context.dump(result.error)
                console.log("Execution failed:", error)
                result.error.dispose()
                return { error: error, value: undefined }
            } else {
                // extract value as in https://github.com/justjake/quickjs-emscripten?tab=readme-ov-file#runtime
                context.dump(context.unwrapResult(result))
                const extracted = context.getProp(context.global, "result").consume(context.dump)
                result.value.dispose()
                return { value: extracted }
            }
        } catch (error) {
            console.error("Unexpected error during code execution:", error)
            return { error: error, value: undefined }
        } finally {
            context.dispose()
        }
    }

    async preloadModule(moduleName: string): Promise<void> {
        // fetch modules into cache
        console.log("Preloading module:", moduleName)
        const basepath = process.env.BASE_PATH ?? ""
        const prefix = `${globalThis.location.origin}${basepath}`
        if (!this.moduleCache.has(moduleName)) {
            try {
                const response = await fetch(`${prefix}/js/${moduleName}`)
                if (!response.ok) {
                    throw new Error(`Failed to fetch module ${moduleName}: ${response.statusText}`)
                }
                const code = await response.text()
                this.moduleCache.set(moduleName, code)
                console.log(`Module ${moduleName} loaded and cached`)
            } catch (error) {
                console.error(`Error loading module ${moduleName}:`, error)
            }
        } else {
            console.log(`Module ${moduleName} already in cache`)
        }
    }

    getModule(moduleName: string): string | undefined {
        return this.moduleCache.get(moduleName)
    }
}
