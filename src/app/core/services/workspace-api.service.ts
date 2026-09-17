import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../tokens/api.token';
import { SKIP_LOADING } from '../models/loading.model';
import { AppNotification } from '../models/notification.model';
import { NavigationBadges } from '../models/navigation.model';
import { UserProfile } from '../models/session.model';

/** Cross-cutting workspace endpoints: session, notifications and navigation badges. */
@Injectable({
  providedIn: 'root',
})
export class WorkspaceApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  // Background shell requests should not flash the global loading bar.
  private readonly background = { context: new HttpContext().set(SKIP_LOADING, true) };

  getCurrentUser(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/api/me`, this.background);
  }

  getNavigationBadges(): Observable<NavigationBadges> {
    return this.http.get<NavigationBadges>(`${this.baseUrl}/api/navigation/badges`, this.background);
  }

  getNotifications(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(`${this.baseUrl}/api/notifications`, this.background);
  }

  markNotificationRead(id: string): Observable<AppNotification> {
    return this.http.patch<AppNotification>(`${this.baseUrl}/api/notifications/${id}/read`, {}, this.background);
  }

  markAllNotificationsRead(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/api/notifications/read-all`, {}, this.background);
  }
}
