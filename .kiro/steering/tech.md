# Tech Stack

## Framework & Runtime

- **Next.js 16** (Pages Router, standard server/SSG deployment)
- **React 19** with functional components and hooks
- **TypeScript** (strict mode enabled)

## Build & Development

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Serve production build
npm run lint         # ESLint check
npm run typecheck    # TypeScript type checking
```

## Key Dependencies

- No external UI libraries - vanilla React + CSS Modules
- No state management library - React Context + useReducer pattern

## TypeScript Configuration

- Target: ES5
- Module: ESNext with bundler resolution
- Strict mode enabled
- JSX: react-jsx

## Code Style

- Functional components only (no class components)
- Custom hooks for reusable logic (`use*` prefix)
- CSS Modules for component styling (`*.module.css`) — no `<style jsx>` or inline styles for static rules
- Named exports for components, default exports for pages

## CSS Convention

Component styling uses CSS Modules exclusively. Static rules belong in `*.module.css` files; inline styles are reserved for values computed dynamically at runtime, such as progress widths, meter colors, and state-derived hues.
