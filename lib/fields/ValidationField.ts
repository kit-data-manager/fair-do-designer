import { Block, FieldLabel } from "blockly"

export interface ValidationFieldOptions {
    mandatory?: boolean
    repeatable?: boolean
}

export class ValidationField extends FieldLabel {
    options: ValidationFieldOptions

    constructor(opts: ValidationFieldOptions) {
        super("❔")

        this.options = opts
    }

    initView() {
        super.initView()

        this.setValidationResult(undefined)
    }

    protected render_() {
        super.render_()
    }

    forceCheck() {
        const connection = this.getParentInput().connection
        const connected =
            connection?.isConnected() && this.checkForArrayBlocks()
        this.setValidationResult(
            connected && !connection?.targetBlock()?.isInsertionMarker(),
        )
    }

    checkForArrayBlocks(): boolean {
        // If a list is attached, check if it has all inputs attached.
        // The List may have nested lists, so we need to check recursively.
        const connectedBlock = this.getParentInput().connection?.targetBlock()
        if (!connectedBlock || !connectedBlock.type.startsWith("lists_"))
            return true

        const checkBlock = (block?: Block): boolean => {
            if (!block) return false
            if (
                !block.type.startsWith("lists_") &&
                !block.isInsertionMarker()
            ) {
                return true // Non-list block found, array is non-empty
            }

            // For list blocks, check all inputs recursively using functional approach
            return block.inputList
                .map((input) => input.connection?.targetBlock() ?? undefined)
                .every((targetBlock) => checkBlock(targetBlock))
        }

        return checkBlock(connectedBlock)
    }

    setValidationResult(success: boolean | undefined) {
        const validationResult =
            success === undefined ? "❔" : success ? "✅" : "⚠️"
        this.setValue(validationResult)

        if (success === undefined) {
            this.setTooltip("Validation status is unknown")
        } else if (success) {
            this.setTooltip("Validation successful")
        } else if (!success) {
            this.setTooltip(
                "Validation failed. Make sure a valid block is attached." +
                    (this.options.mandatory
                        ? " This property is mandatory and must be provided."
                        : " This property is optional, so it can be deleted."),
            )
        }
    }

    dispose() {
        super.dispose()
    }
}
