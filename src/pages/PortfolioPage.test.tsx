import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import PortfolioPage from './PortfolioPage'

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('PortfolioPage', () => {
  it('renders project grid', () => {
    renderWithRouter(<PortfolioPage />)
    
    const grid = screen.queryByTestId('project-grid')
    expect(grid).toBeInTheDocument()
  })

  it('renders filter tabs for categories', () => {
    renderWithRouter(<PortfolioPage />)
    
    // Check for filter buttons - should have "All" button
    expect(screen.getByRole('button', { name: /^all$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^web$/i })).toBeInTheDocument()
  })

  it('renders project cards', () => {
    renderWithRouter(<PortfolioPage />)
    
    // Check for project cards (at least one)
    const cards = screen.queryAllByTestId(/project-card/)
    expect(cards.length).toBeGreaterThan(0)
  })
})

