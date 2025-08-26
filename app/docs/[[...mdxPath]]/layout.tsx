import { Footer, Layout, Navbar } from "nextra-theme-docs"
import { Head } from "nextra/components"
import { getPageMap } from "nextra/page-map"
import "nextra-theme-docs/style.css"
import { PropsWithChildren } from "react"
import { FrameIcon } from "lucide-react"
import "../../globals.css"

export const metadata = {
    // Define your metadata here
    // For more information on metadata API, see: https://nextjs.org/docs/app/building-your-application/optimizing/metadata
}

const banner = null
const navbar = (
    <Navbar
        logo={
            <span
                style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                    fontWeight: "bold",
                }}
            >
                <FrameIcon
                    style={{ width: "20px", height: "20px", flexShrink: 0 }}
                />
                Fair-DO Designer Docs
            </span>
        }
        // ... Your additional navbar options
    />
)
const footer = (
    <Footer>
        Apache 2.0 {new Date().getFullYear()} © Karlsruhe Institute of
        Technology.
    </Footer>
)

export default async function RootLayout({ children }: PropsWithChildren) {
    return (
        <html
            // Not required, but good for SEO
            lang="en"
            // Required to be set
            dir="ltr"
            // Suggested by `next-themes` package https://github.com/pacocoursey/next-themes#with-app
            suppressHydrationWarning
        >
            <Head
            // ... Your additional head options
            >
                {/* Your additional tags should be passed as `children` of `<Head>` element */}
            </Head>
            <body>
                <Layout
                    banner={banner}
                    navbar={navbar}
                    pageMap={await getPageMap("/docs")}
                    docsRepositoryBase="https://github.com/kit-data-manager/fair-do-designer"
                    footer={footer}
                    // ... Your additional layout options
                >
                    {children}
                </Layout>
            </body>
        </html>
    )
}
