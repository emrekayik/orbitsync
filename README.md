# Orbitsync

**Your snippets, everywhere.**

Orbitsync is a modern, fast, and local-first snippet management application built with Next.js. It helps you save, search, edit, and organize your code snippets efficiently without any cloud lock-in. 

## Features

- ⚡️ **Instant Search & Filtering**: Fast client-side searching across snippets by title, content, tags, and language.
- 🏷️ **Dynamic Tagging**: Organize your snippets with custom tags for rapid filtering.
- 💻 **Syntax Highlighting**: Real-time editing and highlighting for multiple languages via CodeMirror.
- 🎨 **Modern Animations**: Provide seamless layout transitions and micro-interactions powered by Motion.
- 🔒 **Local-First Sync**: Built on top of [Evolu](https://evolu.dev) to ensure your data is always available locally first. 

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to start building your pocket memory.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org) (App Router)
- **Database:** [Evolu](https://evolu.dev) (Local-first, CRDTs)
- **Editor:** [CodeMirror](https://codemirror.net/)
- **Animations:** [Motion](https://motion.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/)
- **Icons:** [Tabler Icons](https://tabler.io/icons)
