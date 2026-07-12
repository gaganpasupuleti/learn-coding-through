# Study Report: Frontend React Developer — Career Path & Core Skills

*Written by Gagan Pasupuleti*

## Summary

Modern frontend engineering with React 19, TypeScript, Vite, React Router 7, TanStack Query, component testing, and accessible UI patterns. Covers JSX fundamentals through performant production SPAs with design systems and CI-driven quality gates.

## Learning tracks

**Levels covered:** Beginner, Intermediate, Advanced

## Skill stack by level

### Beginner
- HTML5 semantic markup and accessibility basics
- CSS Flexbox, Grid, and responsive design
- JavaScript ES2024 (modules, destructuring, async/await)
- React components, props, and state with useState
- JSX syntax and event handling
- npm/pnpm package management
- Browser DevTools debugging

### Intermediate
- TypeScript interfaces, generics, and strict mode
- React 19 hooks (useEffect, useMemo, useCallback, useRef)
- React Router data APIs and nested routes
- TanStack Query for server state caching
- Vite build optimization and code splitting
- CSS Modules or Tailwind component styling
- Vitest and React Testing Library
- Forms with React Hook Form and Zod validation

### Advanced
- React Server Components and streaming (where applicable)
- Performance profiling (React DevTools Profiler)
- Design systems with Storybook and compound components
- Micro-frontends and module federation
- E2E testing with Playwright
- Accessibility audits (axe, WCAG 2.2)
- CI/CD with preview deployments

## Recommended books (read alongside this report)

### 1. Learning React — Alex Banks & Eve Porcello
- **Level:** Beginner
- **Focus:** React 19 components, hooks, and modern frontend patterns.
- **Link:** https://www.oreilly.com/library/view/learning-react-2nd/9781492051721/

### 2. Programming TypeScript — Boris Cherny
- **Level:** Intermediate
- **Focus:** Type-safe React apps with interfaces, generics, and tooling.
- **Link:** https://www.oreilly.com/library/view/programming-typescript/9781492037657/

### 3. React Documentation — React Team *(free online)*
- **Level:** Beginner
- **Focus:** Official react.dev guides for components, hooks, and Server Components.
- **Link:** https://react.dev/learn

### 4. Refactoring UI — Adam Wathan & Steve Schoger
- **Level:** Intermediate
- **Focus:** Visual design principles for developers building UIs.
- **Link:** https://www.refactoringui.com/

### 5. You Don't Know JS Yet — Kyle Simpson *(free online)*
- **Level:** Intermediate
- **Focus:** Deep JavaScript: scope, closures, async, and the event loop.
- **Link:** https://github.com/getify/You-Dont-Know-JS

## End-to-end projects

### Project 1: Personal Portfolio SPA
- **Level:** Beginner | **Duration:** 2 weeks
- **Overview:** React + Vite portfolio with responsive layout, React Router pages, and contact form.
- **Objectives:**
  - 3 routed pages (Home, Projects, Contact)
  - Responsive CSS/Tailwind layout
  - Deploy to Vercel/Netlify
- **Phases:**
  - **Setup:** Vite + React + Router. Tasks: Project structure, Navbar. Deliverable: Running dev server.
  - **Pages:** Build 3 page components. Tasks: Project cards, About section. Deliverable: All routes working.
  - **Style:** Mobile-first responsive. Tasks: Flexbox/Grid, Dark mode toggle. Deliverable: Lighthouse 90+ score.
  - **Deploy:** CI deploy to Vercel. Tasks: GitHub Actions, Custom domain. Deliverable: Live URL.
- **Final deliverables:** GitHub repo; Live site URL; Lighthouse report

### Project 2: CodeQuest Reports Catalog App
- **Level:** Intermediate | **Duration:** 3–4 weeks
- **Overview:** React app fetching catalog.json: search, filter by family, detail view with chapter list, TypeScript throughout.
- **Objectives:**
  - Fetch and display catalog.json
  - Search and filter by family/level
  - Report detail page with chapters
  - TanStack Query for caching
