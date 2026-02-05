import { useStore } from "zustand/react"
import { Alert, alertStore } from "@/lib/stores/alert-store"
import { useCallback, useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

/**
 * Manages and displays alert dialogs based on the alert store.
 * This function handles the lifecycle of alerts, including opening, closing,
 * accepting, and managing dialog-specific inputs like prompts.
 *
 * Can just be placed into the page at a high level. This component manages everything
 * on its own and will render nothing if there is no dialog to show.
 */
export function AlertManager() {
    const alerts = useStore(alertStore, (s) => s.alerts)
    const alert = alerts.length > 0 ? alerts[0] : undefined
    const [activeAlert, setActiveAlert] = useState<Alert | undefined>(
        alert ?? undefined,
    )

    const pop = useStore(alertStore, (s) => s.pop)

    const [alertOpen, setAlertOpen] = useState(alert !== undefined)
    const [promptResponse, setPromptResponse] = useState("")

    // Detect if a new alert is in the alerts store that should be rendered now
    // Done by comparing the activeAlert (which is or was displayed) to the current should-be-displayed alert
    if (alert && (alert.id !== activeAlert?.id || (alert && !activeAlert))) {
        setActiveAlert(alert)
        setAlertOpen(true)
        if (alert.promptPrefill) {
            setPromptResponse(alert.promptPrefill)
        } else {
            setPromptResponse("")
        }
    }

    // On cancel or by clicking outside the dialog, close the dialog
    const onOpenChange = useCallback(
        (open: boolean) => {
            setAlertOpen(open)

            if (!open && activeAlert) {
                if (activeAlert.closeButtonCallback) {
                    activeAlert.closeButtonCallback()
                }
            }

            if (!open) {
                setTimeout(() => {
                    pop()
                }, 150)
            }
        },
        [activeAlert, pop],
    )

    const onAcceptButton = useCallback(() => {
        setAlertOpen(false)

        if (activeAlert) {
            if (activeAlert.acceptButtonCallback) {
                activeAlert.acceptButtonCallback(promptResponse)
            }
        }

        setTimeout(() => {
            pop()
        }, 150)
    }, [activeAlert, pop, promptResponse])

    return (
        <Dialog open={alertOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{activeAlert?.title}</DialogTitle>

                    {activeAlert?.message}

                    {activeAlert?.hasPrompt && (
                        <Input
                            autoFocus
                            autoCorrect={"off"}
                            value={promptResponse}
                            onChange={(e) => setPromptResponse(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === "Enter" && onAcceptButton()
                            }
                        />
                    )}

                    <DialogFooter>
                        {activeAlert?.closeButtonText ||
                        activeAlert?.closeButtonCallback ? (
                            <Button
                                variant="secondary"
                                onClick={() => onOpenChange(false)}
                            >
                                {activeAlert.closeButtonText ?? "Close"}
                            </Button>
                        ) : null}
                        {activeAlert?.acceptButtonText ||
                        activeAlert?.acceptButtonCallback ? (
                            <Button onClick={onAcceptButton}>
                                {activeAlert.acceptButtonText ?? "OK"}
                            </Button>
                        ) : null}
                    </DialogFooter>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}
