import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PitchRequest, PitchResponse } from '../models/pitch-generator.model';
import { API_BASE_URL } from '../../../core/tokens/api.token';

@Injectable({
  providedIn: 'root',
})
export class PitchGeneratorApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  generatePitch(request: PitchRequest): Observable<PitchResponse> {
    return this.http.post<PitchResponse>(`${this.baseUrl}/api/pitch/generate`, request);
  }
}
