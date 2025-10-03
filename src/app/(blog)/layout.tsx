import React from 'react'
import Header from '@/components/common/site/header/header'

interface BlogLayoutProps {
  children: React.ReactNode
}

function BlogLayout({ children }: BlogLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}

export default BlogLayout