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

export function AlertManager() {
    const alerts = useStore(alertStore, (s) => s.alerts)
    const alert = alerts.length > 0 ? alerts[0] : undefined
    const [activeAlert, setActiveAlert] = useState<Alert | undefined>(
        alert ?? undefined,
    )

    const pop = useStore(alertStore, (s) => s.pop)

    const [alertOpen, setAlertOpen] = useState(alert !== undefined)
    const [promptResponse, setPromptResponse] = useState("")

    if (alert && (alert.id !== activeAlert?.id || (alert && !activeAlert))) {
        setActiveAlert(alert)
        setAlertOpen(true)
        setPromptResponse("")
    }

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
