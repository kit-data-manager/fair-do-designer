import * as Blockly from "blockly"
import { WorkspaceSvg } from "blockly"

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

    const display = query.split(".")[query.split(".").length - 1]
    block.setFieldValue(display, "QUERY")
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
