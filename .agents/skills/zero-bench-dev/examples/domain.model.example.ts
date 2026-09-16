/**
 * Standard DDD Feature Model Definition Template
 * Location: src/app/features/<domain>/models/<domain>.model.ts
 */

export type EntityStatus = 'active' | 'pending' | 'archived';

export interface DomainEntity {
  id: string;
  name: string;
  category: string;
  status: EntityStatus;
  metrics: {
    score: number;
    financialValue: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DomainFilterParams {
  status?: EntityStatus | '';
  search?: string;
  category?: string;
}

export interface DomainApiResponse {
  items: DomainEntity[];
  total: number;
}

/**
 * MANDATORY: Domain State interface externalized from store.
 * Never declare inline in .store.ts!
 */
export interface DomainFeatureState {
  items: DomainEntity[];
  selectedId: string | null;
  filters: DomainFilterParams;
  isLoading: boolean;
  error: string | null;
}
