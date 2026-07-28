# Kanban Task Board with Drag & Drop

A production-quality Kanban board built with **HTML5, CSS3 and vanilla JavaScript (ES6+)** —
no frameworks, no CSS libraries, no drag-and-drop dependencies.

## Features

- **Three columns** — To Do, In Progress, Done
- **Full task CRUD** — add, edit and delete with a confirmation dialog
- **Native HTML5 Drag & Drop** — move tasks between columns and reorder inside a column,
  with live drop indicators and a dragging state
- **LocalStorage persistence** — tasks, edits, column and order survive a refresh
- **Fetch API quote banner** — random motivational quote, loading state, graceful error
  fallback and a "New quote" button
- **Event delegation** — a handful of listeners on the board handle every card's edit,
  delete, drag and keyboard interactions
- **Rich task cards** — title, description, priority badge, due date (overdue highlighting),
  category chip, created time, drag handle and hover animation
- **Accessible** — semantic landmarks, ARIA labels, live region announcements, visible focus
  states, Escape-to-close modals and arrow-key task moving
- **Responsive** — CSS Grid + Flexbox + media queries, no horizontal scrolling
- **Extras** — today's date, board stats, clear-done action, back-to-top button

## Technologies

HTML5 · CSS3 (custom properties, Grid, Flexbox) · JavaScript ES6 modules
(`const`/`let`, arrow functions, template literals, destructuring, spread, array/object methods)
· LocalStorage API · Fetch API + AbortController · HTML5 Drag and Drop API

## Folder structure

```
kanban-board/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── app.js      # entry point: state, delegated events, wiring
│   ├── storage.js  # LocalStorage read/write, ids, seed data
│   ├── ui.js       # rendering (DocumentFragment based)
│   ├── drag.js     # native drag & drop via delegation
│   └── api.js      # Fetch API quote service
├── assets/
└── README.md
```

## How to run

Because the app uses ES modules, open it over HTTP (not `file://`):

```bash
cd kanban-board
npx serve .          # or: python3 -m http.server 8000
```

Then visit `http://localhost:3000` (or `:8000`).

Inside this Lovable project the board is served at `/kanban-board/index.html`
and embedded on the home page (`/`).

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `Tab` | Move between cards and controls |
| `Enter` (on a card) | Edit the task |
| `←` / `→` (on a card) | Move the task to the previous/next column |
| `Esc` | Close any open dialog |