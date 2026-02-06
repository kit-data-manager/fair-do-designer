import { strToU8, zip } from "fflate"

export class JavascriptCodeDownload {
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
}
