"use client"

import React from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'

import { cn } from '@/lib/utils'

interface HeaderMobileProps {
  className?: string
}

function HeaderMobile({ className }: HeaderMobileProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className={cn("md:hidden", className)}>
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
            {/* Navigation items will go here */}
            <div className="text-sm text-muted-foreground">
              Mobile navigation menu
            </div>

            
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default HeaderMobile