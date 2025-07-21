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

export default function Home() {
    const [tab, setTab] = useState("input")

    return (
        <div className="h-screen w-screen">
            <ResizablePanelGroup direction={"horizontal"}>
                <ResizablePanel>
                    <div>
                        <Workspace />
                    </div>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel>
                    <Tabs
                        className="overflow-auto"
                        value={tab}
                        onValueChange={setTab}
                    >
                        <TabsList>
                            <TabsTrigger value={"input"}>Input</TabsTrigger>
                            <TabsTrigger value={"output"}>
                                Generated Code
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent
                            className={
                                "overflow-auto " +
                                (tab === "input" ? "" : "hidden")
                            }
                            value={"input"}
                            forceMount
                        >
                            <InputPane />
                        </TabsContent>

                        <TabsContent
                            className={
                                "overflow-auto " +
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
