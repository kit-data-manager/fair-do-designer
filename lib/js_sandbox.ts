import {
    newQuickJSAsyncWASMModule,
    QuickJSAsyncWASMModule,
} from "quickjs-emscripten"

/**
 * Runtime for executing generated code in a sandboxed environment using
 * QuickJS.
 * Loads and reuses a WASM module of QuickJS, but uses a fresh QuickJS context
 * for each execution to ensure isolation.
 */
export class JsSandboxRuntime {
    private quickjs: QuickJSAsyncWASMModule | null

    constructor() {
        this.quickjs = null
    }

    /**
     * Initializes the QuickJS runtime by loading the WASM module.
     * Must be called before any calls to run().
     * @returns this
     */
    async init(): Promise<JsSandboxRuntime> {
        this.quickjs = await newQuickJSAsyncWASMModule()
        console.log("QuickJS runtime initialized")
        return this
    }

    /**
     * Runs code. Will call to init() internally if not done already.
     * @param code The code to run.
     * @returns The result of the code execution.
     */
    async run(code: string): Promise<{ value?: any; error?: any }> {
        if (!this.quickjs) {
            const error_message = "Failed to initialize QuickJS runtime"
            try {
                let result = await this.init()
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
        console.log("Running code in sandbox:", code)

        try {
            const result = context
                .evalCodeAsync(code)
                .then((result) => {
                    console.log("Code execution result: ", result)
                    let info: any = {}
                    if (result.error) {
                        const error = context.dump(result.error)
                        console.log("Execution failed:", error)
                        info = { error: error }
                        result.error.dispose()
                    } else {
                        const value = context.dump(result.value)
                        console.log("Execution succeeded:", value)
                        info = { value: value }
                        result.value.dispose()
                    }
                    context.dispose()
                    return info
                })
                .catch((error) => {
                    console.error("Error during code execution:", error)
                    return { error: error.toString() }
                })
            return result
        } catch (error) {
            console.error("Unexpected error during code execution:", error)
            return { error: error }
        }
    }
}
