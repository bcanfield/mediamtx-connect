module.exports = {
    branches: [
      "main",
      {
        name: "beta",
        prerelease: true,
      },
    ],
    plugins: [
      "@semantic-release/commit-analyzer",
      "@semantic-release/release-notes-generator",
      [
        "@semantic-release/changelog",
        {
          changelogFile: "CHANGELOG.md",
        },
      ],
      "@semantic-release/github",
      [
        "@semantic-release/git",
        {
          assets: ["CHANGELOG.md", "package.json"],
        },
      ],
      ["@semantic-release/exec", {
        "prepareCmd": "docker build -t bcanfield/nextstream ."
      }],
      [
        "@semantic-release-plus/docker",
        {
          "name": "bcanfield/nextstream"
        }
      ]
    ],
  };