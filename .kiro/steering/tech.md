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

## CSS Migration (In Progress)

The landing page (`pages/index.tsx`) still uses a large `<style jsx>` block that must be extracted to a CSS Module. Some components also use inline `style={}` for static rules that belong in CSS Modules. Dynamic values (progress bars, meter fills) are acceptable as inline styles.
