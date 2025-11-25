"use client"

import { Suspense, useCallback, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { isValidUrl } from "@/lib/utils"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useLoadFromFile } from "@/lib/serialization"
import { Error } from "@/components/error"
import { ShieldAlert } from "lucide-react"

export function RemoteDesignImport() {
    return (
        <Suspense>
            <InnerRemoteDesignImport />
        </Suspense>
    )
}

function InnerRemoteDesignImport() {
    const params = useSearchParams()
    const [remoteDesignImportURL, setRemoteDesignImportURL] = useState<string>()
    const [showModal, setShowModal] = useState(false)
    const [isImportInProgress, setIsImportInProgress] = useState(false)
    const [importError, setImportError] = useState<unknown>()
    const router = useRouter()
    const pathname = usePathname()

    const loadFromFile = useLoadFromFile()

    const setShowModalInterceptor = useCallback(
        (value: boolean) => {
            // Remove the remoteDesignImport parameter from the URL if the user closes the import modal
            if (!value) {
                const newParams = new URLSearchParams(params)
                newParams.delete("remoteDesignImport")
                router.push(`${pathname}?${newParams.toString()}`)
            }

            setShowModal(value)
        },
        [params, pathname, router],
    )

    if (params.has("remoteDesignImport") && !remoteDesignImportURL) {
        const url = params.get("remoteDesignImport")
        if (
            url &&
            isValidUrl(url) &&
            //url.startsWith("https://") &&
            url.endsWith(".json")
        ) {
            setRemoteDesignImportURL(url)
            setShowModal(true)
        }
    }

    const doImport = useCallback(async () => {
        try {
            if (remoteDesignImportURL) {
                setIsImportInProgress(true)
                const req = await fetch(remoteDesignImportURL)
                if (req.ok) {
                    const json = await req.json()
                    const blob = new Blob([JSON.stringify(json)], {
                        type: "application/json",
                    })
                    const status = await loadFromFile(blob)
                    if (status === "no-data") {
                        setImportError("The imported file is empty or invalid.")
                    } else if (status === "error") {
                        setImportError("Failed to load the imported file.")
                    } else {
                        setShowModalInterceptor(false)
                    }
                } else {
                    setImportError("Failed to fetch the remote file.")
                }
            }
        } catch (e) {
            console.error(e)
            setImportError(e)
        } finally {
            setIsImportInProgress(false)
        }
    }, [loadFromFile, remoteDesignImportURL, setShowModalInterceptor])

    return (
        <>
            <Dialog open={showModal} onOpenChange={setShowModalInterceptor}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Import Design</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to import a FAIR DO Design
                            from the following destination? Only import designs
                            from trusted sources.
                        </DialogDescription>
                    </DialogHeader>
                    <Error title={"Design Import failed"} error={importError} />
                    <div className="flex justify-center p-2">
                        <ShieldAlert className="size-10 text-warn" />
                    </div>
                    You are about to import a Design from the following URL:
                    <span className="border border-warn text-warn rounded-md p-3">
                        {remoteDesignImportURL}
                    </span>
                    Only import Designs from sources that you trust. Are you
                    sure you want to continue?
                    <DialogFooter className="pt-4">
                        <Button
                            variant={"secondary"}
                            className={"grow"}
                            onClick={() => setShowModalInterceptor(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={isImportInProgress}
                            onClick={doImport}
                        >
                            Yes, I am sure
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
