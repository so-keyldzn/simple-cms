"use client"

import React from 'react'
import Link from 'next/link'
import { Menu, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

interface NavigationItem {
  title: string
  href?: string
  description?: string
}

interface NavigationSection {
  title: string
  href?: string
  items?: NavigationItem[]
}

interface HeaderMobileProps {
  className?: string
  logo?: {
    text?: string
    href?: string
    imageUrl?: string
  }
  navigation?: {
    items?: NavigationSection[]
  }
  actions?: {
    signInText?: string
    signInHref?: string
    getStartedText?: string
    getStartedHref?: string
  }
}

const DEFAULT_COMPONENTS: NavigationItem[] = [
  {
    title: "Alert Dialog",
    href: "/docs/primitives/alert-dialog",
    description: "A modal dialog that interrupts the user with important content and expects a response.",
  },
  {
    title: "Hover Card",
    href: "/docs/primitives/hover-card",
    description: "For sighted users to preview content available behind a link.",
  },
  {
    title: "Progress",
    href: "/docs/primitives/progress",
    description: "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
  },
  {
    title: "Scroll-area",
    href: "/docs/primitives/scroll-area",
    description: "Visually or semantically separates content.",
  },
  {
    title: "Tabs",
    href: "/docs/primitives/tabs",
    description: "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
  },
  {
    title: "Tooltip",
    href: "/docs/primitives/tooltip",
    description: "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
  },
]

const DEFAULT_NAVIGATION: NavigationSection[] = [
  {
    title: "Getting started",
    items: [
      {
        title: "Introduction",
        href: "/docs",
        description: "Re-usable components built using Radix UI and Tailwind CSS."
      },
      {
        title: "Installation", 
        href: "/docs/installation",
        description: "How to install dependencies and structure your app."
      },
      {
        title: "Typography",
        href: "/docs/primitives/typography", 
        description: "Styles for headings, paragraphs, lists...etc"
      }
    ]
  },
  {
    title: "Components",
    items: DEFAULT_COMPONENTS
  },
  {
    title: "Documentation",
    href: "/docs"
  }
]

const MobileNavigationItem = ({ 
  section, 
  onItemClick 
}: { 
  section: NavigationSection
  onItemClick: () => void
}) => {
  const [isOpen, setIsOpen] = React.useState(false)

  if (!section.items) {
    return (
      <Link
        href={section.href || "#"}
        className="flex items-center py-2 text-lg font-semibold"
        onClick={onItemClick}
      >
        {section.title}
      </Link>
    )
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-lg font-semibold">
        {section.title}
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2">
        {section.items.map((item) => (
          <Link
            key={item.title}
            href={item.href || "#"}
            className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
            onClick={onItemClick}
          >
            <div className="font-medium">{item.title}</div>
            {item.description && (
              <div className="text-xs text-muted-foreground mt-1">
                {item.description}
              </div>
            )}
          </Link>
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}

function HeaderMobile({ 
  className,
  logo = { text: "Your Site", href: "/" },
  navigation = { items: DEFAULT_NAVIGATION },
  actions = {
    signInText: "Sign In",
    signInHref: "/sign-in",
    getStartedText: "Get Started", 
    getStartedHref: "/sign-up"
  }
}: HeaderMobileProps) {
  const [open, setOpen] = React.useState(false)

  const handleItemClick = () => {
    setOpen(false)
  }

  return (
    <div className={cn("flex items-center justify-between w-full md:hidden", className)}>
      <Link href={logo.href || "/"} className="flex items-center space-x-2">
        {logo.imageUrl ? (
          <img src={logo.imageUrl} alt={logo.text} className="h-8 w-auto" />
        ) : (
          <span className="font-bold text-lg">
            {logo.text}
          </span>
        )}
      </Link>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          
          <div className="flex flex-col space-y-4 py-4">
            <div className="space-y-3">
              {navigation.items?.map((section, index) => (
                <MobileNavigationItem 
                  key={index} 
                  section={section} 
                  onItemClick={handleItemClick}
                />
              ))}
            </div>

            {actions && (
              <div className="border-t pt-4 space-y-2">
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href={actions.signInHref || "/sign-in"} onClick={handleItemClick}>
                    {actions.signInText || "Sign In"}
                  </Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link href={actions.getStartedHref || "/sign-up"} onClick={handleItemClick}>
                    {actions.getStartedText || "Get Started"}
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default HeaderMobile