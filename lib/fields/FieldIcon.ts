import { FieldImage } from "blockly"

export interface FieldIconOptions {
    tooltip?: string
    classList?: string[]
}

export class FieldIcon extends FieldImage {
    opts: FieldIconOptions

    constructor(icon: string, callback: () => void, opts?: FieldIconOptions) {
        super(icon, 16, 16, opts?.tooltip, callback)
        this.opts = opts ?? {}
    }

    initView() {
        super.initView()

        this.imageElement?.classList.add("base-icon")
        if (this.opts.classList) {
            this.imageElement?.classList.add(...this.opts.classList)
        }
    }
}
