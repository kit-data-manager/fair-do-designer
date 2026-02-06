import { useMemo } from "react"
import { JavascriptMappingGenerator as JsGen } from "@/lib/generators/javascript"
import { PythonMappingGenerator as PythonGen } from "@/lib/generators/python"
import { useStore } from "zustand/react"
import { workspaceStore } from "@/lib/stores/workspace"
import { PythonCodeDownload } from "@/lib/python_code_download"
import { JavascriptCodeDownload } from "@/lib/javascript_code_download"

export function useCodeGenerator() {
    const codeGenerator = useStore(workspaceStore, (s) => s.codeGenerator)

    return useMemo(() => {
        if (codeGenerator === "javascript")
            return new JsGen("PidRecordMappingJavascript")
        if (codeGenerator === "python")
            return new PythonGen("PidRecordMappingPython")
        else throw new Error(`Invalid code generator: ${codeGenerator}`)
    }, [codeGenerator])
}

export function useCodeDownloader() {
    const codeGenerator = useStore(workspaceStore, (s) => s.codeGenerator)

    return useMemo(() => {
        if (codeGenerator === "python") return new PythonCodeDownload()
        if (codeGenerator === "javascript") return new JavascriptCodeDownload()
        else throw new Error(`Invalid code generator: ${codeGenerator}`)
    }, [codeGenerator])
}
