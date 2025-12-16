import { create } from "zustand"
import { ReactNode } from "react"

export interface Alert {
    title: string
    message: string | ReactNode
    type: "error" | "success" | "info"
    id: string
    acceptButtonCallback?: (prompt?: string) => void
    acceptButtonText?: string
    closeButtonCallback?: () => void
    closeButtonText?: string
    hasPrompt?: boolean
}

export interface AlertStore {
    alerts: Alert[]
    pop: () => void
    addAlert: (alert: Omit<Alert, "id">) => void
    alert: (
        title: string,
        message: string | ReactNode,
        type?: Alert["type"],
    ) => void
    prompt: (
        title: string,
        message: string | ReactNode,
        type?: Alert["type"],
    ) => Promise<string | undefined>
}

export const alertStore = create<AlertStore>()((set, get) => ({
    alerts: [],
    pop() {
        const copy = get().alerts.slice()
        copy.shift()
        set({ alerts: copy })
    },
    addAlert(alert: Omit<Alert, "id">) {
        const copy = get().alerts.slice()
        copy.push({ id: Math.random().toString(), ...alert })
        set({ alerts: copy })
    },
    alert(title: string, message: string | ReactNode, type?: Alert["type"]) {
        get().addAlert({
            title,
            message,
            type: type ?? "info",
            acceptButtonText: "OK",
        })
    },
    prompt(title: string, message: string | ReactNode, type?: Alert["type"]) {
        return new Promise<string | undefined>((resolve) => {
            get().addAlert({
                title,
                message,
                type: type ?? "info",
                acceptButtonText: "OK",
                acceptButtonCallback: resolve,
                hasPrompt: true,
                closeButtonText: "Cancel",
                closeButtonCallback: () => resolve(undefined),
            })
        })
    },
}))
