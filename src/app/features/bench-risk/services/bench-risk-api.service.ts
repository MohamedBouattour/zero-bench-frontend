import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RiskOverviewResponse, RiskPeriod } from '../models/bench-risk.model';
import { API_BASE_URL } from '../../../core/tokens/api.token';

@Injectable({
  providedIn: 'root',
})
export class BenchRiskApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  getRiskOverview(period: RiskPeriod): Observable<RiskOverviewResponse> {
    const params = new HttpParams().set('period', period);
    return this.http.get<RiskOverviewResponse>(`${this.baseUrl}/api/risk/overview`, { params });
  }
}
