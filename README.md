# Puppeteer Reservation Checker

Uses [Puppeteer](https://pptr.dev/) to check reservation slots and notify when available.

## Structure

- [package.json](package.json): Scripts and dependencies.
- [tsconfig.json](tsconfig.json): TypeScript settings.
- [src/index.ts](src/index.ts): Main entry, runs the reservation check.
- [src/types.ts](src/types.ts): Types for reservation handling.
- [src/utils/index.ts](src/utils/index.ts): Collection of helper utilities.
- [.env](.env): Environment variable settings.

## Setup

1. Copy `.env.example` to `.env`and fill values.
2. Install:
   ```sh
   npm install
   ```
3. Run:
   ```sh
   npm run start
   ```

## Usage

The script periodically checks reservations in the [`main`](src/index.ts) function and sends notifications via [`notify`](src/utils/notification.ts). Logs are stored in assets.
Logs are stored in the `dist/assets/logs.txt` file, and screenshots are saved in the `dist/assets/screenshots` folder.
