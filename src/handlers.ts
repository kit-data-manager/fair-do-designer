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
    block.setFieldValue(
        event.dataTransfer?.getData("text/plain") ?? "undefined",
        "QUERY",
    )
    block.initSvg()
    const offset = workspace.getOriginOffsetInPixels()
    block.moveTo(
        new Blockly.utils.Coordinate(
            event.offsetX - offset.x,
            event.offsetY - offset.y,
        ),
    )
    block.render()

    // # input_read_key
    const path = event.dataTransfer?.getData("text/plain") ?? "null"
    const keys = path
        .replaceAll(/\[(\d+)]/g, ".__array_index_$1")
        .split(/[.\[\]]/gm)
        .filter((s) => s.length > 0)
    const blocks: Blockly.BlockSvg[] = []

    for (const key of keys) {
        if (keys.indexOf(key) == 0) {
            const block = workspace.newBlock("input_source")
            block.setFieldValue("JSON", "SOURCE")

            block.initSvg()
            block.render()
            blocks.push(block)
        } else {
            const block = workspace.newBlock(
                key.startsWith("__array_index")
                    ? "input_read_index"
                    : "input_read_key",
            )
            block.setFieldValue(
                key.startsWith("__array_index") ? key.split("_")[4] : key,
                "KEY",
            )
            const input = block.getInput("INPUT")
            if (input?.connection) {
                const previous = blocks.slice().pop()
                if (previous) {
                    input.connection.connect(previous.outputConnection)
                }
            }

            block.initSvg()
            block.render()
            blocks.push(block)
        }
    }

    const last = blocks.slice().pop()
    if (last) {
        const offset = workspace.getOriginOffsetInPixels()
        last.moveTo(
            new Blockly.utils.Coordinate(
                event.offsetX - offset.x,
                event.offsetY + 30 - offset.y,
            ),
        )
    }
})

blocklyDiv.addEventListener("dragover", (event: DragEvent) => {
    event.preventDefault()
})
