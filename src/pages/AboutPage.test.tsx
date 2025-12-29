import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import AboutPage from './AboutPage'

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('AboutPage', () => {
  it('renders timeline section', () => {
    renderWithRouter(<AboutPage />)
    
    const timeline = screen.queryByTestId('developer-timeline')
    expect(timeline).toBeInTheDocument()
  })

  it('renders personal introduction section', () => {
    renderWithRouter(<AboutPage />)
    
    // Check for introduction heading
    expect(screen.getByRole('heading', { name: /introduction/i })).toBeInTheDocument()
  })

  it('renders skills/technologies grid', () => {
    renderWithRouter(<AboutPage />)
    
    // Check for skills section heading
    expect(screen.getByRole('heading', { name: /skills & technologies/i })).toBeInTheDocument()
  })
})

