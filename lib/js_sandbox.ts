import { getQuickJS, newQuickJSAsyncWASMModule, newAsyncContext, QuickJSContext, QuickJSAsyncContext, shouldInterruptAfterDeadline, QuickJSAsyncWASMModule } from "quickjs-emscripten"

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
     * Runs code. Requires a successful call to init() in beforehand.
     * @param code The code to run.
     * @returns The result of the code execution.
     */
    async run(code: string): Promise<{ value?: any; error?: any }> {
        if (!this.quickjs) {
            throw new Error("QuickJS runtime not initialized")
        }
        // Take a fresh context for each run
        const context = this.quickjs.newContext()
        //const context = newAsyncContext();
        console.log("Running code in sandbox:", code)
        
        const result = context.evalCodeAsync(code).then((result) => {
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
            return info as { value?: any; error?: any }
        }).catch((error) => {
            console.error("Error during code execution:", error)
            return { error: error.toString() } as { error: any }
        })
        return result
    }
}
