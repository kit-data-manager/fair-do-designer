import * as Blockly from "blockly"

export const DarkTheme = Blockly.Theme.defineTheme("docs-dark", {
    base: Blockly.Themes.Classic,
    name: "docs-dark",
    componentStyles: {
        workspaceBackgroundColour: "#000000",
    },
})
