"use client"

import HeaderDesktop from './header-desktop'
import HeaderMobile from './header-mobile'
import { useIsMobile } from '@/hooks/use-mobile'
import { useEffect, useState } from 'react'

type NavigationItem = {
  title: string
  href?: string
  description?: string
}

type NavigationSection = {
  title: string
  href?: string
  items?: NavigationItem[]
}

type HeaderData = {
  logo: {
    text: string
    href: string
  }
  navigation: {
    items: NavigationSection[]
  }
  actions: {
    signInText: string
    signInHref: string
    getStartedText: string
    getStartedHref: string
  }
}

function Header() {
  const isMobile = useIsMobile()
  const [headerData, setHeaderData] = useState<HeaderData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHeaderData = async () => {
      try {
        const response = await fetch('/api/header-data')
        const data = await response.json()
        setHeaderData(data)
      } catch (error) {
        console.error('Error fetching header data:', error)
        // Fallback to default values
        setHeaderData({
          logo: { text: "My Site", href: "/" },
          navigation: { items: [] },
          actions: {
            signInText: "Sign In",
            signInHref: "/sign-in",
            getStartedText: "Get Started",
            getStartedHref: "/sign-up"
          }
        })
      } finally {
        setLoading(false)
      }
    }

    fetchHeaderData()
  }, [])

  if (loading || !headerData) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center" />
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {isMobile ? (
          <HeaderMobile
            logo={headerData.logo}
            navigation={headerData.navigation}
            actions={headerData.actions}
          />
        ) : (
          <HeaderDesktop
            logo={headerData.logo}
            navigation={headerData.navigation}
            actions={headerData.actions}
          />
        )}
      </div>
    </header>
  )
}

export default Header