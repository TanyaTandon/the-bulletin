/// <reference types="cypress" />
/// <reference types="cypress-axe" />

declare global {
  namespace Cypress {
    interface Chainable {
      checkResponsive(viewports: string[]): Chainable<void>
      checkOverflow(): Chainable<void>
      checkContrast(selector: string): Chainable<void>
      captureStyleIssue(description: string): Chainable<void>
    }
  }
}

// Custom command to test multiple viewports
Cypress.Commands.add('checkResponsive', (viewports: string[]) => {
  viewports.forEach(viewport => {
    if (viewport === 'mobile') {
      cy.viewport(375, 667)
    } else if (viewport === 'tablet') {
      cy.viewport(768, 1024)
    } else if (viewport === 'desktop') {
      cy.viewport(1920, 1080)
    }
    cy.wait(500)
  })
})

// Custom command to check for overflow issues
Cypress.Commands.add('checkOverflow', () => {
  cy.document().then((doc) => {
    const body = doc.body
    const html = doc.documentElement

    const hasHorizontalOverflow = body.scrollWidth > html.clientWidth

    if (hasHorizontalOverflow) {
      cy.log('⚠️ Horizontal overflow detected!')
      cy.screenshot('overflow-issue', { overwrite: true })
    }
  })
})

// Custom command to capture styling issues
Cypress.Commands.add('captureStyleIssue', (description: string) => {
  cy.log(`🔴 Style Issue: ${description}`)
  const timestamp = Date.now()
  cy.screenshot(`style-issue-${timestamp}`, { overwrite: true })
})

// Custom command to check contrast
Cypress.Commands.add('checkContrast', (selector: string) => {
  cy.get(selector).then(($el) => {
    const element = $el[0]
    const styles = window.getComputedStyle(element)
    const bgColor = styles.backgroundColor
    const color = styles.color

    cy.log(`Background: ${bgColor}, Text: ${color}`)
  })
})

export {}
