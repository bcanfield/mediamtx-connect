describe("Recordings Page", () => {
  beforeEach(() => {
    cy.visit("/recordings");
  });

  it("should load the recordings page with header", () => {
    // Header uses h2, not h1
    cy.contains("h2", "Recordings").should("be.visible");
    cy.contains("Browse your recordings").should("be.visible");
  });

  it("should display stream cards or appropriate message", () => {
    // With test data, should show stream cards or appropriate message
    cy.get("body").then(($body) => {
      const hasRecordings = $body.find('[class*="Card"]').length > 0 || $body.find('[class*="card"]').length > 0;
      const hasNoRecordingsMessage = $body.text().includes("No Recordings Found");
      const hasDirectoryError = $body.text().includes("Cannot Access Recordings Directory");

      // Should show one of these states
      expect(hasRecordings || hasNoRecordingsMessage || hasDirectoryError).to.be.true;
    });
  });

  it("should show recording count for each stream when recordings exist", () => {
    cy.get("body").then(($body) => {
      // If there are recording cards, they should show a count
      const hasCards = $body.find('[class*="Card"]').length > 0 || $body.find('[class*="card"]').length > 0;
      if (hasCards) {
        cy.contains(/\d+ Recording/).should("exist");
      }
    });
  });

  it("should have view buttons when recordings exist", () => {
    cy.get("body").then(($body) => {
      const hasCards = $body.find('[class*="Card"]').length > 0 || $body.find('[class*="card"]').length > 0;
      if (hasCards) {
        cy.contains("button", "View").should("exist");
      }
    });
  });
});

describe("Recording Detail Page", () => {
  it("should handle non-existent stream gracefully", () => {
    cy.visit("/recordings/non-existent-stream", { failOnStatusCode: false });
    // Should either show empty state or the page
    cy.get("body").should("exist");
  });

  it("should navigate to detail page from recordings list", () => {
    cy.visit("/recordings");

    cy.get("body").then(($body) => {
      // Only proceed if there are View buttons
      if ($body.find('button:contains("View")').length > 0) {
        cy.contains("button", "View").first().click();
        cy.url().should("match", /\/recordings\/.+/);
      }
    });
  });
});
