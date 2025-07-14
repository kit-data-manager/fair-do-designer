import * as Blockly from "blockly"
import { WorkspaceSvg } from "blockly"
import { KeyClickEvent } from "json-picker-stencil"

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
            blocklyDiv.offsetWidth * 2 / 3 - offset.x,
            blocklyDiv.offsetHeight / 3 - offset.y,
        ),
    )
    block.render()
})
