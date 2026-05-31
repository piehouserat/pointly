import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router"
import { ThemeProvider } from "@lonik/themer"

import { AuthDialogProvider } from "@/components/auth/auth-dialog-provider"
import appCss from "@pointly/ui/globals.css?url"
import { TooltipProvider } from "@pointly/ui/components/tooltip"

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Pointly — Planning Poker",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "manifest",
        href: "/manifest.json",
      },
      {
        rel: "icon",
        href: "/pointly-favicon.svg",
      },
    ],
  }),
  notFoundComponent: () => (
    <main className="container mx-auto p-4 pt-16">
      <h1>404</h1>
      <p>The requested page could not be found.</p>
    </main>
  ),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider defaultTheme="system" enableSystem>
          <AuthDialogProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </AuthDialogProvider>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}
