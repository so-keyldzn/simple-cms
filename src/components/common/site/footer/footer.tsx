"use client"

import FooterDesktop from './footer-desktop'
import FooterMobile from './footer-mobile'
import { useIsMobile } from '@/hooks/use-mobile'
import { useEffect, useState } from 'react'

type NavigationItem = {
  title: string
  href?: string
  description?: string
  isExternal?: boolean
}

type NavigationSection = {
  title: string
  href?: string
  items?: NavigationItem[]
}

type SocialLink = {
  name: string
  href: string
  icon?: string
}

type FooterData = {
  logo: {
    text: string
    href: string
    imageUrl?: string
  }
  description?: string
  navigation: {
    items: NavigationSection[]
  }
  social?: SocialLink[]
  copyright?: string
}

function Footer() {
  const isMobile = useIsMobile()
  const [footerData, setFooterData] = useState<FooterData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const response = await fetch('/api/footer-data')
        const data = await response.json()
        setFooterData(data)
      } catch (error) {
        console.error('Error fetching footer data:', error)
        // Fallback to default values
        setFooterData({
          logo: { text: "My Site", href: "/" },
          description: "Building amazing things together.",
          navigation: { items: [] },
          copyright: `© ${new Date().getFullYear()} My Site. All rights reserved.`
        })
      } finally {
        setLoading(false)
      }
    }

    fetchFooterData()
  }, [])

  if (loading || !footerData) {
    return (
      <footer className="border-t border-border/40 bg-background">
        <div className="container py-8" />
      </footer>
    )
  }

  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container py-8 md:py-12">
        {isMobile ? (
          <FooterMobile
            logo={footerData.logo}
            description={footerData.description}
            navigation={footerData.navigation}
            social={footerData.social}
            copyright={footerData.copyright}
          />
        ) : (
          <FooterDesktop
            logo={footerData.logo}
            description={footerData.description}
            navigation={footerData.navigation}
            social={footerData.social}
            copyright={footerData.copyright}
          />
        )}
      </div>
    </footer>
  )
}

export default Footer
