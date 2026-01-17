describe("Streams Page", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should load the streams page with header", () => {
    cy.contains("h1", "Streams").should("be.visible");
    cy.contains("Live views of your active streams").should("be.visible");
  });

  it("should show navigation menu", () => {
    cy.contains("Recordings").should("be.visible");
    cy.contains("Config").should("be.visible");
  });

  it("should handle MediaMTX connection gracefully when not available", () => {
    // When MediaMTX is not running, should show connection error or config prompt
    cy.get("body").then(($body) => {
      // Either shows connection error or prompts to configure
      const hasConnectionError = $body.text().includes("Cannot connect to MediaMTX");
      const hasConfigPrompt = $body.text().includes("Configure Remote URL");
      const hasNoStreams = $body.text().includes("No Active Streams");

      // One of these states should be true
      expect(hasConnectionError || hasConfigPrompt || hasNoStreams).to.be.true;
    });
  });

  it("should have working navigation to config page", () => {
    cy.contains("Config").click();
    cy.url().should("include", "/config");
  });

  it("should have working navigation to recordings page", () => {
    cy.contains("Recordings").click();
    cy.url().should("include", "/recordings");
  });
});
