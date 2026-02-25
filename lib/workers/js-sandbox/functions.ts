import { JsSandboxRuntime } from "./js_sandbox"

const sandbox = new JsSandboxRuntime()

async function executeCode(code: string) {
    // @ts-ignore
    globalThis.document = {
        getElementsByTagName() {
            console.trace("document.getElementsByTagName called")
            return []
        },
    }
    return await sandbox.run(code)
}

export const jsSandboxFunctions = {
    executeCode,
}
