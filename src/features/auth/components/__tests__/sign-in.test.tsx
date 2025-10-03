import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SignIn from '../sign-in'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

// Mock auth client
vi.mock('@/features/auth/lib/auth-clients', () => ({
  signIn: {
    email: vi.fn(),
  },
}))

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

describe('SignIn Component', () => {
  it('should render sign in form', () => {
    render(<SignIn />)

    expect(screen.getByText('Sign In')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('should have email and password inputs', () => {
    render(<SignIn />)

    const emailInput = screen.getByPlaceholderText('m@example.com')
    const passwordInput = screen.getByPlaceholderText('password')

    expect(emailInput).toHaveAttribute('type', 'email')
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('should have forgot password link', () => {
    render(<SignIn />)

    const forgotLink = screen.getByText('Forgot your password?')
    expect(forgotLink).toHaveAttribute('href', '/forgot-password')
  })

  it('should have remember me checkbox', () => {
    render(<SignIn />)

    expect(screen.getByLabelText('Remember me')).toBeInTheDocument()
  })

  it('should update email input value', () => {
    render(<SignIn />)

    const emailInput = screen.getByPlaceholderText('m@example.com') as HTMLInputElement
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

    expect(emailInput.value).toBe('test@example.com')
  })

  it('should update password input value', () => {
    render(<SignIn />)

    const passwordInput = screen.getByPlaceholderText('password') as HTMLInputElement
    fireEvent.change(passwordInput, { target: { value: 'mypassword' } })

    expect(passwordInput.value).toBe('mypassword')
  })

  it('should have better-auth credit link', () => {
    render(<SignIn />)

    const creditLink = screen.getByText('better-auth.')
    expect(creditLink.closest('a')).toHaveAttribute('href', 'https://better-auth.com')
    expect(creditLink.closest('a')).toHaveAttribute('target', '_blank')
  })
})
