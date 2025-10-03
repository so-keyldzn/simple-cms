import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  NavigationMenu, 
  NavigationMenuContent, 
  NavigationMenuItem, 
  NavigationMenuLink, 
  NavigationMenuList, 
  NavigationMenuTrigger 
} from '@/components/ui/navigation-menu'
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

interface HeaderDesktopProps {
  className?: string
  logo?: {
    text?: string
    href?: string
  }
  navigation?: {
    items?: NavigationSection[]
  }
  actions?: {
    signInText?: string
    signInHref?: string
    getStartedText?: string
    getStartedHref?: string
    showSearch?: boolean
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

const navigationMenuTriggerStyle = () =>
  "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"

const FeaturedNavigationContent = () => (
  <NavigationMenuLink asChild>
    <a
      className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
      href="/"
    >
      <div className="mb-2 mt-4 text-lg font-medium">
        shadcn/ui
      </div>
      <p className="text-sm leading-tight text-muted-foreground">
        Beautifully designed components built with Radix UI and Tailwind CSS.
      </p>
    </a>
  </NavigationMenuLink>
)

const GettingStartedContent = ({ items }: { items: NavigationItem[] }) => (
  <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
    <li className="row-span-3">
      <FeaturedNavigationContent />
    </li>
    {items.map((item) => (
      <ListItem key={item.title} href={item.href} title={item.title}>
        {item.description}
      </ListItem>
    ))}
  </ul>
)

const StandardNavigationContent = ({ items }: { items: NavigationItem[] }) => (
  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
    {items.map((item) => (
      <ListItem
        key={item.title}
        title={item.title}
        href={item.href}
      >
        {item.description}
      </ListItem>
    ))}
  </ul>
)

const NavigationContent = ({ section }: { section: NavigationSection }) => {
  if (!section.items) return null

  return (
    <NavigationMenuContent>
      {section.title === "Getting started" ? (
        <GettingStartedContent items={section.items} />
      ) : (
        <StandardNavigationContent items={section.items} />
      )}
    </NavigationMenuContent>
  )
}

const NavigationItem = ({ section }: { section: NavigationSection }) => (
  <NavigationMenuItem>
    {section.items ? (
      <>
        <NavigationMenuTrigger>{section.title}</NavigationMenuTrigger>
        <NavigationContent section={section} />
      </>
    ) : (
      <NavigationMenuLink asChild>
        <Link href={section.href || "#"} className={navigationMenuTriggerStyle()}>
          {section.title}
        </Link>
      </NavigationMenuLink>
    )}
  </NavigationMenuItem>
)

const HeaderActions = ({ actions }: { actions: HeaderDesktopProps['actions'] }) => {
  if (!actions) return null

  return (
    <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
      {actions.showSearch && (
        <div className="w-full flex-1 md:w-auto md:flex-none">
          {/* Search component would go here */}
        </div>
      )}
      <nav className="flex items-center">
        <Button variant="ghost" size="sm" asChild>
          <Link href={actions.signInHref || "/sign-in"}>
            {actions.signInText || "Sign In"}
          </Link>
        </Button>
        <Button size="sm" asChild>
          <Link href={actions.getStartedHref || "/sign-up"}>
            {actions.getStartedText || "Get Started"}
          </Link>
        </Button>
      </nav>
    </div>
  )
}

function HeaderDesktop({ 
  className,
  logo = { text: "Your Site", href: "/" },
  navigation = { items: DEFAULT_NAVIGATION },
  actions = {
    signInText: "Sign In",
    signInHref: "/sign-in",
    getStartedText: "Get Started", 
    getStartedHref: "/sign-up",
    showSearch: true
  }
}: HeaderDesktopProps) {
  return (
    <div className={cn("mr-4 hidden md:flex w-full", className)}>
      <Link href={logo.href || "/"} className="mr-6 flex items-center space-x-2">
        <span className="hidden font-bold sm:inline-block">
          {logo.text}
        </span>
      </Link>
      
      <NavigationMenu>
        <NavigationMenuList>
          {navigation.items?.map((section, index) => (
            <NavigationItem key={index} section={section} />
          ))}
        </NavigationMenuList>
      </NavigationMenu>
      
      <HeaderActions actions={actions} />
    </div>
  )
}

export default HeaderDesktop