import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, tap, finalize, switchMap } from 'rxjs';
import { LoginResponse, User } from './auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = 'http://localhost:8000/api';
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  constructor(private http: HttpClient, private router: Router) { }

  login(credentials: { email: string; password: string }) {
    return this.http
      .post<LoginResponse>(`${this.api}/login`, credentials)
      .pipe(
        tap((res) => this.storeTokens(res)),
        switchMap(() => this.getProfile())
      );
  }

  register(data: { name: string; email: string; password: string }) {
    return this.http.post(`${this.api}/register`, data);
  }

  logout() {
    return this.http
      .post(`${this.api}/logout`, {})
      .pipe(finalize(() => {
        this.clearTokens(); // Limpiamos el LocalStorage y el estado del usuario
        this.router.navigate(['/login']);
      }));
  }

  private clearTokens() {
    localStorage.clear();
    this.userSubject.next(null);
  }

  getProfile() {
    return this.http.get<User>(`${this.api}/me`).pipe(tap((user) => this.userSubject.next(user)));
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  private storeTokens(res: LoginResponse) {
    // Guardamos el token JWT en el navegador
    localStorage.setItem('access_token', res.access_token);
  }

  getAccessToken() {
    return localStorage.getItem('access_token');
  }

  refreshToken() {
    return this.http.post<{ access_token: string }>(`${this.api}/refresh`, {}).pipe(
      tap((res) => {
        localStorage.setItem('access_token', res.access_token);
      }),
    );
  }

  loadUserIfNeeded() {
    if (this.getAccessToken() && !this.userSubject.value) {
      this.getProfile().subscribe({
        error: () => this.clearTokens(),
      });
    }
  }
}