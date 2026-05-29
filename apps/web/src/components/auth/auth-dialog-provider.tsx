import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { AuthDialog } from '@/components/auth/auth-dialog';
import type { AuthDialogMode } from '@/components/auth/auth-dialog';

type OpenAuthDialogOptions = {
  callbackURL?: string
}

type AuthDialogContextValue = {
  openLogin: (options?: OpenAuthDialogOptions) => void
  openSignup: (options?: OpenAuthDialogOptions) => void
  close: () => void
}

const AuthDialogContext = createContext<AuthDialogContextValue | null>(null)

export function AuthDialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<AuthDialogMode>("login")
  const [callbackURL, setCallbackURL] = useState<string | undefined>()

  const openWithMode = useCallback(
    (nextMode: AuthDialogMode, options?: OpenAuthDialogOptions) => {
      setMode(nextMode)
      setCallbackURL(options?.callbackURL)
      setOpen(true)
    },
    []
  )

  const value = useMemo(
    () => ({
      openLogin: (options?: OpenAuthDialogOptions) => {
        openWithMode("login", options)
      },
      openSignup: (options?: OpenAuthDialogOptions) => {
        openWithMode("signup", options)
      },
      close: () => {
        setOpen(false)
      },
    }),
    [openWithMode]
  )

  return (
    <AuthDialogContext.Provider value={value}>
      {children}
      <AuthDialog
        open={open}
        mode={mode}
        callbackURL={callbackURL}
        onOpenChange={setOpen}
        onSwitchMode={setMode}
      />
    </AuthDialogContext.Provider>
  )
}

export function useAuthDialog() {
  const context = useContext(AuthDialogContext)
  if (!context) {
    throw new Error("useAuthDialog must be used within AuthDialogProvider")
  }
  return context
}
