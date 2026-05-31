import { Link } from "@tanstack/react-router"
import { Menu } from "lucide-react"
import { useState } from "react"

import { useAuthDialog } from "@/components/auth/auth-dialog-provider"
import { UserMenu } from "@/components/user-menu"
import { authClient } from "@/lib/auth-client"
import { Button, buttonVariants } from "@pointly/ui/components/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@pointly/ui/components/navigation-menu"
import { Separator } from "@pointly/ui/components/separator"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@pointly/ui/components/sheet"
import { Spinner } from "@pointly/ui/components/spinner"
import { cn } from "@pointly/ui/lib/utils"
import { navLinks } from "@/lib/site-config"

function NavLink({
  href,
  label,
  className,
  onClick,
}: {
  href: string
  label: string
  className?: string
  onClick?: () => void
}) {
  return (
    <NavigationMenuLink
      render={<a href={href} onClick={onClick} />}
      className={cn(navigationMenuTriggerStyle(), className)}
    >
      {label}
    </NavigationMenuLink>
  )
}

export function LandingHeader() {
  const session = authClient.useSession()
  const { openLogin, openSignup } = useAuthDialog()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isGuest =
    session.isPending ||
    !session.data?.user ||
    session.data.user.isAnonymous !== false

  function closeMobileMenu() {
    setMobileOpen(false)
  }

  function handleMobileLogin() {
    closeMobileMenu()
    openLogin()
  }

  function handleMobileSignup() {
    closeMobileMenu()
    openSignup()
  }

  return (
    <header className="relative z-10 border-b border-border">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex min-w-0 shrink-0 items-center">
          <img
            src="/pointly-logo-header.svg"
            alt="Pointly"
            className="h-8 w-auto max-w-36 object-contain object-left sm:h-9 sm:max-w-none"
          />
        </Link>

        {/* <NavigationMenu viewport={false} className="hidden md:block">
          <NavigationMenuList>
            {navLinks.map((link) => (
              <NavigationMenuItem key={link.href}>
                <NavLink href={link.href} label={link.label} />
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu> */}

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {session.isPending ? (
            <Spinner className="size-4" />
          ) : isGuest ? (
            <div className="hidden items-center gap-1 sm:flex">
              <button
                type="button"
                className={cn(buttonVariants({ variant: "ghost" }))}
                onClick={() => openSignup()}
              >
                Sign up
              </button>
              <button
                type="button"
                className={cn(buttonVariants({ variant: "ghost" }))}
                onClick={() => openLogin()}
              >
                Login
              </button>
            </div>
          ) : (
            <div className="hidden sm:block">
              <UserMenu />
            </div>
          )}

          <Link
            to="/new-game"
            className={cn(
              buttonVariants({ variant: "default" }),
              "hidden md:inline-flex"
            )}
          >
            Start new game
          </Link>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="md:hidden"
                  aria-label="Open menu"
                />
              }
            >
              <Menu />
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-xs">
              <SheetHeader>
                <SheetTitle className="sr-only">Navigation menu</SheetTitle>
              </SheetHeader>

              <nav className="flex flex-col gap-1 px-4">
                {navLinks.map((link) => (
                  <SheetClose
                    key={link.href}
                    render={
                      <a
                        href={link.href}
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "sm" }),
                          "justify-start text-muted-foreground hover:text-foreground"
                        )}
                      />
                    }
                  >
                    {link.label}
                  </SheetClose>
                ))}
              </nav>

              <Separator className="my-4" />

              <div className="flex flex-col gap-2 px-4">
                {session.isPending ? (
                  <Button variant="ghost" size="sm" disabled>
                    <Spinner data-icon="inline-start" />
                    Loading account
                  </Button>
                ) : isGuest ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start"
                      onClick={handleMobileSignup}
                    >
                      Sign up
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start"
                      onClick={handleMobileLogin}
                    >
                      Login
                    </Button>
                  </>
                ) : (
                  <UserMenu />
                )}

                <SheetClose
                  render={
                    <Link
                      to="/new-game"
                      className={buttonVariants({ size: "sm" })}
                    />
                  }
                >
                  Start new game
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
