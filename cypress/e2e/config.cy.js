describe("Config Page", () => {
  beforeEach(() => {
    cy.visit("/config");
  });

  it("should load the config page", () => {
    cy.url().should("include", "/config");
  });

  it("should display configuration form fields", () => {
    // Check for main config fields (note: labels use "MediaMtx" not "MediaMTX")
    cy.contains("MediaMtx Url").should("exist");
    cy.contains("MediaMtx Api Port").should("exist");
  });

  it("should have input fields in the form", () => {
    // Form should have inputs
    cy.get("form").should("exist");
    cy.get("form input").should("have.length.at.least", 2);
  });

  it("should have a save/update button", () => {
    cy.get('button[type="submit"]').should("exist");
    cy.contains("button", "Submit").should("exist");
  });

  it("should allow editing form fields", () => {
    // Get the first input and verify it's editable
    cy.get("form input").first().should("not.be.disabled");
  });

  it("should display form descriptions", () => {
    // Form should have descriptive text
    cy.contains("The address to your MediaMTX Instance").should("exist");
  });
});

describe("Config Navigation", () => {
  it("should have navigation when on config pages", () => {
    cy.visit("/config");
    // Should have links to other pages
    cy.contains("a", "Recordings").should("exist");
  });

  it("should navigate back to home from config", () => {
    cy.visit("/config");
    // The home link shows "Connect" text
    cy.contains("a", "Connect").click({ force: true });
    cy.url().should("eq", Cypress.config().baseUrl + "/");
  });
});
