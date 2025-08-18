import { strToU8, zip } from "fflate"

export class PythonCodeDownload {
    private staticFileCache: Record<string, string> = {}
    async downloadCodeZip(generatedCode: string) {
        const filesToFetch = ["main.py", "conditionals.py", "pyproject.toml"]
        const promises = filesToFetch.map((name) =>
            name in this.staticFileCache
                ? Promise.resolve(this.staticFileCache[name])
                : fetch("/python/" + name).then((res) => res.text()),
        )

        const fetchedFile = await Promise.all(promises)
        const zippable: Record<string, Uint8Array> = {}

        for (const [index, file] of fetchedFile.entries()) {
            zippable[filesToFetch[index]] = strToU8(file)
            this.staticFileCache[filesToFetch[index]] = file
        }

        return new Promise<void>((resolve, reject) => {
            zip(
                {
                    "generated.py": strToU8(generatedCode),
                    ...zippable,
                },
                (err, data) => {
                    if (err) {
                        return reject(err)
                    }

                    const blob = new Blob([data], { type: "application/zip" })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement("a")
                    a.href = url
                    a.download = "fairdo_generator.zip"
                    a.click()
                    resolve()
                },
            )
        })
    }
}
