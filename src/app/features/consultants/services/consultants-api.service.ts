import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Consultant } from '../models/consultant.model';
import { API_BASE_URL } from '../../../core/tokens/api.token';

@Injectable({
  providedIn: 'root',
})
export class ConsultantsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  getConsultants(filter?: { status?: string; search?: string }): Observable<Consultant[]> {
    let params = new HttpParams();
    if (filter?.status && filter.status !== 'ALL') {
      params = params.set('status', filter.status);
    }
    if (filter?.search) {
      params = params.set('search', filter.search);
    }

    return this.http.get<Consultant[]>(`${this.baseUrl}/api/consultants`, { params });
  }

  getConsultantById(id: string): Observable<Consultant> {
    return this.http.get<Consultant>(`${this.baseUrl}/api/consultants/${id}`);
  }

  createConsultant(consultant: Partial<Consultant>): Observable<Consultant> {
    return this.http.post<Consultant>(`${this.baseUrl}/api/consultants`, consultant);
  }
}
