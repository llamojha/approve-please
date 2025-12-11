# Tech Stack

## Framework & Runtime

- **Next.js 16** with static export (`output: 'export'`)
- **React 19** with functional components and hooks
- **TypeScript** (strict mode enabled)

## Build & Development

```bash
npm run dev          # Start development server
npm run build        # Production build (static export to /out)
npm run start        # Serve production build
npm run lint         # ESLint check
npm run typecheck    # TypeScript type checking
npm run generate:templates  # Rebuild PR template manifest
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
- CSS Modules for component styling (`*.module.css`)
- Named exports for components, default exports for pages

## Static Export

- Configured for relative asset paths (`assetPrefix: './'`)
- Trailing slashes enabled for static hosting compatibility
