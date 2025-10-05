import React from 'react'
import Header from '@/components/common/site/header/header'
import Footer from '@/components/common/site/footer/footer'

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
      <Footer />
    </div>
  )
}

export default BlogLayout