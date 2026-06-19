# Zustand Standards

## 1. Overview
Zustand owns **client/UI state** that must be shared across components and isn't server
data — e.g., a sidebar's open state, a multi-step wizard, theme, ephemeral selections.
Server data belongs to TanStack Query, not Zustand.

## 2. Version Requirements
- Zustand **v4+**, with TypeScript. Stores are strongly typed; no `any`.

## 3. Folder Structure
- Stores live in `src/stores/` (global) or a feature's `store/` (feature-scoped), one
  store per concern. File: `use-<name>-store.ts` exporting `use<Name>Store`.

## 4. Approved Patterns
- **Typed store with a clear state/actions split:**
  ```ts
  interface CartState {
    items: readonly CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    clear: () => void;
  }
  export const useCartStore = create<CartState>((set) => ({
    items: [],
    addItem: (item) => set((state) => ({ items: [...state.items, item] })),
    removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
    clear: () => set({ items: [] }),
  }));
  ```
- **Selector subscriptions** so components re-render only on the slice they use:
  ```ts
  const itemCount = useCartStore((state) => state.items.length);
  ```
- Keep stores **small and focused**; multiple small stores beat one god-store.
- Use middleware deliberately: `persist` (with an explicit whitelist), `devtools` in dev,
  `immer` if you need ergonomic nested updates.
- Update immutably (or via `immer`); never mutate state objects in place.

## 5. Forbidden Patterns
- ❌ Storing server data here — use TanStack Query (`rules/frontend/tanstack-query.md`).
- ❌ Subscribing to the whole store (`useCartStore()` with no selector) — causes
  needless re-renders.
- ❌ One mega-store holding unrelated concerns.
- ❌ Persisting sensitive data (tokens, PII) to `localStorage` via `persist`.
- ❌ Mutating state directly outside `set`.
- ❌ Business logic that belongs in a service/hook crammed into the store.

## 6. Security Requirements
- Never persist secrets/tokens. If you persist, whitelist non-sensitive fields only and
  clear on logout.

## 7. Performance Requirements
- Always select the minimal slice; use shallow equality (`useShallow`) when selecting
  multiple fields to avoid re-render churn.

## 8. Testing Requirements
- Stores are plain functions — test actions directly: call an action, assert the new
  state. Reset state between tests.

## 9. Example
```ts
// stores/use-ui-store.ts
import { create } from 'zustand';

interface UiState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebar: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebar: (open) => set({ isSidebarOpen: open }),
}));

// usage — selector keeps re-renders minimal
const isOpen = useUiStore((s) => s.isSidebarOpen);
```

## 10. Review Checklist
- [ ] State is client/UI state, not server data.
- [ ] Store is typed, focused, and immutably updated.
- [ ] Components use selectors, not whole-store subscriptions.
- [ ] No secrets persisted; cleared on logout.
- [ ] Actions tested directly.
