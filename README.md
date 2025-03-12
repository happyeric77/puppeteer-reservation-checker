# Puppeteer Reservation Checker

This project uses [Puppeteer](https://pptr.dev/) to check reservation availability on a given website and notify when slots are open.

## Project Structure

- [package.json](package.json): Defines scripts and dependencies.
- [tsconfig.json](tsconfig.json): TypeScript configuration.
- [src/index.ts](src/index.ts): Entry point that launches Puppeteer in the [`main`](src/index.ts) function.
- [src/types.ts](src/types.ts): Contains enums like [`Availability`](src/types.ts) and [`ReservationPeriod`](src/types.ts).
- [src/utils.ts](src/utils.ts): Includes helper functions like [`notify`](src/utils.ts) for sending notifications and [`getScreenShot`](src/utils.ts) for saving screenshots.
- [.env](.env): Stores environment variables (e.g., `LINE_CHANNEL_SECRET`).

## Getting Started

1. Configure your environment variables by renaming `.env.example` to `.env` and filling in the required values.

2. Install dependencies:

   ```sh
   npm install
   ```

3. Build and run the project:
   ```sh
   npm run start
   ```

## Usage

The main process runs indefinitely and periodically checks reservations:

- Edits to the [`Props`](src/types.ts) interface in [src/types.ts](src/types.ts) let you customize the reservation options.
- Set the desired reservation period in [src/index.ts](src/index.ts).
- Whenever a reservation becomes available, a notification is sent using the [`notify`](src/utils.ts) function, and a screenshot is stored in the assets folder.

For any errors, logs and timestamps are appended to [assets/logs.txt](assets/logs.txt).
