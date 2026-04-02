import { JsSandboxRuntime } from "./js_sandbox"

const sandbox = new JsSandboxRuntime()

async function executeCode(code: string) {
    return await sandbox.run(code)
}

export const jsSandboxFunctions = {
    executeCode,
}
