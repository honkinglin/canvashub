# CanvasHub

CanvasHub is a modern gallery of beautiful, interactive HTML5 canvas backgrounds built with React and Tailwind CSS v4.

## Features

- **Interactive Backgrounds:** Browse various background demos such as Network Particles, Ocean Waves, and Fluid Gradients.
- **Real-time Customization:** Tweak particle counts, wave speeds, and gradient colors in real time using an intuitive configuration panel.
- **Copy & Paste Code:** Find a design you like? Copy the generated React source code directly from the UI and paste it into your own projects!

## Architecture

The project abstracts canvas interactions using a generic `<CanvasBackground />` component. Each background is treated as an independent module that exports its own configuration schema, sensible defaults, inner rendering loop, and source-code generator.

### Adding New Backgrounds
1. Create a module under `src/backgrounds/{name}/index.ts`.
2. Implement your type definitions and rendering loop.
3. Export a `BackgroundModule` object exposing your configuration structure.
4. Register the module in `src/backgrounds/index.ts`.

## Local Development

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

## Tech Stack
- React 19 + Vite
- TypeScript
- Tailwind CSS v4
- Prism-react-renderer (Syntax highlighting)
- Lucide React (Icons)
- Shadcn/ui (UI components)
