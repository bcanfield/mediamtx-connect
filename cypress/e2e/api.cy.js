describe("Health Check API", () => {
  it("should return healthy status when database is connected", () => {
    cy.request("/api/health").then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property("status", "healthy");
      expect(response.body).to.have.property("timestamp");
      expect(response.body).to.have.property("database", "connected");
    });
  });

  it("should include a valid timestamp", () => {
    cy.request("/api/health").then((response) => {
      const timestamp = new Date(response.body.timestamp);
      expect(timestamp).to.be.a("date");
      expect(timestamp.getTime()).to.not.be.NaN;
    });
  });
});

describe("API Error Handling", () => {
  it("should handle non-existent API routes", () => {
    cy.request({
      url: "/api/non-existent-endpoint",
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
  });

  it("should handle screenshot request for non-existent stream", () => {
    cy.request({
      url: "/api/non-existent-stream/first-screenshot",
      failOnStatusCode: false,
    }).then((response) => {
      // Should return 404 or appropriate error
      expect(response.status).to.be.oneOf([404, 500]);
    });
  });
});
