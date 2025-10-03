import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Facebook, Twitter, Linkedin, Github, Instagram, Youtube } from 'lucide-react'

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

const FooterSection = ({ section }: { section: NavigationSection }) => (
  <div>
    <h3 className="font-semibold text-foreground mb-4">{section.title}</h3>
    {section.items && (
      <ul className="space-y-3">
        {section.items.map((item) => (
          <li key={item.title}>
            <Link
              href={item.href || "#"}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
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
)

const SocialLinks = ({ social }: { social: SocialLink[] }) => (
  <div className="flex items-center space-x-4">
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
)

function FooterDesktop({
  className,
  logo = { text: "Your Site", href: "/" },
  description = "Building amazing things together.",
  navigation = { items: DEFAULT_NAVIGATION },
  social = [],
  copyright = `© ${new Date().getFullYear()} Your Site. All rights reserved.`
}: FooterDesktopProps) {
  return (
    <div className={cn("hidden md:block", className)}>
      <div className="grid grid-cols-12 gap-8 pb-8 border-b border-border/40">
        {/* Logo and Description */}
        <div className="col-span-12 lg:col-span-4">
          <Link href={logo.href || "/"} className="flex items-center space-x-2 mb-4">
            {logo.imageUrl ? (
              <img src={logo.imageUrl} alt={logo.text} className="h-8" />
            ) : (
              <span className="font-bold text-xl">{logo.text}</span>
            )}
          </Link>
          {description && (
            <p className="text-sm text-muted-foreground max-w-xs mb-6">
              {description}
            </p>
          )}
          {social && social.length > 0 && <SocialLinks social={social} />}
        </div>

        {/* Navigation Sections */}
        <div className="col-span-12 lg:col-span-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {navigation.items?.map((section, index) => (
              <FooterSection key={index} section={section} />
            ))}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="pt-8">
        <p className="text-sm text-muted-foreground text-center md:text-left">
          {copyright}
        </p>
      </div>
    </div>
  )
}

export default FooterDesktop
