import { FieldLabel, Block } from "blockly"

export class FieldButton extends FieldLabel {
    callback: (block: Block) => void

    constructor(label: string, callback: (block: Block) => void, opts?: {tooltip?: string}) {
        super(label)
        this.callback = callback

        if (opts) {
            if (opts.tooltip) {
                this.setTooltip(opts.tooltip)
            }
        }
    }

    initView() {
        super.initView()
    }

    protected render_() {
        super.render_()

        if (this.textElement_) {
            this.textElement_.onclick = () => {
                this.callback(this.getParentInput().getSourceBlock())
            }
            this.textElement_.style.cursor = "pointer"
        }
    }

    /**
     * Check whether this field should be clickable.
     *
     * @returns Whether this field is clickable.
     */
    isClickable(): boolean {
        return true
    }

    /**
     * If field click is called, and click handler defined,
     * call the handler.
     *
     * This is copied from FieldImage source code and makes sure click works when the block is not focused
     */
    protected override showEditor_() {
        this.callback(this.getParentInput().getSourceBlock())
    }

    dispose() {
        super.dispose()
    }
}
