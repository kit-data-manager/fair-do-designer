import { FieldLabel } from "blockly"

export interface ValidationFieldOptions {
    mandatory?: boolean
    repeatable?: boolean
}

export class ValidationField extends FieldLabel {
    wrapper_: HTMLElement | null = null
    options: ValidationFieldOptions

    constructor(opts: ValidationFieldOptions) {
        super("❔")

        this.options = opts
    }

    initView() {
        super.initView()

        this.setValidationResult(undefined)
        this.wrapper_ = document.createElement("foreignObject")
    }

    protected render_() {
        super.render_()
        if (this.wrapper_) this.textElement_?.append(this.wrapper_)
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

        const checkBlock = (block: any): boolean => {
            if (!block) return false
            if (!block.type.startsWith("lists_")) {
                return true // Non-list block found, array is non-empty
            }

            // For list blocks, check all inputs recursively using functional approach
            return block.inputList
                .map((input: any) => input.connection?.targetBlock())
                .every((targetBlock: any) => checkBlock(targetBlock))
        }

        return checkBlock(connectedBlock)
    }

    setValidationResult(success: boolean | undefined) {
        const required = this.options.mandatory ? "❗️" : "❔"
        const repeatable = this.options.repeatable ? "🔢" : "1️⃣"
        const validationResult =
            success === undefined ? "❔" : success ? "✅" : "❌"
        this.setValue(required + repeatable + validationResult)
    }

    dispose() {
        if (this.wrapper_ && this.wrapper_.parentNode) {
            this.wrapper_.parentNode.removeChild(this.wrapper_)
        }
        super.dispose()
    }
}
