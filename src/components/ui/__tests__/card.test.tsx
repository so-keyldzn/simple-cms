import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../card'

describe('Card Components', () => {
  it('should render Card component', () => {
    render(<Card data-testid="card">Card Content</Card>)
    const card = screen.getByTestId('card')
    expect(card).toBeInTheDocument()
    expect(card).toHaveClass('rounded-xl', 'border')
  })

  it('should render complete card with all sections', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    )

    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })

  it('should render CardTitle with correct styles', () => {
    render(<CardTitle>Card Title</CardTitle>)
    const title = screen.getByText('Card Title')
    expect(title).toHaveClass('leading-none', 'font-semibold')
  })

  it('should render CardDescription with muted text', () => {
    render(<CardDescription>Card Description</CardDescription>)
    const description = screen.getByText('Card Description')
    expect(description).toHaveClass('text-sm', 'text-muted-foreground')
  })

  it('should accept custom className', () => {
    render(<Card className="custom-card" data-testid="custom-card">Content</Card>)
    const card = screen.getByTestId('custom-card')
    expect(card).toHaveClass('custom-card')
  })

  it('should render CardFooter with flex layout', () => {
    render(<CardFooter data-testid="footer">Footer Content</CardFooter>)
    const footer = screen.getByTestId('footer')
    expect(footer).toHaveClass('flex', 'items-center')
  })
})
