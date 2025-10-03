"use client"

import HeaderDesktop from './header-desktop'
import HeaderMobile from './header-mobile'
import { useIsMobile } from '@/hooks/use-mobile'

function Header() {
  const isMobile = useIsMobile()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {isMobile ? <HeaderMobile /> : <HeaderDesktop />}
      </div>
    </header>
  )
}

export default Header