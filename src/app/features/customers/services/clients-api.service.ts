import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClientAccount, ClientDetail, ClientPayload, RfpPayload } from '../models/customer.model';
import { API_BASE_URL } from '../../../core/tokens/api.token';

@Injectable({
  providedIn: 'root',
})
export class ClientsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  getClients(): Observable<ClientAccount[]> {
    return this.http.get<ClientAccount[]>(`${this.baseUrl}/api/clients`);
  }

  getClientDetail(id: string): Observable<ClientDetail> {
    return this.http.get<ClientDetail>(`${this.baseUrl}/api/clients/${id}`);
  }

  createClient(payload: ClientPayload): Observable<ClientAccount> {
    return this.http.post<ClientAccount>(`${this.baseUrl}/api/clients`, payload);
  }

  updateClient(id: string, payload: ClientPayload): Observable<ClientAccount> {
    return this.http.put<ClientAccount>(`${this.baseUrl}/api/clients/${id}`, payload);
  }

  addRfp(clientId: string, payload: RfpPayload): Observable<ClientDetail> {
    return this.http.post<ClientDetail>(`${this.baseUrl}/api/clients/${clientId}/rfps`, payload);
  }
}
