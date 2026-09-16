import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RiskOverviewResponse } from '../../../core/models/risk.model';
import { API_BASE_URL } from '../../../core/tokens/api.token';

@Injectable({
  providedIn: 'root',
})
export class BenchRiskApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  getRiskOverview(): Observable<RiskOverviewResponse> {
    return this.http.get<RiskOverviewResponse>(`${this.baseUrl}/api/risk/overview`);
  }
}