- **Phases:**
  - **Data:** Fetch catalog API. Tasks: TanStack Query, Loading states. Deliverable: Catalog grid page.
  - **Search:** Filter and sort. Tasks: Debounced search, Family chips. Deliverable: Search UX demo.
  - **Detail:** Report detail route. Tasks: Chapter list, Book sidebar. Deliverable: /reports/:id page.
  - **Tests:** Vitest + Testing Library. Tasks: Component tests, MSW mocks. Deliverable: Test coverage report.
- **Final deliverables:** GitHub repo; Live demo; Test report; Component storybook optional

### Project 3: Real-Time Dashboard with WebSockets
- **Level:** Advanced | **Duration:** 4–5 weeks
- **Overview:** React dashboard with live metrics via WebSocket, Recharts visualizations, auth, and error boundaries.
- **Objectives:**
  - WebSocket live data feed
  - Recharts time-series charts
  - Auth-protected routes
  - Error boundaries + retry logic
- **Phases:**
  - **WS Client:** Custom useWebSocket hook. Tasks: Reconnect logic, Heartbeat. Deliverable: Hook unit tests.
  - **Charts:** Live updating Recharts. Tasks: Buffer last 100 points, Pause/resume. Deliverable: Dashboard page.
  - **Auth:** JWT login flow. Tasks: Protected routes, Token refresh. Deliverable: Login → dashboard flow.
  - **Harden:** Error boundaries, Suspense. Tasks: Fallback UI, Sentry integration. Deliverable: Error handling demo video.
- **Final deliverables:** Live dashboard; Architecture doc; Error handling demo; Performance profile

## Chapters

---

### Track: Beginner

#### Chapter 1: Modern Frontend Role Overview *(Level: Beginner)*

**Chapter focus: Modern Frontend Role Overview** *(Level: Beginner)*

Frontend developers translate designs into interactive, accessible web experiences. React 19 emphasizes functional components, hooks, and improved hydration. You collaborate with designers, backend engineers, and QA to ship features users touch daily. Strong fundamentals in HTML, CSS, and JavaScript precede any framework mastery.

Code Reference:
```javascript
function Welcome({ name }: { name: string }) {
  return <h1>Hello, {name}</h1>;
}

export default Welcome;
```
What it shows: Functional component receives props and returns JSX describing UI.

### What it actually is
Frontend development builds user interfaces that run in the browser.

### When to use it
Choose this path when you enjoy visual problem-solving and user-facing product work.

### Where to use it
Web apps, SaaS dashboards, marketing sites, and mobile hybrid shells.

### Real use example
A fintech dashboard shows live balances because React re-renders when API data arrives.

**Key takeaways**
- Frontend development builds user interfaces that run in the browser.
- Choose this path when you enjoy visual problem-solving and user-facing product work.
- A fintech dashboard shows live balances because React re-renders when API data arrives.

#### Chapter 2: HTML Semantics and Accessibility *(Level: Beginner)*

**Chapter focus: HTML Semantics and Accessibility** *(Level: Beginner)*

Semantic tags (nav, main, article, button) convey meaning to browsers and assistive tech. Every interactive control must be keyboard reachable with visible focus indicators. Alt text, labels, and ARIA roles fill gaps only when native HTML cannot express intent. Accessibility is not optional—it's a legal and ethical requirement in many markets.

Code Reference:
```html
<nav aria-label="Primary">
  <a href="/home">Home</a>
  <button type="button" aria-expanded="false">Menu</button>
</nav>
```
What it shows: aria-label names the nav region; button declares type for assistive technologies.

### What it actually is
Semantic HTML structures content for humans, search engines, and screen readers.

### When to use it
Apply on every page and component from the first commit.

### Where to use it
Public websites, government portals, and enterprise SaaS with compliance requirements.

### Real use example
A blind user navigates checkout entirely by keyboard because form fields have proper labels.

