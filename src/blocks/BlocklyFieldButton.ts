import {Field, FieldImage, FieldLabel} from "blockly";

export class BlocklyFieldButton extends FieldLabel {
    callback: (block: any) => void
    wrapper_: HTMLElement | null = null;

    constructor(label: string, callback: (block: any) => void) {
        super(label);
        this.callback = callback;
    }

    showEditor_() {
        // Not used in this context.
    }

    initView() {
        super.initView();

        const wrapper = document.createElement("foreignObject")
        const button = document.createElement("button");
        button.textContent = this.getValue();
        button.style.padding = "2px 6px";
        button.style.cursor = "pointer";
        button.style.width = "10px";
        button.style.height = "10px";

        button.onclick = () => {
            if (typeof this.callback === "function") {
                this.callback(this.sourceBlock_);
            }
        };

        wrapper.append(button)
        this.wrapper_ = wrapper
    }

    protected render_() {
        super.render_();
        console.log(this.textElement_)
        if (this.wrapper_)
            this.textElement_?.append(this.wrapper_)

        if (this.textElement_) {
            this.textElement_.onclick = () => {
                const reply = prompt("Enter a value");
                this.getSourceBlock()?.getField("QUERY")?.setValue(reply, true);
            }
        }

    }

    dispose() {
        if (this.wrapper_ && this.wrapper_.parentNode) {
            this.wrapper_.parentNode.removeChild(this.wrapper_);
        }
        super.dispose();
    }
}
