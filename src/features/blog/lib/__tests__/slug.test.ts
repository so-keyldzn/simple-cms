import { describe, it, expect } from 'vitest'

// Fonction extraite de post-actions.ts pour les tests
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

describe('Slug Generation', () => {
  it('should convert basic title to slug', () => {
    expect(generateSlug('Hello World')).toBe('hello-world')
  })

  it('should handle accents correctly', () => {
    expect(generateSlug('Café Français')).toBe('cafe-francais')
    expect(generateSlug('Español')).toBe('espanol')
    expect(generateSlug('Über uns')).toBe('uber-uns')
  })

  it('should handle special characters', () => {
    expect(generateSlug('Hello & World!')).toBe('hello-world')
    expect(generateSlug('Test@#$%Title')).toBe('test-title')
    expect(generateSlug('Article: The Best Guide')).toBe('article-the-best-guide')
  })

  it('should handle multiple spaces', () => {
    expect(generateSlug('Hello    World')).toBe('hello-world')
    expect(generateSlug('Multiple   Spaces   Here')).toBe('multiple-spaces-here')
  })

  it('should remove leading and trailing dashes', () => {
    expect(generateSlug('  Hello World  ')).toBe('hello-world')
    expect(generateSlug('---Title---')).toBe('title')
    expect(generateSlug('!!Start and End!!')).toBe('start-and-end')
  })

  it('should handle numbers', () => {
    expect(generateSlug('Top 10 Tips')).toBe('top-10-tips')
    expect(generateSlug('2024 Guide')).toBe('2024-guide')
  })

  it('should handle empty or whitespace-only strings', () => {
    expect(generateSlug('')).toBe('')
    expect(generateSlug('   ')).toBe('')
    expect(generateSlug('---')).toBe('')
  })

  it('should handle French characters', () => {
    expect(generateSlug('Événement à Paris')).toBe('evenement-a-paris')
    expect(generateSlug('L\'été en France')).toBe('l-ete-en-france')
  })

  it('should handle long titles', () => {
    const longTitle = 'This is a very long title with many words that should be converted to a slug'
    expect(generateSlug(longTitle)).toBe('this-is-a-very-long-title-with-many-words-that-should-be-converted-to-a-slug')
  })

  it('should be idempotent', () => {
    const title = 'Test Title'
    const slug = generateSlug(title)
    expect(generateSlug(slug)).toBe(slug)
  })
})
