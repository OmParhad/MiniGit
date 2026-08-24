## MiniGit

A lightweight documentation workspace for organizing project documentation in one place.

MiniGit lets you create projects, add documentation pages, edit them with Markdown, and view formatted documentation with support for common technical writing features.

## Features

* Create and manage projects
* Create multiple documentation pages inside each project
* Markdown-based documentation editor
* Markdown preview
* Syntax-highlighted code blocks
* LaTeX mathematical expressions
* Tables
* Images
* Links
* Markdown formatting toolbar
* Previous/Next documentation page navigation
* Edit and delete documentation pages
* Local backend API for project and page management

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* React Markdown
* remark-gfm
* rehype-highlight

### Backend

* Node.js
* Express
* TypeScript
* REST API

## Project Structure

```text
mGit/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   └── Dashboard.tsx
│   │   ├── components/
│   │   ├── App.tsx
│   │   └── index.css
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   └── server.ts
│   └── package.json
│
└── README.md
```

> The exact folder structure may change as the project develops.

## Running Locally

Clone the repository:

```bash
git clone <repository-url>
cd mGit
```

Install dependencies for the frontend and backend.

Start the backend:

```bash
npm run dev
```

Start the frontend:

```bash
npm run dev
```

The frontend communicates with the local backend API running on port `5000`.

## Documentation

A project can contain multiple documentation pages. Each page can contain Markdown such as:

````markdown
# Getting Started

## Installation

```bash
npm install
npm run dev
````

## Example

This is **bold text**, and this is *italic text*.

| Feature           | Status |
| ----------------- | ------ |
| Markdown          | ✓      |
| Code highlighting | ✓      |
| LaTeX             | ✓      |

```

LaTeX expressions can also be included in documentation.

## Current Status

MiniGit is currently an active personal project.

The core project and documentation workflow Is functional. The UI is still being polished, and the project is being prepared for its first public GitHub release and deployment.

## Roadmap

- Improve overall UI/UX
- Improve Documentation editor
- Improve image handling
- Add more documentation-management features
- Deploy the application
- Continue improving the project based on usage


## License

Copyright (c) 2026 Om Parhad. All rights reserved.

MiniGit is publicly available for viewing and evaluation, but the source
code may not be copied, modified, distributed, or reused without
explicit permission from the copyright holder.
```
