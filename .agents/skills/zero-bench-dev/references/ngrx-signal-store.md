# ⚡ NgRx SignalStore Architecture (`@ngrx/signals`)

BenchZero utilizes the official `@ngrx/signals` library (version `^21.1.1` matching Angular 21 LTS) for all reactive domain state management.

---

## 🏛️ 1. Core Principles of SignalStore

1. **Native Signal Integration:** SignalStores produce pure Angular Signals (`items()`, `isLoading()`, `error()`), enabling seamless Zoneless change detection without `zone.js`.
2. **Immutability & `patchState`:** All state mutations occur through the pure `patchState` function.
3. **Computed Derivations:** Use `withComputed` for derived values (filtered lists, KPIs, counts) to ensure memoized, reactive recalculations.
4. **Service Injection:** Domain API services are injected directly inside `withMethods` using Angular's `inject()`.

---

## 📐 2. SignalStore Blueprint

```typescript
import { inject, computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { MyEntity, MyEntityState } from '../models/my-domain.model';
import { MyDomainApiService } from '../services/my-domain-api.service';

const initialState: MyEntityState = {
  items: [],
  selectedId: null,
  isLoading: false,
  error: null,
};

export const MyDomainStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ items, selectedId }) => ({
    totalCount: computed(() => items().length),
    selectedItem: computed(() => items().find((item) => item.id === selectedId()) ?? null),
  })),
  withMethods((store, api = inject(MyDomainApiService)) => ({
    async loadAll(params?: Record<string, string>): Promise<void> {
      patchState(store, { isLoading: true, error: null });
      try {
        const items = await firstValueFrom(api.getItems(params));
        patchState(store, { items, isLoading: false });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load items';
        patchState(store, { error: message, isLoading: false });
      }
    },
    selectItem(id: string | null): void {
      patchState(store, { selectedId: id });
    },
  }))
);
```

---

## 🌐 3. SSR & Zoneless Safety Rules

1. **No Browser Globals at Construction:** Never call `window`, `document`, or `localStorage` during initial signal initialization.
2. **Platform Checks for Storage:**
   ```typescript
   const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
   if (isBrowser) {
     localStorage.setItem('key', value);
   }
   ```
3. **No Zone Dependencies:** Avoid `async/await` wrapping manual `ChangeDetectorRef.markForCheck()`. In zoneless Angular, signal updates immediately mark the view dirty.
