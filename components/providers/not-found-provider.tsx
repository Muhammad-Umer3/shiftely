'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

type NotFoundContextValue = {
  isNotFound: boolean
  setIsNotFound: (value: boolean) => void
}

const NotFoundContext = createContext<NotFoundContextValue | null>(null)

export function NotFoundProvider({ children }: { children: React.ReactNode }) {
  const [isNotFound, setIsNotFound] = useState(false)
  const setter = useCallback((value: boolean) => setIsNotFound(value), [])
  return (
    <NotFoundContext.Provider value={{ isNotFound, setIsNotFound: setter }}>
      {children}
    </NotFoundContext.Provider>
  )
}

export function useNotFound() {
  const ctx = useContext(NotFoundContext)
  return ctx
}

/** Renders nothing; when mounted sets isNotFound true so layout can hide contact button etc. */
export function NotFoundSetter() {
  const ctx = useNotFound()
  const setIsNotFound = ctx?.setIsNotFound
  React.useEffect(() => {
    if (!setIsNotFound) return
    setIsNotFound(true)
    return () => setIsNotFound(false)
  }, [setIsNotFound])
  return null
}
