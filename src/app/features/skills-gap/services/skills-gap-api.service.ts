import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SkillsGapResponse } from '../models/skills-gap.model';
import { API_BASE_URL } from '../../../core/tokens/api.token';

@Injectable({
  providedIn: 'root',
})
export class SkillsGapApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  getSkillsGap(): Observable<SkillsGapResponse> {
    return this.http.get<SkillsGapResponse>(`${this.baseUrl}/api/skills-gap`);
  }
}
