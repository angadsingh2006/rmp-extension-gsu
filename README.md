# GSU RMP Reg

A Chrome extension that shows Rate My Professors ratings directly inside Georgia State University's course registration portal — so you can see how an instructor is rated without leaving the page you're registering from.

## Why

Registering for classes means constantly alt-tabbing to Rate My Professors to check an instructor before picking a section. This extension pulls that data into the registration table itself, inline, automatically, as the page loads.

## Features

- Automatically detects instructor names as course sections load or filter, with no manual lookup required
- Injects a rating badge (average rating, number of ratings) directly next to each instructor's name
- Toggle to enable/disable the feature from the extension popup, with the setting persisted across sessions
- Fails gracefully — if a professor isn't found or a request fails, the extension doesn't break the page around it

## Tech stack

- **Manifest V3** Chrome extension (service worker background script, not a persistent background page)
- **Vanilla JavaScript** — no frontend framework or build step required
- **MutationObserver** for reacting to the portal's dynamically-loaded, client-side-rendered course table
- **GraphQL** requests to Rate My Professors' public API, made from the extension's service worker to work around cross-origin restrictions
- **`chrome.storage`** for persisting user preferences across browser sessions
- **ESLint** for linting; **Playwright** set up for future end-to-end testing

## Architecture

```
GSU Registration Page                  Rate My Professors
        │                                      ▲
        │  DOM observed by content script      │  GraphQL request
        ▼                                       │
  content.js  ──chrome.runtime.sendMessage──▶  background.js
        │                                       │
        └───────────── rating data ◀────────────┘
        │
        ▼
  badge injected next to instructor name
```

Content scripts can't make cross-origin requests directly (CORS), so all communication with Rate My Professors' API happens in the background service worker, with the two scripts communicating over Chrome's message-passing API.

## Getting started

1. Clone the repo:
   ```bash
   git clone https://github.com/angadsingh2006/rmp-extension-gsu.git
   cd rmp-extension-gsu
   npm install
   ```
2. Load the extension in Chrome:
   - Go to `chrome://extensions`
   - Enable **Developer mode**
   - Click **Load unpacked** and select the `src/` folder
3. Navigate to the GSU registration portal and open a course search — ratings will appear next to instructor names as results load.

## Development

```bash
npm run lint   # run ESLint over src/
```

## Disclaimer

This project is an independent, unofficial tool and is not affiliated with or endorsed by Rate My Professors or Georgia State University. It runs entirely client-side and only reads data already visible to the logged-in user; it does not collect, store, or transmit any personal or academic data.

## License

ISC
