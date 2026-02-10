# ccli — Chat Command Line Interface

A terminal-based real-time chat built with TypeScript and WebSockets.

## Quick Start (via npm)

Install and run the client directly from your terminal:

```bash
npm install -g "@bruggmann._/ccli"
ccli
```

Or run without installing:

```bash
npx "@bruggmann._/ccli"
```

> **Note:** On PowerShell, wrap the package name in quotes as shown above.

## Features

- Real-time messaging via WebSockets
- Multiple channels with persistent message history
- Live nickname changes
- Interactive menu with ASCII art
- Input validation with Zod

## Project Structure

```
packages/
  shared/   → Schemas, types, and utilities shared between client and server
  server/   → WebSocket server (state management, command handling)
  client/   → Terminal client (UI, menus, chat prompt)
```

## Getting Started

### Prerequisites

- Node.js
- pnpm (or npm, yarn, etc.)

### Install

```bash
pnpm install
```

### Run

Start the server:

```bash
pnpm server
```

In another terminal, start one or more clients:

```bash
pnpm client
```

## Chat Commands

| Command            | Description                                      |
| ------------------ | ------------------------------------------------ |
| `/home`            | Leave the current channel and return to the menu |
| `/join <channel>`  | Join another channel (creates it if needed)      |
| `/nick <nickname>` | Change your nickname                             |
| `/exit`            | Exit the program                                 |

## Tech Stack

- **TypeScript** — Language
- **ws** — WebSocket server and client
- **Zod** — Schema validation
- **@inquirer/prompts** — Interactive terminal prompts
- **nodemon** — Dev server auto-restart
