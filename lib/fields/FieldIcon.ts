import { FieldImage } from "blockly"

export class FieldIcon extends FieldImage {
    constructor(
        icon: string,
        callback: () => void,
        opts?: { tooltip?: string },
    ) {
        super(icon, 16, 16, opts?.tooltip, callback)
    }

    initView() {
        super.initView()

        this.imageElement?.classList.add("base-icon")
    }
}
