import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('render app component', () => {
    render(<App />)
    expect(screen.getByText('Criado com Alquimia e Flora.ds')).toBeDefined()
    expect(screen.getByText('app name: test-app')).toBeInTheDocument()

    const logo = screen.getByTestId('logo')
    expect(logo).toHaveAttribute('width')
    expect(logo).toHaveAttribute('height')
    expect(logo.getAttribute('width')).toBe('100')
    expect(logo.getAttribute('height')).toBe('100')
    expect(screen.getByTestId('logo')).toBeInTheDocument()
  })
})
