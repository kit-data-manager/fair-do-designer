import { FieldLabel, Block } from "blockly"

export class FieldButton extends FieldLabel {
    callback: (block: any) => void

    constructor(label: string, callback: (block: Block) => void) {
        super(label)
        this.callback = callback
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
        }
    }

    dispose() {
        super.dispose()
    }
}
