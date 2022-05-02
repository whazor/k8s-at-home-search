/// <reference types="cypress" />

describe('k8s at home search', () => {
    beforeEach(() => {
      cy.visit('http://localhost:4173/k8s-at-home-search/')
    })
  
    it('should have word search', () => {
      cy.get('a.word-cloud-word').should('have.length.gte', 50)
    })
  
    it('should have functional search', () => {
      cy.get('input.search-field').type(`plex{enter}`)

      cy.get('table.search-results tbody tr')
        .should('have.length.gte', 20)
        .first()
        .children(".release-name")
        .should('contain', "plex")
    })
  })
  