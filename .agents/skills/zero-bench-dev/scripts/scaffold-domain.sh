#!/usr/bin/env bash

# ==============================================================================
# BenchZero DDD Feature Domain Scaffolder
# Automates creation of models/, services/, stores/, and container component
# ==============================================================================

set -euo pipefail

if [ -z "${1:-}" ]; then
  echo "Usage: ./scaffold-domain.sh <feature-name>"
  echo "Example: ./scaffold-domain.sh billing"
  exit 1
fi

FEATURE_NAME="$1"
FEATURE_DIR="src/app/features/${FEATURE_NAME}"

echo "🚀 Scaffolding DDD Domain: ${FEATURE_NAME} in ${FEATURE_DIR}..."

mkdir -p "${FEATURE_DIR}/models"
mkdir -p "${FEATURE_DIR}/services"
mkdir -p "${FEATURE_DIR}/stores"

# Create model file
MODEL_FILE="${FEATURE_DIR}/models/${FEATURE_NAME}.model.ts"
if [ ! -f "${MODEL_FILE}" ]; then
  cat <<EOF > "${MODEL_FILE}"
export interface ${FEATURE_NAME^}Item {
  id: string;
  name: string;
  createdAt: string;
}

export interface ${FEATURE_NAME^}State {
  items: ${FEATURE_NAME^}Item[];
  isLoading: boolean;
  error: string | null;
}
EOF
  echo "  ✅ Created ${MODEL_FILE}"
fi

# Create service file
SERVICE_FILE="${FEATURE_DIR}/services/${FEATURE_NAME}-api.service.ts"
if [ ! -f "${SERVICE_FILE}" ]; then
  cat <<EOF > "${SERVICE_FILE}"
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/tokens/api.token';
import { ${FEATURE_NAME^}Item } from '../models/${FEATURE_NAME}.model';

@Injectable({
  providedIn: 'root',
})
export class ${FEATURE_NAME^}ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  getItems(): Observable<${FEATURE_NAME^}Item[]> {
    return this.http.get<${FEATURE_NAME^}Item[]>(\`\${this.baseUrl}/api/${FEATURE_NAME}\`);
  }
}
EOF
  echo "  ✅ Created ${SERVICE_FILE}"
fi

# Create store file
STORE_FILE="${FEATURE_DIR}/stores/${FEATURE_NAME}.store.ts"
if [ ! -f "${STORE_FILE}" ]; then
  cat <<EOF > "${STORE_FILE}"
import { inject, computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { ${FEATURE_NAME^}Item, ${FEATURE_NAME^}State } from '../models/${FEATURE_NAME}.model';
import { ${FEATURE_NAME^}ApiService } from '../services/${FEATURE_NAME}-api.service';

const initialState: ${FEATURE_NAME^}State = {
  items: [],
  isLoading: false,
  error: null,
};

export const ${FEATURE_NAME^}Store = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ items }) => ({
    count: computed(() => items().length),
  })),
  withMethods((store, api = inject(${FEATURE_NAME^}ApiService)) => ({
    async loadAll(): Promise<void> {
      patchState(store, { isLoading: true, error: null });
      try {
        const items = await firstValueFrom(api.getItems());
        patchState(store, { items, isLoading: false });
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load items';
        patchState(store, { error: errorMsg, isLoading: false });
      }
    },
  }))
);
EOF
  echo "  ✅ Created ${STORE_FILE}"
fi

# Create component file
COMP_FILE="${FEATURE_DIR}/${FEATURE_NAME}.component.ts"
if [ ! -f "${COMP_FILE}" ]; then
  cat <<EOF > "${COMP_FILE}"
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ${FEATURE_NAME^}Store } from './stores/${FEATURE_NAME}.store';
import { StatCardComponent } from '../../core/widgets/stat-card/stat-card.component';
import { DataTableContainerComponent } from '../../core/widgets/data-table/data-table-container.component';

@Component({
  selector: 'app-${FEATURE_NAME}',
  standalone: true,
  imports: [CommonModule, StatCardComponent, DataTableContainerComponent],
  template: \`
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">${FEATURE_NAME^}</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage and monitor ${FEATURE_NAME} operations.</p>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <app-stat-card title="Total Items" [value]="store.count()" icon="layers" trend="+0%" tone="neutral" />
      </div>
    </div>
  \`,
})
export class ${FEATURE_NAME^}Component implements OnInit {
  protected readonly store = inject(${FEATURE_NAME^}Store);

  ngOnInit(): void {
    void this.store.loadAll();
  }
}
EOF
  echo "  ✅ Created ${COMP_FILE}"
fi

echo "🎉 DDD Feature Domain '${FEATURE_NAME}' successfully scaffolded!"
