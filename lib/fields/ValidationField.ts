import { Block, FieldImage } from "blockly"
import { CheckIcon, CircleDashedIcon, TriangleAlertIcon } from "@/lib/icons"

export interface ValidationFieldOptions {
    mandatory?: boolean
    repeatable?: boolean
}

export class ValidationField extends FieldImage {
    options: ValidationFieldOptions

    constructor(opts: ValidationFieldOptions) {
        super(CircleDashedIcon, 16, 16)

        this.options = opts
    }

    initView() {
        super.initView()

        this.imageElement?.classList.add("base-icon")

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

    private checkForArrayBlocks(): boolean {
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
            // Rule 2: At least one block must be attached
            // (Note: This allows empty slots, they should just be ignored in code generation)
            const listBlocks =  block.inputList
                .map((input) => input.connection?.targetBlock() ?? undefined).filter(b => b !== undefined).filter(b => !b.isInsertionMarker())
            return listBlocks
                .every((targetBlock) => checkBlock(targetBlock)) &&  listBlocks.length > 0
        }

        return checkBlock(connectedBlock)
    }

    setValidationResult(success: boolean | undefined) {
        if (success === undefined) {
            this.setValue(CircleDashedIcon)
            this.setTooltip("Validation status is unknown")
        } else if (success) {
            this.imageElement?.classList.add("green-icon")
            this.imageElement?.classList.remove("yellow-icon")
            this.setValue(CheckIcon)
            this.setTooltip("Validation successful")
        } else if (!success) {
            this.imageElement?.classList.remove("green-icon")
            this.imageElement?.classList.add("yellow-icon")
            this.setValue(TriangleAlertIcon)
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

export class StaticValidationField extends ValidationField {
    protected status: boolean | undefined = undefined

    constructor(status: boolean | undefined) {
        super({})
        this.status = status
    }
    
    initView(): void {
        super.initView()
        this.setValidationResult(this.status)
    }

    forceCheck(): void {
        this.setValidationResult(this.status)
    }
}