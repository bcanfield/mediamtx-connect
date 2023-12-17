describe("home page load", () => {
  it("passes", () => {
    cy.visit("http://localhost:3000");
    cy.contains("Streams").should("exist");
  });
});
