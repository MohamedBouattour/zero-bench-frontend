/**
 * Standard DDD Feature API Service Template
 * Location: src/app/features/<domain>/services/<domain>-api.service.ts
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/tokens/api.token';
import { DomainEntity, DomainFilterParams } from '../models/domain.model';

@Injectable({
  providedIn: 'root',
})
export class DomainApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  getItems(filters?: DomainFilterParams): Observable<DomainEntity[]> {
    let params = new HttpParams();
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.search) params = params.set('search', filters.search);

    return this.http.get<DomainEntity[]>(`${this.baseUrl}/api/domain-endpoint`, { params });
  }

  getById(id: string): Observable<DomainEntity> {
    return this.http.get<DomainEntity>(`${this.baseUrl}/api/domain-endpoint/${id}`);
  }

  create(payload: Partial<DomainEntity>): Observable<DomainEntity> {
    return this.http.post<DomainEntity>(`${this.baseUrl}/api/domain-endpoint`, payload);
  }
}
