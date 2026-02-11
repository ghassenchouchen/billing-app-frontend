import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface LoginResponse {
  login: boolean;
  userName: boolean;
  password: boolean;
  token?: string;
  refreshToken?: string;
  role?: string;
  customerId?: string;
  customerName?: string;
}

export interface RefreshResponse {
  token: string;
  refreshToken: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'current_user';
  private readonly ROLE_KEY = 'user_role';
  private readonly CUSTOMER_ID_KEY = 'customer_id';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  private userRoleSubject = new BehaviorSubject<'admin' | 'customer' | null>(this.getStoredRole());

  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  userRole$ = this.userRoleSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string, isCustomer: boolean = false): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/auth/login', {
      userName: username,
      password: password
    }).pipe(
      tap(response => {
        if (response.login) {
          this.setToken(response.token || '');
          if (response.refreshToken) {
            this.setRefreshToken(response.refreshToken);
          }
          this.setUser(username);
          localStorage.setItem('userName', username);
          const role = (response.role as 'admin' | 'customer') || (isCustomer ? 'customer' : 'admin');
          this.setRole(role);
          if (response.customerId) {
            this.setCustomerId(response.customerId);
          } else if (isCustomer) {
            this.setCustomerId(username);
          }
          this.isAuthenticatedSubject.next(true);
          this.userRoleSubject.next(role);
        }
      })
    );
  }

  /**
   * Refresh the access token using the stored refresh token.
   * Called automatically by the AuthInterceptor on 401 responses.
   */
  refreshAccessToken(): Observable<RefreshResponse> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<RefreshResponse>('/api/auth/refresh', {}, {
      headers: { Authorization: `Bearer ${refreshToken}` }
    }).pipe(
      tap(response => {
        this.setToken(response.token);
        if (response.refreshToken) {
          this.setRefreshToken(response.refreshToken);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.ROLE_KEY);
    localStorage.removeItem(this.CUSTOMER_ID_KEY);
    localStorage.removeItem('userName');
    this.isAuthenticatedSubject.next(false);
    this.userRoleSubject.next(null);
    this.router.navigate(['/Login']);
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  getCurrentUser(): string | null {
    return localStorage.getItem(this.USER_KEY);
  }

  getUserRole(): 'admin' | 'customer' | null {
    return (localStorage.getItem(this.ROLE_KEY) as 'admin' | 'customer') || null;
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'admin';
  }

  isCustomer(): boolean {
    return this.getUserRole() === 'customer';
  }

  getCustomerId(): string | null {
    return localStorage.getItem(this.CUSTOMER_ID_KEY);
  }

  private getStoredRole(): 'admin' | 'customer' | null {
    return (localStorage.getItem(this.ROLE_KEY) as 'admin' | 'customer') || null;
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  private setUser(username: string): void {
    localStorage.setItem(this.USER_KEY, username);
  }

  private setRole(role: 'admin' | 'customer'): void {
    localStorage.setItem(this.ROLE_KEY, role);
  }

  private setCustomerId(customerId: string): void {
    localStorage.setItem(this.CUSTOMER_ID_KEY, customerId);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }
}
