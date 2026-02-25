import { newQuickJSWASMModule, QuickJSWASMModule } from "quickjs-emscripten"

/**
 * Runtime for executing generated code in a sandboxed environment using
 * QuickJS.
 * Loads and reuses a WASM module of QuickJS, but uses a fresh QuickJS context
 * for each execution to ensure isolation.
 */
export class JsSandboxRuntime {
    private quickjs: QuickJSWASMModule | null

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
        console.log("Running code in sandbox:", code)

        try {
            const result = context.evalCode(code)

            console.log("Code execution result: ", result)

            if (result.error) {
                const error = context.dump(result.error)
                console.log("Execution failed:", error)
                result.error.dispose()
                return { error: error, value: undefined }
            } else {
                const value = context.dump(result.value)
                console.log("Success:", value)
                result.value.dispose()
                return { value: value }
            }
        } catch (error) {
            console.error("Unexpected error during code execution:", error)
            return { error: error, value: undefined }
        }
    }
}
