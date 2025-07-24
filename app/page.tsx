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
                        className="max-h-full"
                        value={tab}
                        onValueChange={setTab}
                    >
                        <TabsList>
                            <TabsTrigger value={"input"}><DatabaseIcon /> Data Access</TabsTrigger>
                            <TabsTrigger value={"output"}>
                               <CodeIcon />  Generated Code
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
                                "min-h-0 max-h-full flex " +
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
