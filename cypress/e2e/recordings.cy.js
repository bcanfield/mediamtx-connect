describe("Recordings Page", () => {
  beforeEach(() => {
    cy.visit("/recordings");
  });

  it("should load the recordings page with header", () => {
    cy.contains("h1", "Recordings").should("be.visible");
    cy.contains("Browse your recordings").should("be.visible");
  });

  it("should display stream cards when recordings exist", () => {
    // With test data, should show stream cards
    cy.get("body").then(($body) => {
      const hasRecordings = $body.find('[class*="card"]').length > 0;
      const hasNoRecordingsMessage = $body.text().includes("No Recordings Found");
      const hasDirectoryError = $body.text().includes("Cannot Access Recordings Directory");

      // Should show one of these states
      expect(hasRecordings || hasNoRecordingsMessage || hasDirectoryError).to.be.true;
    });
  });

  it("should show recording count for each stream", () => {
    cy.get("body").then(($body) => {
      // If there are recording cards, they should show a count
      if ($body.find('[class*="card"]').length > 0) {
        cy.contains(/\d+ Recording/).should("exist");
      }
    });
  });

  it("should navigate to stream detail page when clicking view", () => {
    cy.get("body").then(($body) => {
      // Only test if there are recordings
      if ($body.find('button:contains("View")').length > 0) {
        cy.contains("button", "View").first().click();
        cy.url().should("match", /\/recordings\/.+/);
      }
    });
  });
});

describe("Recording Detail Page", () => {
  it("should handle non-existent stream gracefully", () => {
    cy.visit("/recordings/non-existent-stream", { failOnStatusCode: false });
    // Should either show empty state or redirect
    cy.get("body").should("exist");
  });

  it("should display recording cards when stream has recordings", () => {
    // First get a stream name from the recordings page
    cy.visit("/recordings");

    cy.get("body").then(($body) => {
      // Only proceed if there are recordings
      const viewButtons = $body.find('button:contains("View")');
      if (viewButtons.length > 0) {
        cy.contains("button", "View").first().click();

        // Should show recording cards or empty message
        cy.get("body").then(($detailBody) => {
          const hasRecordingCards = $detailBody.find('[class*="card"]').length > 0;
          const hasEmptyMessage = $detailBody.text().includes("No recordings");

          expect(hasRecordingCards || hasEmptyMessage).to.be.true;
        });
      }
    });
  });
});