**Key takeaways**
- Semantic HTML structures content for humans, search engines, and screen readers.
- Apply on every page and component from the first commit.
- A blind user navigates checkout entirely by keyboard because form fields have proper labels.

#### Chapter 3: CSS Layout with Flexbox and Grid *(Level: Beginner)*

**Chapter focus: CSS Layout with Flexbox and Grid** *(Level: Beginner)*

Flexbox aligns items in one dimension—rows or columns—ideal for nav bars and toolbars. Grid defines two-dimensional layouts for dashboards and card galleries. Mobile-first media queries scale layouts from small screens upward. CSS variables centralize colors and spacing for theming consistency.

Code Reference:
```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}
```
What it shows: auto-fill creates responsive columns without JavaScript breakpoint logic.

### What it actually is
CSS layout systems position and space UI elements visually.

### When to use it
Use Flexbox for component internals; Grid for page-level structure.

### Where to use it
Responsive landing pages, admin dashboards, and design system layouts.

### Real use example
Product cards reflow from one column on phones to four on wide monitors automatically.

**Key takeaways**
- CSS layout systems position and space UI elements visually.
- Use Flexbox for component internals; Grid for page-level structure.
- Product cards reflow from one column on phones to four on wide monitors automatically.

#### Chapter 4: JavaScript ES Modules and async/await *(Level: Beginner)*

**Chapter focus: JavaScript ES Modules and async/await** *(Level: Beginner)*

ES modules use import/export for explicit dependencies instead of global script tags. async/await syntax reads synchronously while awaiting Promises for fetch calls. Destructuring extracts fields from objects and arrays concisely. Optional chaining (?.) prevents errors when accessing nested nullable properties.

Code Reference:
```javascript
export async function loadUser(id) {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) throw new Error('Failed to load user');
  return res.json();
}
```
What it shows: async function returns Promise; await pauses until fetch resolves.

### What it actually is
Modern JavaScript modules and async I/O underpin every React data fetch.

### When to use it
Master before adding state management libraries or complex hooks.

### Where to use it
API clients, event handlers, and utility modules in React codebases.

### Real use example
Profile page awaits loadUser then passes data to child components as props.

**Key takeaways**
- Modern JavaScript modules and async I/O underpin every React data fetch.
- Master before adding state management libraries or complex hooks.
- Profile page awaits loadUser then passes data to child components as props.

#### Chapter 5: React Components, Props, and State *(Level: Beginner)*

**Chapter focus: React Components, Props, and State** *(Level: Beginner)*

Components are functions returning JSX; props pass read-only data from parent to child. useState hook stores local UI state like form inputs and toggle visibility. Lift state up when siblings need shared data—pass callbacks to update parent state. Keys on list items help React reconcile dynamic lists efficiently.

Code Reference:
```javascript
function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}
```
What it shows: Functional updater c => c + 1 avoids stale closure when batching updates.

### What it actually is
React components compose UI from reusable, stateful building blocks.

### When to use it
Use local state for UI-only concerns; fetch server data with dedicated libraries later.

### Where to use it
Forms, modals, toggles, and any interactive widget in SPAs.

### Real use example
Shopping cart badge shows item count from lifted state in App shell.

**Key takeaways**
- React components compose UI from reusable, stateful building blocks.
- Use local state for UI-only concerns; fetch server data with dedicated libraries later.
- Shopping cart badge shows item count from lifted state in App shell.

#### Chapter 6: Vite Dev Server and Project Setup *(Level: Beginner)*

**Chapter focus: Vite Dev Server and Project Setup** *(Level: Beginner)*

Vite provides instant HMR (Hot Module Replacement) using native ES modules in dev. Production builds use Rollup for tree-shaking and optimized chunks. npm create vite@latest scaffolds React + TypeScript templates in seconds. Environment variables prefixed VITE_ expose safe public config to client code.

