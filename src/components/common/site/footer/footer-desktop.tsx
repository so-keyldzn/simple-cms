import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Icon } from '@iconify/react'
import { ModeToggle } from '@/features/theme/components/toogle-theme'
import { LocaleSwitcher } from '@/features/i18n/components/locale-switcher'

interface NavigationItem {
  title: string
  href?: string
  description?: string
  isExternal?: boolean
}

interface NavigationSection {
  title: string
  href?: string
  items?: NavigationItem[]
}

interface SocialLink {
  name: string
  href: string
  icon?: string
}

interface FooterDesktopProps {
  className?: string
  logo?: {
    text?: string
    href?: string
    imageUrl?: string
  }
  description?: string
  navigation?: {
    items?: NavigationSection[]
  }
  social?: SocialLink[]
  copyright?: string
}

const DEFAULT_NAVIGATION: NavigationSection[] = [
  {
    title: "Product",
    items: [
      { title: "Features", href: "/features" },
      { title: "Pricing", href: "/pricing" },
      { title: "Changelog", href: "/changelog" },
      { title: "Documentation", href: "/docs" }
    ]
  },
  {
    title: "Company",
    items: [
      { title: "About", href: "/about" },
      { title: "Blog", href: "/blog" },
      { title: "Careers", href: "/careers" },
      { title: "Contact", href: "/contact" }
    ]
  },
  {
    title: "Legal",
    items: [
      { title: "Privacy Policy", href: "/privacy" },
      { title: "Terms of Service", href: "/terms" },
      { title: "Cookie Policy", href: "/cookies" }
    ]
  }
]

const socialIconMap: Record<string, string> = {
  facebook: "logos:facebook",
  twitter: "logos:twitter",
  linkedin: "logos:linkedin",
  github: "logos:github",
  instagram: "logos:instagram",
  youtube: "logos:youtube",
  x: "logos:twitter", 
  tiktok: "logos:tiktok",
  discord: "logos:discord",
  telegram: "logos:telegram",
  whatsapp: "logos:whatsapp",
  pinterest: "logos:pinterest",
  snapchat: "logos:snapchat",
  reddit: "logos:reddit"
} as const

const SocialIcon = React.memo(({ name }: { name: string }) => {
  const iconName = socialIconMap[name.toLowerCase() as keyof typeof socialIconMap] || "mdi:link"
  return <Icon icon={iconName} className="h-5 w-5 transition-transform hover:scale-110" />
})
SocialIcon.displayName = 'SocialIcon'

const FooterSection = React.memo(({ section }: { section: NavigationSection }) => (
  <div className="space-y-4">
    <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide">{section.title}</h3>
    {section.items && section.items.length > 0 && (
      <ul className="space-y-2">
        {section.items.map((item) => (
          <li key={item.title}>
            <Link
              href={item.href || "#"}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 hover:underline underline-offset-4"
              {...(item.isExternal && {
                target: "_blank",
                rel: "noopener noreferrer"
              })}
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    )}
  </div>
))
FooterSection.displayName = 'FooterSection'

const SocialLinks = React.memo(({ social }: { social: SocialLink[] }) => {
  const hasSocialLinks = social.length > 0

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {social.map((link) => (
        <Link
          key={link.name}
          href={link.href}
          className="text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110 p-1 rounded-md hover:bg-muted/50"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Follow us on ${link.name}`}
        >
          <SocialIcon name={link.name} />
        </Link>
      ))}
      {hasSocialLinks && (
        <div className="h-5 w-px bg-border/60 mx-1" />
      )}
      <ModeToggle />
      <div className="h-5 w-px bg-border/60 mx-1" />
      <LocaleSwitcher />
    </div>
  )
})
SocialLinks.displayName = 'SocialLinks'

const FooterDesktop = React.memo(function FooterDesktop({
  className,
  logo = { text: "Your Site", href: "/" },
  description = "Building amazing things together.",
  navigation = { items: DEFAULT_NAVIGATION },
  social = [],
  copyright = `© ${new Date().getFullYear()} Your Site. All rights reserved.`
}: FooterDesktopProps) {
  const navigationItems = navigation.items || DEFAULT_NAVIGATION
  const logoHref = logo.href || "/"
  const logoText = logo.text || "Your Site"

  return (
    <footer className={cn("hidden md:block bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-12 gap-8 lg:gap-12 pb-8 border-b border-border/40">
          {/* Logo and Description */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <Link 
              href={logoHref} 
              className="inline-flex items-center space-x-2 group transition-opacity hover:opacity-80"
            >
              {logo.imageUrl ? (
                <img 
                  src={logo.imageUrl} 
                  alt={logoText} 
                  className="h-8 w-auto"
                  loading="lazy"
                />
              ) : (
                <span className="font-bold text-xl bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  {logoText}
                </span>
              )}
            </Link>
            {description && (
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                {description}
              </p>
            )}
            <SocialLinks social={social} />
          </div>

          {/* Navigation Sections */}
          <div className="col-span-12 lg:col-span-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 lg:gap-12">
              {navigationItems.map((section, index) => (
                <FooterSection key={`${section.title}-${index}`} section={section} />
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8">
          <p className="text-sm text-muted-foreground/80 text-center md:text-left">
            {copyright}
          </p>
        </div>
      </div>
    </footer>
  )
})

export default FooterDesktop
