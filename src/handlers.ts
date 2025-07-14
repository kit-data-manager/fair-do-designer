import * as Blockly from "blockly"
import { WorkspaceSvg } from "blockly"
import { KeyClickEvent } from "json-picker-stencil"

import * as m1 from "./demo/json/metadata.json"
import * as m2 from "./demo/json/metadata(1).json"
import * as m3 from "./demo/json/metadata(2).json"
import * as m4 from "./demo/json/metadata(3).json"
import * as m5 from "./demo/json/metadata(4).json"

const blocklyDiv = document.querySelector(
    "div#blocklyDiv",
) as HTMLDivElement | null

if (!blocklyDiv) {
    throw "handlers: missing blocklyDiv"
}

blocklyDiv.addEventListener("drop", (event: DragEvent) => {
    // # input_jsonpath
    const workspace = Blockly.getMainWorkspace() as WorkspaceSvg
    const block = workspace.newBlock("input_jsonpath")
    const query = event.dataTransfer?.getData("text/plain")

    if (!query) {
        console.error(
            "Received drop event that did not include a valid text/plain data point",
        )
        return
    }

    if ("updateQuery" in block && typeof block.updateQuery === "function") {
        block.updateQuery(query)
    }

    block.initSvg()
    const offset = workspace.getOriginOffsetInPixels()
    block.moveTo(
        new Blockly.utils.Coordinate(
            event.offsetX - offset.x,
            event.offsetY - offset.y,
        ),
    )
    block.render()
})

blocklyDiv.addEventListener("dragover", (event: DragEvent) => {
    event.preventDefault()
})

const jsonPicker = document.querySelector("unified-document")

if (!jsonPicker) {
    throw "handlers: missing unified-document"
}

jsonPicker.addEventListener("keyClick", (e: Event) => {
    const workspace = Blockly.getMainWorkspace() as WorkspaceSvg
    const block = workspace.newBlock("input_jsonpath")
    const query = (e as CustomEvent<KeyClickEvent>).detail.path

    if ("updateQuery" in block && typeof block.updateQuery === "function") {
        block.updateQuery(query)
    }

    block.initSvg()
    const offset = workspace.getOriginOffsetInPixels()
    block.moveTo(
        new Blockly.utils.Coordinate(
            (blocklyDiv.offsetWidth * 2) / 3 - offset.x,
            blocklyDiv.offsetHeight / 3 - offset.y,
        ),
    )
    block.render()
})

const jsonUploadButton = document.querySelector(
    ".jsonUploadButton",
) as HTMLButtonElement
const jsonResetButton = document.querySelector(
    ".jsonResetButton",
) as HTMLButtonElement
const jsonUseExamplesButton = document.querySelector(
    ".jsonUseExamplesButton",
) as HTMLButtonElement
const jsonFileInput = document.querySelector(
    ".jsonFileInput",
) as HTMLInputElement

if (!jsonUploadButton || !jsonResetButton || !jsonFileInput) {
    throw "handlers: missing json toolbar"
}

jsonUploadButton.addEventListener("click", () => {
    jsonFileInput.click()
})

jsonResetButton.addEventListener("click", async () => {
    await jsonPicker.resetFiles()
    jsonResetButton.classList.add("hidden")
    jsonUseExamplesButton.classList.remove("hidden")
})

jsonUseExamplesButton.addEventListener("click", async () => {
    const files = [m1, m2, m3, m4, m5]
    await jsonPicker.addFiles(
        files.map(
            (f) =>
                new Blob([JSON.stringify(f)], {
                    type: "application/json",
                }),
        ),
    )
    jsonResetButton.classList.remove("hidden")
    jsonUseExamplesButton.classList.add("hidden")
})

jsonFileInput.addEventListener("change", async () => {
    if (jsonFileInput.files && jsonFileInput.files.length > 0) {
        jsonFileInput.disabled = true
        jsonUploadButton.disabled = true
        await jsonPicker.addFiles([...jsonFileInput.files])

        jsonResetButton.classList.remove("hidden")
        jsonUseExamplesButton.classList.add("hidden")
        jsonFileInput.disabled = false
        jsonUploadButton.disabled = false
    }
})
