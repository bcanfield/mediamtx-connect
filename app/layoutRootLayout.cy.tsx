import React from 'react'
import RootLayout from './layout'

describe('<RootLayout />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<RootLayout />)
  })
})