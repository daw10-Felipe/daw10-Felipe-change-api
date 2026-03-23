import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../auth/auth.model';
import { Petition } from '../models/petition.model';

export interface Category {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface AdminStats {
  total_users: number;
  total_petitions: number;
  total_categories: number;
  active_petitions: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private api = 'http://localhost:8000/api/admin';

  constructor(private http: HttpClient) {}

  
  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.api}/stats`);
  }

  
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.api}/users`);
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.api}/users/${id}`);
  }

  updateUser(id: number, data: any): Observable<User> {
    return this.http.put<User>(`${this.api}/users/${id}`, data);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.api}/users/${id}`);
  }

  
  getPetitions(): Observable<Petition[]> {
    return this.http.get<Petition[]>(`${this.api}/petitions`);
  }

  getPetition(id: number): Observable<Petition> {
    return this.http.get<Petition>(`${this.api}/petitions/${id}`);
  }

  updatePetition(id: number, data: any): Observable<Petition> {
    if (data instanceof FormData) {
      if (!data.has('_method')) {
        data.append('_method', 'PUT');
      }
      return this.http.post<Petition>(`${this.api}/petitions/${id}`, data);
    }
    return this.http.put<Petition>(`${this.api}/petitions/${id}`, data);
  }

  deletePetition(id: number): Observable<any> {
    return this.http.delete(`${this.api}/petitions/${id}`);
  }

  
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.api}/categories`);
  }

  createCategory(data: { name: string }): Observable<Category> {
    return this.http.post<Category>(`${this.api}/categories`, data);
  }

  updateCategory(id: number, data: { name: string }): Observable<Category> {
    return this.http.put<Category>(`${this.api}/categories/${id}`, data);
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.api}/categories/${id}`);
  }
}
