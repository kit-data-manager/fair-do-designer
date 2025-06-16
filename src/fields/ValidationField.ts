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
        const connected = connection?.isConnected()
        this.setValidationResult(
            connected && !connection?.targetBlock()?.isInsertionMarker(),
        )
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
