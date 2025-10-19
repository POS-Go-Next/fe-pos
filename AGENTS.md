# Agent Guidelines for fe-pos

## Build/Lint/Test Commands
- **Build**: `npm run build` (Next.js production build)
- **Lint**: `npm run lint` (Next.js ESLint with core web vitals)
- **Type Check**: `npx tsc --noEmit` (TypeScript strict mode)
- **Dev Server**: `npm run dev` (Next.js development server)
- **No test framework configured** - run lint/typecheck after changes

## Code Style Guidelines

### Framework & Language
- Next.js 14 with App Router
- TypeScript with strict mode enabled
- React 18 with functional components

### File Structure & Naming
- Components: PascalCase (e.g., `Button.tsx`, `UserDialog.tsx`)
- Hooks: camelCase with "use" prefix (e.g., `useAuth.ts`, `useTransaction.ts`)
- API routes: `route.ts` in app directory structure
- Types: PascalCase interfaces (e.g., `UserData`, `LoginResponse`)
- Utility files: kebab-case (e.g., `api-utils.ts`, `client-utils.ts`)

### Imports
- React imports first
- Third-party libraries second
- Local imports last with path mapping (`@/*` → `./src/*`)
- Group imports by type with blank lines

### Styling
- Tailwind CSS with custom design system
- CSS variables for theme colors
- `class-variance-authority` for component variants
- `cn()` utility for className merging
- Radix UI primitives for accessibility

### Error Handling
- Centralized error handling in `@/lib/error-utils`
- `ApiError` class for structured API errors
- `try/catch` blocks with `instanceof` checks
- Zod schemas for validation

### TypeScript
- Strict mode enabled
- Interface definitions for complex types
- Generic types where appropriate
- Proper typing for API responses
- Shared types in `/src/types/` directory

### React Patterns
- `React.forwardRef` for components needing refs
- Custom hooks for shared logic
- Client components marked with `"use client"` directive
- Props interfaces extending React component types

## Utility Libraries & Architecture

### API Route Utilities (`@/lib/api-utils`)
**ALWAYS use these utilities for new API routes instead of writing custom implementations:**

```typescript
import { createApiHandler, createGetHandler, createPostHandler, createPaginatedGetHandler } from "@/lib/api-utils";

// Standard pattern for simple routes
const handler = createApiHandler({
  GET: createGetHandler("/endpoint"),
  POST: createPostHandler("/endpoint")
});

// For paginated endpoints
const handler = createApiHandler({
  GET: createPaginatedGetHandler("/endpoint", {
    defaultParams: { limit: "10" },
    validateResponse: (data) => !!data.docs
  })
});
```

**Available utilities:**
- `createApiHandler()` - Main handler wrapper with error handling
- `createGetHandler()` - Simple GET endpoint with query params
- `createPostHandler()` - POST endpoint with JSON body
- `createPaginatedGetHandler()` - GET with pagination support
- `authenticatedFetch()` - Authenticated external API calls
- `getAuthToken()` - Extract auth token from request/cookies

### Hook Utilities (`@/lib/hook-utils`)
**Use `usePaginatedApi` for all paginated data fetching:**

```typescript
import { usePaginatedApi } from "@/lib/hook-utils";

const { data, loading, error, fetchMore, refetch } = usePaginatedApi<DataType>({
  endpoint: "/api/endpoint",
  limit: 10,
  dependencies: [searchTerm], // Re-fetch when these change
  enabled: true
});
```

### Client Utilities (`@/lib/client-utils`)
**Use for client-side API calls:**

```typescript
import { clientFetch } from "@/lib/client-utils";

const response = await clientFetch("/api/endpoint", {
  method: "POST",
  body: JSON.stringify(data)
});
```

### Error Utilities (`@/lib/error-utils`)
```typescript
import { handleApiError, isApiError } from "@/lib/error-utils";

try {
  // API call
} catch (error) {
  const message = handleApiError(error);
  // Handle error with user-friendly message
}
```

## API Route Patterns

### Standard Route Structure
```typescript
import { createApiHandler, createGetHandler, createPostHandler } from "@/lib/api-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handler = createApiHandler({
  GET: createGetHandler("/external-endpoint"),
  POST: createPostHandler("/external-endpoint")
});

export const GET = handler;
export const POST = handler;
```

### Routes with Special Logic
Only write custom implementations for routes that require:
- Custom authentication logic (like `/api/user`)
- Local service communication (like `/api/system-info`)
- Complex business logic not covered by utilities
- Dynamic route parameters with special handling

### Legacy vs Refactored Routes
- **Use utilities**: New routes and simple CRUD operations
- **Custom logic**: Complex routes in `[device_id]`, authentication, specialized business logic
- **Avoid**: Manual authentication, error handling, and fetch logic when utilities exist

### API Route Conversion Status (Updated: Oct 2025)
**Converted Routes (22/29 - 76% coverage):**
- All simple CRUD operations use utility patterns
- All dynamic parameter routes converted
- ~90% code reduction across converted routes

**Complex Business Logic Routes (7 routes - intentionally unconverted):**
- `/api/transaction/route.ts` - Complex transaction creation with business rules
- `/api/auth/login/route.ts` - Custom session management and authentication
- `/api/auth/fingerprint/route.ts` - Hardware biometric integration
- `/api/user/route.ts` - Special authentication token handling
- `/api/fingerprint/validate/route.ts` - Biometric validation logic
- `/api/fingerprint/setup/route.ts` - Hardware enrollment workflows
- `/api/system-info/route.ts` - Local system service communication

## Hooks Architecture

### Custom Hooks
- Use `usePaginatedApi` for paginated data (replaces manual pagination logic)
- Custom hooks should focus on business logic, not API mechanics
- Leverage utility hooks in `@/lib/hook-utils`

### Hook Dependencies
- Always specify `dependencies` array for automatic re-fetching
- Use `enabled` flag for conditional fetching
- Proper cleanup with abort controllers (handled by utilities)

## Security
- HTTP-only cookies for auth tokens
- Input validation with Zod
- No secrets in client code
- Authentication handled by utility functions

## Development Guidelines

### When Creating New Features
1. **Check utilities first** - Don't recreate patterns that exist
2. **Use utility libraries** - API routes, hooks, client calls
3. **Follow patterns** - Look at recently refactored files for examples
4. **Centralize logic** - Add to utilities if pattern repeats 3+ times

### Code Review Checklist
- [ ] Uses appropriate utility functions
- [ ] Follows established patterns
- [ ] No duplicate authentication/error handling
- [ ] TypeScript types properly defined
- [ ] Build and typecheck pass</content>
<parameter name="filePath">/home/imyourdream/Work/roxy/fe-pos/AGENTS.md