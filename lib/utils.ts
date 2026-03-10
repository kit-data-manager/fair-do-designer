import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import * as Blockly from "blockly"
import { PathSegment } from "@/lib/data-source-picker/json-path"
import { InputJsonPointer } from "@/lib/blocks/input"
import React from "react"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function camelToTitleCase(camelCase: string): string {
    // Insert a space before each capital letter that follows a lowercase letter
    let spacedString = camelCase.replace(/([a-z])([A-Z])/g, "$1 $2")

    // Insert a space before each capital letter that follows a capital letter only if the next character is lowercase
    spacedString = spacedString.replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")

    // Capitalize the first letter of the entire string
    let titleCaseString =
        spacedString.charAt(0).toUpperCase() + spacedString.slice(1)

    // Ensure that sequences of uppercase letters remain uppercase
    titleCaseString = titleCaseString.replace(/ ([A-Z])([A-Z]+)/g, (match) => {
        return match.toUpperCase()
    })

    return titleCaseString
}

export function applyFillAttrAsStyle(abstract: Blockly.Events.Abstract) {
    if (abstract.type === "move" || abstract.type === "create") {
        const targets = document.querySelectorAll<SVGPathElement>(
            ".blocklyDisabledPattern > path.blocklyPath",
        )
        for (const target of targets) {
            if (!target.style.fill) {
                const fill = target.getAttribute("fill")
                if (fill) {
                    target.style.fill = fill
                }
            }
        }
    }
}

export function isValidUrl(url: string) {
    try {
        new URL(url)
        return true
    } catch {
        return false
    }
}

export function addQueryBlockToWorkspace(
    workspace: Blockly.WorkspaceSvg,
    query: PathSegment[],
    label: string,
    srcEvent?: React.DragEvent,
) {
    Blockly.Events.setGroup(true)

    try {
        const block = workspace.newBlock("input_json_pointer")

        if ("updateQuery" in block && typeof block.updateQuery === "function") {
            ;(block as InputJsonPointer).updateQuery(query, label)
        }

        block.initSvg()
        const offset = workspace.getOriginOffsetInPixels()
        if (srcEvent) {
            block.moveTo(
                new Blockly.utils.Coordinate(
                    srcEvent.nativeEvent.offsetX - offset.x,
                    srcEvent.nativeEvent.offsetY - offset.y,
                ),
            )
        } else {
            const offset = workspace.getOriginOffsetInPixels()
            block.moveTo(
                new Blockly.utils.Coordinate(
                    (workspace.getInjectionDiv().offsetWidth * 2) / 3 -
                        offset.x,
                    workspace.getInjectionDiv().offsetHeight / 3 - offset.y,
                ),
            )
        }

        block.render()
    } finally {
        Blockly.Events.setGroup(false)
    }
}
