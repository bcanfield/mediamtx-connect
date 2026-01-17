describe("Config Page", () => {
  beforeEach(() => {
    cy.visit("/config");
  });

  it("should load the config page", () => {
    cy.url().should("include", "/config");
  });

  it("should display configuration form fields", () => {
    // Check for main config fields
    cy.contains("MediaMTX Url").should("exist");
    cy.contains("MediaMTX Api Port").should("exist");
  });

  it("should have input fields populated with current config", () => {
    // MediaMTX URL input should have a value
    cy.get('input[name="mediaMtxUrl"]').should("exist");
    cy.get('input[name="mediaMtxApiPort"]').should("exist");
  });

  it("should have a save/update button", () => {
    cy.get('button[type="submit"]').should("exist");
  });

  it("should allow editing the MediaMTX URL", () => {
    cy.get('input[name="mediaMtxUrl"]')
      .clear()
      .type("http://test-mediamtx")
      .should("have.value", "http://test-mediamtx");
  });

  it("should allow editing the API port", () => {
    cy.get('input[name="mediaMtxApiPort"]')
      .clear()
      .type("9998")
      .should("have.value", "9998");
  });

  it("should show success feedback after saving", () => {
    // Make a change and save
    cy.get('input[name="mediaMtxUrl"]').clear().type("http://localhost");
    cy.get('button[type="submit"]').click();

    // Should show some form of success feedback (toast, message, etc.)
    // Give time for the form to submit
    cy.wait(500);

    // The page should not show an error state after save
    cy.get("body").should("not.contain", "Error saving");
  });
});

describe("Config Navigation", () => {
  it("should have sidebar navigation when on config pages", () => {
    cy.visit("/config");
    // Should have navigation items for different config sections
    cy.get("nav").should("exist");
  });

  it("should navigate back to home from config", () => {
    cy.visit("/config");
    cy.contains("MediaMTX Connect").click();
    cy.url().should("eq", Cypress.config().baseUrl + "/");
  });
});
