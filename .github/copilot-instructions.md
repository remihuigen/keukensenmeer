# Keukensenmeer.nl Development Instructions for Copilot

## Purpose

This project is a **Nuxt 4 with TypeScript** application deployed on **NuxtHub (Cloudflare Workers)**, using **Nuxt UI Pro** for components and **D1 Database** for data persistence. The site serves as a kitchen showroom website with CMS capabilities, product catalogs, and contact forms.

Copilot should generate code that fits seamlessly into this edge-first, serverless setup, respecting CI, linting, and release rules.

---

## Project Architecture

### Tech Stack
- **Framework**: Nuxt 4 (latest) with TypeScript
- **Deployment**: NuxtHub on Cloudflare Workers (edge runtime)
- **UI**: Nuxt UI Pro + Tailwind CSS
- **Images**: Nuxt Image & Cloudinary for optimization
- **Plausible Analytics**: for privacy-focused tracking


### Key Features
- **SEO optimization** with meta tags and structured data
- **Responsive design** with mobile-first approach


---

## File Structure & Conventions

### Core Directories
```
/
├── nuxt.config.ts         # Nuxt configuration with modules
├── server/
│   ├── api/               # API endpoints
│   │   ├── handlers/      # API route handlers
│   ├──middleware/         # Server middleware
│   │   ├── handlers/      # Middleware handlers
├── app/                   # Client-side code
│   ├── app.vue            # Root layout component
│   ├── error.vue          # Root error component
│   ├── app.config.ts      # App-level configuration
│   ├── composables/       # Vue composables
│   ├── components/        # Vue components
│   ├── assets/            # Assets that get processed
│   ├── pages/             # File-based routing
│   ├── layouts/           # Layout components
│   ├── middleware/        # Route middleware
│   ├── plugins/           # Nuxt plugins
│   ├── utils/             # App utilities
├── public/                # Static files
├── shared/                # Shared code between server and client
│   ├── types/             # TypeScript types and interfaces
│   ├── utils/             # Shared utilities
```

### Naming Conventions
- **Components**: PascalCase (e.g., `ProductCard.vue`)
- **Composables**: camelCase with `use` prefix (e.g., `useProducts.ts`)
- **API routes**: kebab-case (e.g., `/api/product-categories`)
- **Utilities**: camelCase (e.g., `formatPrice.ts`)

---

## General Rules

### Type Safety
* **No `any` types**: Always use precise, inferred, or narrowed types
* **API responses**: Define proper TypeScript interfaces
* **Form validation**: Use Zod schemas for runtime validation

### Documentation
* **Full TSDoc for exports**: Every exported function, composable, component, and API route must include detailed TSDoc
* **Include**: `@param`, `@returns`, `@example`, `@throws` where relevant
* **API endpoints**: Document request/response formats and status codes

### Edge Runtime Compatibility
* **Web-standard APIs only**: Use `fetch`, `URL`, `crypto.subtle`, `FormData`
* **No Node.js built-ins**: Avoid `fs`, `path`, `process`, `Buffer`
* **Environment**: Access via `process.env` only in server context, but prefer `useRuntimeConfig()`

### Nuxt Conventions
* **Business logic**: Place in `/composables` directory
* **Server logic**: Use `/server/api` or `/server/routes`
* **UI components**: Build with Nuxt UI Pro components
* **Images**: Use `@nuxt/image` with Cloudflare Images provider
* **SEO**: Implement via `@nuxtjs/seo` with `useSeoMeta`

---

### API Security
- **Input validation**: Use Zod schemas for all inputs
- **CORS**: Configure properly for admin interface
- **Error handling**: Never expose internal errors to client

---

## Component Guidelines

### Nuxt UI Pro Integration
```vue
<!-- Use Nuxt UI Pro components consistently -->
<template>
  <UCard>
    <template #header>
      <h3 class="text-lg font-semibold">{{ title }}</h3>
    </template>
    
    <UButton
      color="primary"
      variant="solid"
      @click="handleAction"
    >
      {{ $t('common.save') }}
    </UButton>
  </UCard>
</template>
```

### State Management
- **Local state**: Use `ref()` and `reactive()`
- **Global state**: Use `useState()` for cross-component data
- **Server state**: Use composables with proper caching

### Performance
- **Lazy loading**: Use `defineAsyncComponent` or `LazyComponentName` for heavy components
- **Image optimization**: Always use `<NuxtImg>` with proper sizing
- **Bundle splitting**: Keep admin components separate from public
- **Caching**: Implement proper cache headers for static content

---

## API Development

