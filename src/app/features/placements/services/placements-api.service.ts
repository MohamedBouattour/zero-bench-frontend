import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PlacementOpportunity, PlacementPayload, PlacementUpdate } from '../models/placement.model';
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

  createPlacement(payload: PlacementPayload): Observable<PlacementOpportunity> {
    return this.http.post<PlacementOpportunity>(`${this.baseUrl}/api/placements`, payload);
  }

  updatePlacement(id: string, changes: PlacementUpdate): Observable<PlacementOpportunity> {
    return this.http.patch<PlacementOpportunity>(`${this.baseUrl}/api/placements/${id}`, changes);
  }

  deletePlacement(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/placements/${id}`);
  }
}
