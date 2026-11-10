import React from 'react'
import { bootstrap } from './bootstrap'

const mockRender = jest.fn()
const mockCreateRoot = jest.fn((_container: Element | DocumentFragment) => ({
  render: mockRender
}))

jest.mock('react-dom/client', () => ({
  createRoot: (container: Element | DocumentFragment) => mockCreateRoot(container)
}))

describe('main', () => {
  beforeEach(() => {
    mockCreateRoot.mockClear()
    mockRender.mockClear()
  })

  it('should mount the app in StrictMode on the root element', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    bootstrap(container)

    expect(mockCreateRoot).toHaveBeenCalledWith(container)
    expect(mockRender).toHaveBeenCalledTimes(1)

    const appTree = mockRender.mock.calls[0][0]
    expect(appTree.type).toBe(React.StrictMode)
    expect(appTree.props.children.type.name).toBe('App')
  })
})
