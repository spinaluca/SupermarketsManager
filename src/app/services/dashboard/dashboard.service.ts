import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment, getApiBaseUrl } from '../../../environments/environment';

export interface DashboardStats {
  supermarket_count: number;
  product_count: number;
  user_count: number;
}

export interface DashboardResponse {
  user: { id: number; username: string; role: string };
  stats: DashboardStats;
  supermarkets: any[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private baseUrl = getApiBaseUrl();

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<DashboardResponse> {
    const headers = this.getAuthHeaders();
    return this.http.get<DashboardResponse>(`${this.baseUrl}/dashboard`, { headers });
  }

  private getAuthHeaders(): { [header: string]: string } {
    const token = localStorage.getItem('jwt_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}
