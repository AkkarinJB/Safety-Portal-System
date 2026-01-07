import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { LoginResponse } from '../models/api-responses';
import { UserRole, UserInfo } from '../models/user-role';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/Auth`;
  private readonly TOKEN_KEY = 'token';
  private readonly ROLE_KEY = 'userRole';
  private readonly USERNAME_KEY = 'username';

  constructor(private http: HttpClient, private router: Router) { }

  login(code: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { code })
      .pipe(tap(res => {
        if (res.token) {
          localStorage.setItem(this.TOKEN_KEY, res.token);
          localStorage.setItem(this.ROLE_KEY, res.role);
          localStorage.setItem(this.USERNAME_KEY, res.username);
        }
      }));
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.ROLE_KEY);
    localStorage.removeItem(this.USERNAME_KEY);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUserRole(): UserRole | null {
    const role = localStorage.getItem(this.ROLE_KEY);
    if (!role) return null;
    
    // Validate role
    if (role === UserRole.Inspector || role === UserRole.Editor || role === UserRole.SuperAdmin) {
      return role as UserRole;
    }
    return null;
  }

  getUsername(): string | null {
    return localStorage.getItem(this.USERNAME_KEY);
  }

  getUserInfo(): UserInfo | null {
    const token = this.getToken();
    const role = this.getUserRole();
    const username = this.getUsername();
    
    if (!token || !role || !username) {
      return null;
    }
    
    return { token, role, username };
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  hasRole(role: UserRole): boolean {
    return this.getUserRole() === role;
  }

  isInspector(): boolean {
    return this.hasRole(UserRole.Inspector);
  }

  isEditor(): boolean {
    return this.hasRole(UserRole.Editor);
  }

  isSuperAdmin(): boolean {
    return this.hasRole(UserRole.SuperAdmin);
  }
}