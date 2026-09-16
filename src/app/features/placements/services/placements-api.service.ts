import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PlacementOpportunity } from '../../../core/models/placement.model';
import { API_BASE_URL } from '../../../core/tokens/api.token';

@Injectable({
  providedIn: 'root',
})
export class PlacementsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  getPlacements(): Observable<PlacementOpportunity[]> {
    return this.http.get<PlacementOpportunity[]>(`${this.baseUrl}/api/placements`);
  }
}