Code Reference:
```bash
npm create vite@latest my-app -- --template react-ts
cd my-app && npm install && npm run dev
```
What it shows: react-ts template includes TypeScript, ESLint, and Vite config out of the box.

### What it actually is
Vite is the modern build tool replacing Create React App for new React projects.

### When to use it
Start every new SPA with Vite unless framework constraints require otherwise.

### Where to use it
Local development, open-source React libraries, and production SPAs.

### Real use example
Developer edits a component and sees changes in browser within 200ms without full reload.

**Key takeaways**
- Vite is the modern build tool replacing Create React App for new React projects.
- Start every new SPA with Vite unless framework constraints require otherwise.
- Developer edits a component and sees changes in browser within 200ms without full reload.

---

### Track: Intermediate

#### Chapter 7: TypeScript for React Components *(Level: Intermediate)*

**Chapter focus: TypeScript for React Components** *(Level: Intermediate)*

TypeScript catches prop mismatches and null errors at compile time, not in production. Define Props interfaces with optional fields and union types for variants. Generics type reusable components like DataTable<T>. Enable strict mode in tsconfig for maximum safety on growing codebases.

Code Reference:
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary';
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export function Button({ variant, ...rest }: ButtonProps) { /* ... */ }
```
What it shows: Union type restricts variant strings; ReactNode accepts any renderable children.

### What it actually is
TypeScript adds static typing to JavaScript for safer React development.

### When to use it
Adopt TypeScript on all professional React projects from day one.

### Where to use it
Component libraries, large SPAs, and teams needing refactor confidence.

### Real use example
CI fails when developer passes invalid variant='danger' not in union type.

**Key takeaways**
- TypeScript adds static typing to JavaScript for safer React development.
- Adopt TypeScript on all professional React projects from day one.
- CI fails when developer passes invalid variant='danger' not in union type.

#### Chapter 8: React 19 Hooks Deep Dive *(Level: Intermediate)*

**Chapter focus: React 19 Hooks Deep Dive** *(Level: Intermediate)*

useEffect runs side effects after render—fetching, subscriptions, DOM sync. useMemo caches expensive computations; useCallback stabilizes function references for memoized children. useRef holds mutable values without triggering re-renders—DOM nodes and timers. React 19 improves batching and offers use() for reading promises in render where supported.

Code Reference:
```javascript
useEffect(() => {
  const controller = new AbortController();
  fetch('/api/stats', { signal: controller.signal })
    .then(r => r.json())
    .then(setStats);
  return () => controller.abort();
}, []);
```
What it shows: AbortController cancels fetch on unmount preventing setState on unmounted component.

### What it actually is
Hooks attach state and lifecycle behavior to functional components without classes.

### When to use it
Use built-in hooks before reaching for external state libraries.

### Where to use it
Data fetching effects, form side effects, and third-party widget integration.

### Real use example
Analytics script loads once on mount; cleanup removes listener when user navigates away.

**Key takeaways**
- Hooks attach state and lifecycle behavior to functional components without classes.
- Use built-in hooks before reaching for external state libraries.
- Analytics script loads once on mount; cleanup removes listener when user navigates away.

#### Chapter 9: React Router 7 Data Routes *(Level: Intermediate)*

**Chapter focus: React Router 7 Data Routes** *(Level: Intermediate)*

React Router 7 supports loaders fetching data before route renders. Nested routes share layouts while child routes swap content in Outlet. Error boundaries on routes catch loader failures with user-friendly fallbacks. URL is shareable application state—encode filters and pagination in search params.

Code Reference:
```javascript
export async function productLoader({ params }) {
  const product = await fetchProduct(params.id);
  if (!product) throw new Response('Not Found', { status: 404 });
  return product;
}
```
What it shows: Loader runs before component mount; throwing Response triggers error boundary.

### What it actually is
React Router manages client-side navigation and URL-driven UI state.

### When to use it
Use on multi-page SPAs needing bookmarkable URLs and back-button support.

### Where to use it
Dashboards, wizards, and admin panels with deep navigation hierarchies.

### Real use example
User shares /products/42 URL; colleague sees identical product detail instantly.

**Key takeaways**
- React Router manages client-side navigation and URL-driven UI state.
- Use on multi-page SPAs needing bookmarkable URLs and back-button support.
- User shares /products/42 URL; colleague sees identical product detail instantly.

#### Chapter 10: TanStack Query Server State *(Level: Intermediate)*

**Chapter focus: TanStack Query Server State** *(Level: Intermediate)*

TanStack Query caches API responses and synchronizes server state with UI automatically. useQuery handles loading, error, and stale-while-revalidate patterns out of the box. Query keys identify cache entries; invalidateQueries refreshes after mutations. Prefetch on hover makes navigation feel instant without redundant global state.

Code Reference:
```javascript
const { data, isLoading, error } = useQuery({
  queryKey: ['products', filters],
  queryFn: () => fetchProducts(filters),
  staleTime: 60_000,
});
```
What it shows: staleTime keeps data fresh for 60s avoiding refetch on every mount.

### What it actually is
TanStack Query manages async server data caching separate from UI state.

### When to use it
Replace manual useEffect fetch logic in data-heavy screens.

### Where to use it
Product lists, infinite scroll feeds, and admin tables with pagination.

### Real use example
After creating a product, invalidateQueries(['products']) refreshes list without page reload.

**Key takeaways**
- TanStack Query manages async server data caching separate from UI state.
- Replace manual useEffect fetch logic in data-heavy screens.
- After creating a product, invalidateQueries(['products']) refreshes list without page reload.

#### Chapter 11: Forms with React Hook Form and Zod *(Level: Intermediate)*

**Chapter focus: Forms with React Hook Form and Zod** *(Level: Intermediate)*

React Hook Form minimizes re-renders by registering uncontrolled inputs. Zod schemas validate and infer TypeScript types from one source of truth. resolver connects Zod to RHF for inline field errors and submit blocking. Accessible error messages link to inputs via aria-describedby.

Code Reference:
```typescript
const schema = z.object({ email: z.string().email(), password: z.string().min(8) });
const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
```
What it shows: zodResolver runs validation on submit and populates errors object per field.

### What it actually is
Typed form libraries reduce boilerplate and validation bugs in complex forms.

### When to use it
Use on login, checkout, settings, and any multi-field user input.

### Where to use it
SaaS signup, e-commerce checkout, and admin create/edit dialogs.

### Real use example
Checkout blocks submit until card fields pass Zod rules; errors announce to screen readers.

**Key takeaways**
- Typed form libraries reduce boilerplate and validation bugs in complex forms.
- Use on login, checkout, settings, and any multi-field user input.
- Checkout blocks submit until card fields pass Zod rules; errors announce to screen readers.

#### Chapter 12: Vitest and React Testing Library *(Level: Intermediate)*

**Chapter focus: Vitest and React Testing Library** *(Level: Intermediate)*

React Testing Library queries DOM as users do—by role, label, and text. Vitest runs tests in Vite's transform pipeline for fast feedback. userEvent simulates realistic clicks and keyboard input better than fireEvent. Test behavior, not implementation—avoid asserting internal state directly.

Code Reference:
```javascript
test('adds item to cart', async () => {
  render(<ProductCard product={mockProduct} />);
  await userEvent.click(screen.getByRole('button', { name: /add to cart/i }));
  expect(screen.getByText(/1 in cart/i)).toBeInTheDocument();
});
```
What it shows: getByRole finds button by accessible name; assertion checks visible outcome.

### What it actually is
Component tests verify UI behavior from the user's perspective.

### When to use it
Write tests for critical user journeys before refactoring legacy components.

### Where to use it
CI pipelines, design system packages, and regression prevention.

### Real use example
Refactoring CartContext passes tests proving user-visible behavior unchanged.

**Key takeaways**
- Component tests verify UI behavior from the user's perspective.
- Write tests for critical user journeys before refactoring legacy components.
- Refactoring CartContext passes tests proving user-visible behavior unchanged.

#### Chapter 13: Vite Production Build and Code Splitting *(Level: Intermediate)*

**Chapter focus: Vite Production Build and Code Splitting** *(Level: Intermediate)*

Dynamic import() creates async chunks loaded on demand per route. Manual chunks separate vendor libraries from application code for cache efficiency. Analyze bundle with rollup-plugin-visualizer to find heavyweight dependencies. Lazy + Suspense show fallbacks while route chunks download.

Code Reference:
```javascript
const AdminPanel = lazy(() => import('./AdminPanel'));