### Route Structure
```typescript
// /server/api/products/[id].get.ts
export default defineEventHandler(async (event) => {
  // Validate parameters
  const id = getRouterParam(event, 'id')
  const productId = z.string().uuid().parse(id)
  
  // Database operation
  const product = await getProductById(productId)
  
  // Return typed response
  return {
    data: product,
    meta: {
      timestamp: new Date().toISOString()
    }
  }
})
```

### Error Handling
```typescript
// Consistent error responses
throw createError({
  statusCode: 400,
  statusMessage: 'Invalid product ID',
  data: {
    field: 'id',
    received: id
  }
})
```

---

## Testing Strategy
This project does not include tests, and most likely will not in the future. Don't add tests unless explicitly asked to.
---

## Code Style & Quality

### TypeScript Best Practices
```typescript
// Use proper type narrowing
function processProduct(product: unknown): SelectProduct {
  if (!isProduct(product)) {
    throw new Error('Invalid product data')
  }
  return product
}

// Prefer type inference
const products = await getProducts() // Type inferred from function

// Use satisfies for complex objects
const config = {
  apiUrl: '/api/products',
  timeout: 5000
} satisfies ApiConfig
```

### Error Handling
```typescript
// Proper async error handling
async function createProduct(data: InsertProduct) {
  try {
    const result = await db.insert(products).values(data)
    return { success: true, data: result }
  } catch (error) {
    logger.error('Failed to create product', { error, data })
    return { success: false, error: 'Creation failed' }
  }
}
```

### Performance Patterns
```typescript
// Use proper caching
const products = await cachedFunction(async () => {
  return await getProducts()
}, {
  maxAge: 1000 * 60 * 5, // 5 minutes
  swr: true
})

// Implement pagination
const { data, total } = await getProductsPaginated({
  page: 1,
  limit: 20,
  category: 'kitchens'
})
```

---

## Commit & CI Guidelines

### Commit Messages
- **Format**: Follow [conventional commits](https://www.conventionalcommits.org/)
- **Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`, `build`, `perf`, `revert`
- **Scope**: Include area (e.g., `feat(products): add category filter`)
- **Length**: Subjects ≤ 93 characters, sentence case

### Pre-commit Validation
- **Linting**: ESLint with Nuxt configuration
- **Type checking**: Strict TypeScript validation
- **Testing**: Run relevant test suites
- **Build**: Verify successful build process

### Release Process
- **Semantic releases**: Automated via semantic-release
- **Version bumping**: Never manual - handled by CI
- **Deployment**: Automatic to NuxtHub on merge to main
- **Rollback**: Use NuxtHub deployment history

---

## Debugging & Development

### Local Development
```bash
# Start development server
pnpm dev

# Type checking
pnpm typecheck

# Linting
pnpm lint # or pnpm lint:fix
```

### Debugging Tools
- **Vue DevTools**: For component inspection
- **Nuxt DevTools**: For Nuxt-specific debugging
- **NuxtHub dashboard**: For production monitoring

---

## Reminders for Copilot

When generating code, always ask:

1. **Edge compatibility**: "Does this run on Cloudflare Workers?"
2. **Type safety**: "Am I returning strongly typed, validated data?"
3. **Documentation**: "Did I add TSDoc for exports?"
4. **Architecture**: "Does this fit Nuxt's structure and conventions?"
5. **Security**: "Is input validated and access controlled?"
6. **Performance**: "Am I implementing proper caching and optimization?"
7. **CI/CD**: "Will this pass lint, type check, and build?"

### Code Generation Priorities
1. **Type safety first**: Never use `any`, always validate inputs
2. **Edge runtime**: Only web-standard APIs and libraries
3. **Performance**: Consider caching, lazy loading, and bundle size
4. **Maintainability**: Clear naming, proper structure, good documentation
5. **Security**: Validate inputs, protect routes, sanitize outputs
6. **Accessibility**: Proper ARIA labels, semantic HTML, keyboard navigation
7. **SEO**: Meta tags, structured data, proper heading hierarchy
8. **Mobile-first**: Responsive design with proper touch targets

---

## Common Patterns

### Data Fetching
```typescript
// In composables/useProducts.ts
export const useProducts = () => {
  return useLazyAsyncData('products', () => $fetch('/api/products'), {
    transform: (data) => productSchema.array().parse(data),
    getCachedData: (key) => nuxtStorage.getItem(key)
  })
}
```

### Form Handling
```typescript
// In components with validation
const { handleSubmit, errors } = useForm({
  validationSchema: productFormSchema,
  onSubmit: async (values) => {
    await $fetch('/api/products', {
      method: 'POST',
      body: values
    })
  }
})
```

### Error Boundaries
```vue
<!-- In error.vue -->
<template>
  <UContainer>
    <UAlert
      :title="$t('error.title')"
      :description="error.statusMessage"
      color="red"
    />
  </UContainer>
</template>
```