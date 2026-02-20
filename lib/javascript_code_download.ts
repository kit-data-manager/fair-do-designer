import { strToU8, zip } from "fflate"

export class JavascriptCodeDownload {
    private staticFileCache: Record<string, string> = {}

    async downloadCodeZip(generatedCode: string) {
        return new Promise<void>((resolve, reject) => {
            zip(
                {
                    "generated.js": strToU8(generatedCode),
                },
                (err, data) => {
                    if (err) {
                        return reject(err)
                    }

                    const blob = new Blob([data.slice()], {
                        type: "application/zip",
                    })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement("a")
                    a.href = url
                    a.download = "fairdo_generator_javascript.zip"
                    a.click()
                    resolve()
                },
            )
        })
    }

    async fetchBoilerplate(): Promise<{ boilerplate: Array<string> }> {
        const filesToFetch = ["executor.js", "error_handling.js"]
        const promises = filesToFetch.map((name) =>
            name in this.staticFileCache
                ? Promise.resolve(this.staticFileCache[name])
                : fetch(
                      (process.env.NEXT_PUBLIC_BASE_PATH ?? "") + "/js/" + name,
                  ).then((res) => res.text()),
        )
        return Promise.all(promises).then((texts) => ({ boilerplate: texts }))
    }
}
