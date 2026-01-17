describe("Streams Page", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should load the streams page with header", () => {
    // Header uses h2, not h1
    cy.get("h2").contains("Streams").should("exist");
  });

  it("should show subheader text", () => {
    cy.contains("Live views of your active streams").should("exist");
  });

  it("should handle MediaMTX connection gracefully when not available", () => {
    // When MediaMTX is not running, should show connection error or config prompt
    cy.get("body").then(($body) => {
      const bodyText = $body.text();
      // Either shows connection error or prompts to configure
      const hasConnectionError = bodyText.includes("Cannot connect to MediaMTX");
      const hasConfigPrompt = bodyText.includes("Configure Remote URL");
      const hasNoStreams = bodyText.includes("No Active Streams");

      // One of these states should be true
      expect(hasConnectionError || hasConfigPrompt || hasNoStreams).to.be.true;
    });
  });

  it("should have working navigation to config page", () => {
    // Click on any link containing Config
    cy.contains("a", "Config").click({ force: true });
    cy.url().should("include", "/config");
  });

  it("should have working navigation to recordings page", () => {
    // Click on any link containing Recordings
    cy.contains("a", "Recordings").click({ force: true });
    cy.url().should("include", "/recordings");
  });
});
