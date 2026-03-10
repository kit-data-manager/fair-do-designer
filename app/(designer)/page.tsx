"use client"

import { Workspace } from "@/components/Workspace"
import { OutputPane } from "@/components/OutputPane"
import { InputPane } from "@/components/InputPane"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
import { CodeIcon, DatabaseIcon } from "lucide-react"
import { Header } from "@/components/Header"
import { RemoteDesignImport } from "@/components/RemoteDesignImport"
import { AlertManager } from "@/components/AlertManager"

export default function Home() {
    const [tab, setTab] = useState("input")

    return (
        <div className="h-screen w-screen">
            <RemoteDesignImport />
            <AlertManager />

            <ResizablePanelGroup orientation={"horizontal"}>
                <ResizablePanel
                    defaultSize={"70%"}
                    minSize={400}
                    className={"flex flex-col"}
                >
                    <Header />
                    <Workspace />
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel
                    defaultSize={"30%"}
                    minSize={400}
                    className={"flex flex-col"}
                >
                    <Tabs
                        className="max-h-full grow gap-0"
                        value={tab}
                        onValueChange={setTab}
                    >
                        <TabsList variant={"large-blocky"}>
                            <TabsTrigger
                                value={"input"}
                                variant={"large-blocky"}
                            >
                                <DatabaseIcon /> Data Access
                            </TabsTrigger>
                            <TabsTrigger
                                value={"output"}
                                variant={"large-blocky"}
                            >
                                <CodeIcon /> Generated Code
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent
                            className={
                                "min-h-0 max-h-full flex " +
                                (tab === "input" ? "" : "hidden")
                            }
                            value={"input"}
                            forceMount
                        >
                            <InputPane />
                        </TabsContent>

                        <TabsContent
                            className={
                                "min-h-0 max-h-full flex grow " +
                                (tab === "output" ? "" : "hidden")
                            }
                            value={"output"}
                            forceMount
                        >
                            <OutputPane />
                        </TabsContent>
                    </Tabs>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    )
}
