import { FieldLabel } from "blockly"

export class ValidationField extends FieldLabel {
    wrapper_: HTMLElement | null = null

    constructor() {
        super("?")
    }

    initView() {
        super.initView()

        this.wrapper_ = document.createElement("foreignObject")
    }

    protected render_() {
        super.render_()
        if (this.wrapper_) this.textElement_?.append(this.wrapper_)
    }

    forceCheck() {
        const connected = this.getParentInput().connection?.isConnected()
        this.setValidationResult(connected)
    }

    setValidationResult(success: boolean | undefined) {
        this.setValue(success === undefined ? "?" : success ? "Ja" : "Nein")
    }

    dispose() {
        if (this.wrapper_ && this.wrapper_.parentNode) {
            this.wrapper_.parentNode.removeChild(this.wrapper_)
        }
        super.dispose()
    }
}
