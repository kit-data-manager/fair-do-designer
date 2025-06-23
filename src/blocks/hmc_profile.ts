import * as Blockly from "blockly"
import { ValidationField } from "../fields/ValidationField"
import * as HMCProfile from "./profiles/HMC.json"
import { WorkspaceSvg } from "blockly"
import { FieldButton } from "../fields/FieldButton"

export interface HMCBlock extends Blockly.BlockSvg {
    profile: typeof HMCProfile
    activeOptionalProperties: string[]
    profileAttributeKey: string
    // block methods
    addFieldForProperty(propertyName: string): void
    removeFieldForProperty(propertyName: string): void
    addListBlockToEmptyInput(input: Blockly.Input): void
    // data methods
    extractPidFromProperty(propertyName: string): string | undefined
    // event handlers
    onBlockCreate(event: Blockly.Events.BlockCreate): void
    onBlockMove(event: Blockly.Events.BlockMove): void
    onBlockChange(event: Blockly.Events.BlockChange): void
}

/* @ts-ignore */
export const profile_hmc: HMCBlock = {
    profile: HMCProfile,
    activeOptionalProperties: [],
    profileAttributeKey: "",

    init: function init() {
        this.profileAttributeKey = extractProfileAttributeKey(this)
        this.addIcon(
            new Blockly.icons.MutatorIcon(["lists_create_with_item"], this),
        )

        this.appendDummyInput("0").appendField(
            `Profile "Helmholtz KIP" with Validation`,
        )

        for (const property of this.profile.properties) {
            const details = property.representationsAndSemantics[0]
            if (details.obligation !== "Mandatory") continue // Skip optional properties by default
            this.addFieldForProperty(property.name)
        }

        this.appendDummyInput("DUMMY-DROPDOWN")
            .appendField(
                new Blockly.FieldDropdown([
                    ["-- Add Property --", "ADD"] as [string, string],
                    ...this.profile.properties
                        .filter(
                            (property) =>
                                property.representationsAndSemantics[0]
                                    .obligation === "Optional",
                        )
                        .map(
                            (property) =>
                                [property.name, property.name] as [
                                    string,
                                    string,
                                ],
                        ),
                ]),
                "DROPDOWN",
            )
            .setAlign(0)

        this.setInputsInline(false)
        this.setTooltip("Tooltip")
        this.setPreviousStatement(true, null)
        this.setNextStatement(true, null)
        this.setHelpUrl("")
        this.setColour(230)
    },

    extractPidFromProperty(propertyName: string): string | undefined {
        return this.profile.properties.find((p) => p.name === propertyName)
            ?.identifier
    },

    addFieldForProperty(propertyName) {
        const property = this.profile.properties.find(
            (p) => p.name === propertyName,
        )
        if (!property) return

        const details = property.representationsAndSemantics[0]
        const isRepeatable = details.repeatable == "Yes"

        const input = this.appendValueInput(property.name)
            .appendField(property.name)
            .appendField(
                new ValidationField({
                    mandatory: details.obligation == "Mandatory",
                    repeatable: isRepeatable,
                }),
                `val-${property.name}`,
            )
            .setCheck(isRepeatable ? ["Array", "JSON"] : ["JSON"])
            .setAlign(1)

        if (details.obligation === "Optional") {
            input.appendField(
                new FieldButton("X", () =>
                    this.removeFieldForProperty(propertyName),
                ),
            )
        }
    },

    removeFieldForProperty(propertyName: string) {
        console.log(propertyName)
        this.activeOptionalProperties = this.activeOptionalProperties.filter(
            (e) => e !== propertyName,
        )
        this.removeInput(propertyName)
    },

    addListBlockToEmptyInput(input: Blockly.Input) {
        const property = this.profile.properties.find(
            (p) => p.name === input.name,
        )
        if (!property) return

        const details = property.representationsAndSemantics[0]
        const isRepeatable: boolean = details.repeatable == "Yes"
        const hasConnection: boolean = input.connection != null
        const isConnected: boolean =
            hasConnection && input.connection?.targetConnection != null
        if (isRepeatable && !isConnected) {
            // Spawn a new list block and connect it to input
            const listBlock = this.workspace.newBlock("lists_create_with")
            listBlock.initSvg()
            listBlock.render()

            // Connect the list block to the input
            const connection = input.connection
            if (connection && listBlock.outputConnection) {
                connection.connect(listBlock.outputConnection)
            }
        }
    },

    onBlockCreate(event: Blockly.Events.BlockCreate) {
        if (event.blockId === this.id) {
            for (const input of this.inputList) {
                this.addListBlockToEmptyInput(input)
            }
        }
    },

    onBlockMove(event: Blockly.Events.BlockMove) {
        if (
            event.newParentId === this.id &&
            event.reason?.includes("connect")
        ) {
            setTimeout(() => {
                if (!event.newInputName) return
                const field = this.getField("val-" + event.newInputName)
                if (field instanceof ValidationField) {
                    field.forceCheck()
                }
            }, 100)
        }

        if (
            event.oldParentId === this.id &&
            event.reason?.includes("disconnect")
        ) {
            setTimeout(() => {
                if (!event.oldInputName) return
                const field = this.getField("val-" + event.oldInputName)
                if (field instanceof ValidationField) {
                    field.forceCheck()
                }
            }, 100)
        }
    },

    onBlockChange(event: Blockly.Events.BlockChange) {
        if (
            event.blockId === this.id &&
            event.name === "DROPDOWN" &&
            typeof event.newValue === "string" &&
            event.newValue !== "ADD"
        ) {
            // reset dropdown menu
            this.setFieldValue("ADD", "DROPDOWN")
            // add property if not already present
            if (!this.activeOptionalProperties.includes(event.newValue)) {
                this.addFieldForProperty(event.newValue)
                this.activeOptionalProperties.push(event.newValue)
                const input = this.getInput(event.newValue)
                if (input) {
                    this.addListBlockToEmptyInput(input)
                }
            }
        }
    },

    onchange: function onchange(abstract) {
        if (abstract instanceof Blockly.Events.BlockCreate) {
            this.onBlockCreate(abstract)
        }
        if (abstract instanceof Blockly.Events.BlockMove) {
            this.onBlockMove(abstract)
        }
        if (abstract instanceof Blockly.Events.BlockChange) {
            this.onBlockChange(abstract)
        }
    },

    saveExtraState() {
        return JSON.stringify({
            activeOptionalProperties: this.activeOptionalProperties,
        })
    },

    loadExtraState(data) {
        const parsed = JSON.parse(data)
        if (
            typeof parsed === "object" &&
            "activeOptionalProperties" in parsed &&
            Array.isArray(parsed.activeOptionalProperties)
        ) {
            this.activeOptionalProperties = parsed.activeOptionalProperties

            for (const opt of this.activeOptionalProperties) {
                this.addFieldForProperty(opt)
            }
        }
    },

    decompose(workspace) {
        const workspaceSvg = workspace as WorkspaceSvg
        // This is a special sub-block that only gets created in the mutator UI.
        // It acts as our "top block"
        const topBlock = workspaceSvg.newBlock("lists_create_with_container")
        topBlock.initSvg()

        // Then we add one sub-block for each item in the list.
        let connection = topBlock.getInput("STACK")?.connection
        for (const property of this.profile.properties.filter(
            (p) => p.representationsAndSemantics[0].obligation === "Optional",
        )) {
            const itemBlock = workspaceSvg.newBlock("lists_create_with_item")
            const fields = [...itemBlock.getFields()]
            fields.forEach((f) => f.setValue(property.name))
            itemBlock.initSvg()
            if (connection) {
                connection.connect(itemBlock.previousConnection)
                connection = itemBlock.nextConnection
            }
        }

        // And finally we have to return the top-block.
        return topBlock
    },

    compose(topBlock) {},
}

function extractProfileAttributeKey(block: HMCBlock): string {
    const attributeKey = block.profile.properties
        .filter((p) => p.name.toLowerCase().includes("profile"))
        .map((p) => p.name)
        .at(0)
    if (!attributeKey) {
        throw new Error("No profile property found for HmcBlock")
    }
    return attributeKey
}