<Suspense fallback={<Spinner />}>
  <AdminPanel />
</Suspense>
```
What it shows: Admin code downloads only when user navigates to admin route.

### What it actually is
Code splitting reduces initial JavaScript payload for faster first paint.

### When to use it
Split by route and heavy widgets on any non-trivial SPA.

### Where to use it
Admin sections, chart libraries, and markdown editors loaded on demand.

### Real use example
Initial bundle drops from 800KB to 220KB; admin chunk loads in 400ms when needed.

**Key takeaways**
- Code splitting reduces initial JavaScript payload for faster first paint.
- Split by route and heavy widgets on any non-trivial SPA.
- Initial bundle drops from 800KB to 220KB; admin chunk loads in 400ms when needed.

---

### Track: Advanced

#### Chapter 14: Performance Profiling and Memoization *(Level: Advanced)*

**Chapter focus: Performance Profiling and Memoization** *(Level: Advanced)*

React DevTools Profiler records render durations and why components re-rendered. React.memo skips re-render when props shallow-equal; use sparingly after profiling. Virtualize long lists with TanStack Virtual to render only visible rows. Avoid inline object/array literals in props—they break memoization every render.

Code Reference:
```typescript
const MemoRow = memo(function Row({ item }: { item: Item }) {
  return <tr><td>{item.name}</td><td>{item.price}</td></tr>;
});
```
What it shows: memo wraps Row; parent must pass stable item references for skip to work.

### What it actually is
Performance optimization targets measured bottlenecks, not premature micro-optimizations.

### When to use it
Profile when Interaction to Next Paint (INP) regresses or lists lag on scroll.

### Where to use it
Data tables with 10k rows, real-time dashboards, and animation-heavy UIs.

### Real use example
Virtualizing order list cuts render nodes from 5000 to 20, restoring 60fps scroll.

**Key takeaways**
- Performance optimization targets measured bottlenecks, not premature micro-optimizations.
- Profile when Interaction to Next Paint (INP) regresses or lists lag on scroll.
- Virtualizing order list cuts render nodes from 5000 to 20, restoring 60fps scroll.

#### Chapter 15: Design Systems and Storybook *(Level: Advanced)*

**Chapter focus: Design Systems and Storybook** *(Level: Advanced)*

Design systems document tokens, components, and usage guidelines for consistency. Storybook isolates components with controls for props exploration and visual QA. Compound components (Tabs.List, Tabs.Panel) share implicit state via context. Document accessibility requirements in each story's parameters.a11y config.

Code Reference:
```javascript
export default { component: Button, tags: ['autodocs'], argTypes: { variant: { control: 'select', options: ['primary', 'ghost'] } } };
```
What it shows: Meta export configures Storybook docs and interactive controls automatically.

### What it actually is
Storybook accelerates component development, review, and regression testing.

### When to use it
Adopt when three or more teams share UI primitives across products.

### Where to use it
Enterprise SaaS, white-label platforms, and open-source component libraries.

### Real use example
Designer reviews Button stories in deployed Chromatic before approving release.

**Key takeaways**
- Storybook accelerates component development, review, and regression testing.
- Adopt when three or more teams share UI primitives across products.
- Designer reviews Button stories in deployed Chromatic before approving release.

#### Chapter 16: Playwright End-to-End Testing *(Level: Advanced)*

**Chapter focus: Playwright End-to-End Testing** *(Level: Advanced)*

E2E tests simulate real user flows across pages in Chromium, Firefox, and WebKit. Playwright auto-waits for elements—reducing flaky sleep-based tests. Fixtures authenticate once and reuse storage state across specs. Run E2E in CI on preview deployments before merging to main.

Code Reference:
```javascript
test('checkout flow', async ({ page }) => {
  await page.goto('/products');
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await page.getByRole('link', { name: 'Checkout' }).click();
  await expect(page.getByText('Order confirmed')).toBeVisible();
});
```
What it shows: getByRole locators mirror Testing Library; expect waits for assertion automatically.

### What it actually is
E2E tests validate critical business flows across integrated frontend and backend.

### When to use it
Cover signup, checkout, and payment paths; keep count small and stable.

### Where to use it
Release gates, regression suites, and compliance-critical workflows.

### Real use example
CI blocks deploy when checkout E2E fails after payment provider UI change.

**Key takeaways**
- E2E tests validate critical business flows across integrated frontend and backend.
- Cover signup, checkout, and payment paths; keep count small and stable.
- CI blocks deploy when checkout E2E fails after payment provider UI change.

#### Chapter 17: Micro-Frontends and Module Federation *(Level: Advanced)*

**Chapter focus: Micro-Frontends and Module Federation** *(Level: Advanced)*

Micro-frontends let teams deploy UI slices independently within one shell app. Module Federation shares dependencies like React as singletons across remotes. Define clear integration contracts—routing, auth tokens, and event bus semantics. Over-splitting creates UX inconsistency and operational overhead—start monolith-first.

Code Reference:
```javascript
federation({ name: 'shell', remotes: { shop: 'shop@https://cdn.example/remoteEntry.js' } })
```
What it shows: Shell app loads shop remote at runtime from CDN URL.

### What it actually is
Micro-frontends scale frontend org structure for large multi-team products.

### When to use it
Consider when independent release cadences justify integration complexity.

### Where to use it
Large enterprises with acquisition integrations and platform teams.

### Real use example
Marketing team deploys promo banner remote without rebuilding core banking shell.

**Key takeaways**
- Micro-frontends scale frontend org structure for large multi-team products.
- Consider when independent release cadences justify integration complexity.
- Marketing team deploys promo banner remote without rebuilding core banking shell.

#### Chapter 18: CI/CD and Preview Deployments *(Level: Advanced)*

**Chapter focus: CI/CD and Preview Deployments** *(Level: Advanced)*

GitHub Actions runs lint, typecheck, unit, and E2E on every pull request. Preview URLs deploy ephemeral environments per PR for designer and QA review. Lighthouse CI asserts performance budgets on critical pages. Production promotes immutable artifacts tested on staging—never rebuild untested SHAs.

Code Reference:
```yaml
name: CI
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run lint && npm test && npm run build
```
What it shows: Single workflow installs deps, lints, tests, and verifies production build.

### What it actually is
CI/CD automates quality gates and deployment for frontend teams.

### When to use it
Set up before team grows beyond two developers.

### Where to use it
Open-source projects, SaaS products, and agencies shipping client sites.

### Real use example
PR #842 gets preview URL; PM approves pixel-perfect match before merge.

**Key takeaways**
- CI/CD automates quality gates and deployment for frontend teams.
- Set up before team grows beyond two developers.
- PR #842 gets preview URL; PM approves pixel-perfect match before merge.

---

*Family: Frontend React Developer | Level: Beginner to Advanced*

**Official sources & free libraries**
- https://react.dev/
- https://www.typescriptlang.org/docs/
- https://vitejs.dev/guide/
- https://reactrouter.com/
- https://tanstack.com/query/latest
- https://testing-library.com/docs/react-testing-library/intro/