import { Block, FieldLabel } from "blockly"

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

        const checkBlock = (block?: Block): boolean => {
            if (!block) return false
            if (
                !block.type.startsWith("lists_") &&
                !block.isInsertionMarker()
            ) {
                return true // Non-list block found, array is non-empty
            }

            // For list blocks, check all attached blocks recursively
            // Rule 1: All attached blocks must be valid
            // Rule 2: If this field is mandatory Then at least one block must be attached
            // (Note: This allows empty slots, they should just be ignored in code generation)
            const listBlocks =  block.inputList
                .map((input) => input.connection?.targetBlock() ?? undefined).filter(b => b !== undefined).filter(b => !b.isInsertionMarker())
            return listBlocks
                .every((targetBlock) => checkBlock(targetBlock)) &&  (this.options.mandatory ? listBlocks.length > 0 : true)
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
