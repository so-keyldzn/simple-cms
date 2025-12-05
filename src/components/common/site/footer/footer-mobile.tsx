"use client"

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronDown, Facebook, Twitter, Linkedin, Github, Instagram, Youtube } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
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

interface FooterMobileProps {
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

const socialIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  github: Github,
  instagram: Instagram,
  youtube: Youtube,
}

const SocialIcon = ({ name }: { name: string }) => {
  const IconComponent = socialIcons[name.toLowerCase()] || Github
  return <IconComponent className="h-5 w-5" />
}

const MobileNavigationSection = ({ section }: { section: NavigationSection }) => {
  const [isOpen, setIsOpen] = React.useState(false)

  if (!section.items || section.items.length === 0) {
    return (
      <Link
        href={section.href || "#"}
        className="flex items-center py-3 font-semibold text-foreground"
      >
        {section.title}
      </Link>
    )
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between py-3 font-semibold text-foreground">
        {section.title}
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 pb-4">
        {section.items.map((item) => (
          <Link
            key={item.title}
            href={item.href || "#"}
            className="block py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            {...(item.isExternal && {
              target: "_blank",
              rel: "noopener noreferrer"
            })}
          >
            {item.title}
          </Link>
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}

const SocialLinks = ({ social }: { social: SocialLink[] }) => (
  <div className="flex flex-col items-center gap-4 py-6">
    <div className="flex items-center gap-6">
      {social.map((link) => (
        <Link
          key={link.name}
          href={link.href}
          className="text-muted-foreground hover:text-foreground transition-colors"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.name}
        >
          <SocialIcon name={link.name} />
        </Link>
      ))}
    </div>
    <div className="flex items-center gap-3">
      <ModeToggle />
      <div className="h-5 w-px bg-border" />
      <LocaleSwitcher />
    </div>
  </div>
)

function FooterMobile({
  className,
  logo = { text: "Your Site", href: "/" },
  description = "Building amazing things together.",
  navigation = { items: DEFAULT_NAVIGATION },
  social = [],
  copyright = `© ${new Date().getFullYear()} Your Site. All rights reserved.`
}: FooterMobileProps) {
  return (
    <div className={cn("md:hidden", className)}>
      {/* Logo and Description */}
      <div className="text-center pb-6 border-b border-border/40">
        <Link href={logo.href || "/"} className="inline-flex items-center space-x-2 mb-4">
          {logo.imageUrl ? (
            <Image src={logo.imageUrl || ""} alt={logo.text || ""} width={100} height={32} className="h-8 w-auto" />
          ) : (
            <span className="font-bold text-xl">{logo.text}</span>
          )}
        </Link>
        {description && (
          <p className="text-sm text-muted-foreground px-4">
            {description}
          </p>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="py-6 border-b border-border/40 divide-y divide-border/40">
        {navigation.items?.map((section, index) => (
          <MobileNavigationSection key={index} section={section} />
        ))}
      </div>

      {/* Social Links & Theme Toggle */}
      <div className="border-b border-border/40">
        <SocialLinks social={social || []} />
      </div>

      {/* Copyright */}
      <div className="pt-6">
        <p className="text-xs text-muted-foreground text-center">
          {copyright}
        </p>
      </div>
    </div>
  )
}

export default FooterMobile
