# Contributing to MediaMTX Connect

Thank you for your interest in contributing! This guide will help you set up your development environment and understand our testing approach.

## Development Setup

### Quick Start

The fastest way to get started is using the setup script:

```bash
# Clone the repository
git clone https://github.com/bcanfield/mediamtx-connect.git
cd mediamtx-connect

# Run the complete setup
npm run setup
```

This script will:
1. Install npm dependencies
2. Generate Prisma client
3. Run database migrations
4. Seed the database with development config
5. Create test data (mock recordings)

### Manual Setup

If you prefer to run steps individually:

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed the database
npm run db:seed

# Create test data
npm run setup:test-data
```

### Starting the Development Server

```bash
npm run dev
```

The app will be available at http://localhost:3000

## Running Without MediaMTX

The app is designed to handle the absence of MediaMTX gracefully:

- **Streams page**: Shows a "Cannot connect to MediaMTX" message with debugging info
- **Recordings page**: Works fully with the test data
- **Config page**: Works fully for editing settings

This makes it easy to develop and test most features without running MediaMTX.

## Running With MediaMTX

To test stream-related features, start MediaMTX:

```bash
# Start just MediaMTX
docker compose up mediamtx -d

# Or start everything
docker compose up -d
```

Then start test streams:

```bash
npm run start-test-streams
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run setup` | Complete development setup |
| `npm run setup:test-data` | Create mock recordings only |
| `npm run db:seed` | Seed database with dev config |
| `npm run db:reset` | Reset database (destructive) |
| `npm run test:e2e` | Run Playwright e2e tests |
| `npm run test:e2e:dev` | Open Playwright UI |

## Project Structure

```
mediamtx-connect/
├── app/                    # Next.js App Router pages
│   ├── _actions/          # Server actions
│   ├── _components/       # Page-specific components
│   ├── api/               # API routes
│   ├── config/            # Config pages
│   └── recordings/        # Recordings pages
├── components/            # Shared UI components
├── tests/e2e/             # Playwright E2E tests
├── lib/                   # Utilities and clients
│   ├── MediaMTX/         # MediaMTX API types
│   └── prisma.ts         # Prisma client
├── prisma/               # Database schema and migrations
│   ├── schema.prisma
│   └── seed.ts           # Database seeding
├── scripts/              # Development scripts
│   ├── setup-dev.sh      # Full setup script
│   └── setup-test-data.sh # Test data creation
└── test-data/            # Generated test data (gitignored)
    ├── recordings/       # Mock video files
    └── screenshots/      # Mock thumbnails
```

## Testing

### E2E Tests

We use Playwright for end-to-end testing. Tests are organized by feature:

- `streams.spec.ts` - Streams page tests
- `recordings.spec.ts` - Recordings page tests
- `config.spec.ts` - Configuration page tests
- `api.spec.ts` - API endpoint tests
- `mediamtx.spec.ts` - MediaMTX connectivity tests

Run tests:

```bash
# Headless
npm run test:e2e

# With Playwright UI
npm run test:e2e:dev
```

### Test Data

The setup script creates mock recordings in `test-data/`:

- 3 streams: camera1, camera2, living-room
- Multiple recordings per stream
- Pre-generated screenshots for some recordings

### Writing Tests

Tests should be resilient to different states:

```typescript
// Good: Handle multiple possible states
const cardCount = await page.locator('[class*="card"]').count()
const hasEmptyMessage = await page.getByText('No Recordings').isVisible()
expect(cardCount > 0 || hasEmptyMessage).toBe(true)

// Avoid: Assuming specific state
await expect(page.locator('[class*="card"]')).toHaveCount(3) // Brittle
```

## Database

We use SQLite with Prisma ORM. The database stores app configuration only.

```bash
# View database in Prisma Studio
npx prisma studio

# Reset and re-seed
npm run db:reset
npm run db:seed
```

## Code Style

- Use TypeScript for type safety
- Follow existing patterns in the codebase
- Run `npm run lint` before committing

## Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run tests: `npm run test:e2e`
5. Run lint: `npm run lint`
6. Commit with a clear message
7. Push and create a Pull Request

## Questions?

Open an issue on GitHub if you have questions or need help getting started.
