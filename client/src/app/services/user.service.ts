import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { User, CreateUserForm, UpdateUserForm } from '../models/user';
import { UserRole } from '../models/user-role';
import { environment } from '../../environments/environment';

interface UserResponse {
  id: number;
  username: string;
  code: string;
  role: number; 
  fullName?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/Users`;

  constructor(private http: HttpClient) { }

  private roleToInt(role: UserRole): number {
    switch (role) {
      case UserRole.Inspector:
        return 1;
      case UserRole.Editor:
        return 2;
      case UserRole.SuperAdmin:
        return 3;
      default:
        return 1;
    }
  }

  private intToRole(roleInt: number): UserRole {
    switch (roleInt) {
      case 1:
        return UserRole.Inspector;
      case 2:
        return UserRole.Editor;
      case 3:
        return UserRole.SuperAdmin;
      default:
        return UserRole.Inspector;
    }
  }

  private mapUserResponse(response: UserResponse): User {
    return {
      id: response.id,
      username: response.username,
      code: response.code,
      role: this.intToRole(response.role),
      fullName: response.fullName,
      email: response.email,
      isActive: response.isActive,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt
    };
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<UserResponse[]>(this.apiUrl).pipe(
      map(users => users.map(user => this.mapUserResponse(user)))
    );
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<UserResponse>(`${this.apiUrl}/${id}`).pipe(
      map(user => this.mapUserResponse(user))
    );
  }

  createUser(user: CreateUserForm): Observable<User> {
    const payload = {
      ...user,
      role: this.roleToInt(user.role)
    };
    return this.http.post<UserResponse>(this.apiUrl, payload).pipe(
      map(response => this.mapUserResponse(response))
    );
  }

  updateUser(id: number, user: UpdateUserForm): Observable<void> {
    const payload: any = { ...user };
    if (user.role !== undefined) {
      payload.role = this.roleToInt(user.role);
    }
    return this.http.put<void>(`${this.apiUrl}/${id}`, payload);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

