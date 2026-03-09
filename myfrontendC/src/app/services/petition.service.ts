import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Petition } from '../models/petition.model';

@Injectable({
    providedIn: 'root'
})
export class PetitionService {
    private apiUrl = 'http://localhost:8000/api/petitions';

    constructor(private http: HttpClient) { }

    getPetitions(): Observable<Petition[]> {
        return this.http.get<Petition[]>(this.apiUrl);
    }

    getPetition(id: number | string): Observable<Petition> {
        return this.http.get<Petition>(`${this.apiUrl}/${id}`);
    }

    createPetition(petition: FormData): Observable<Petition> {
        return this.http.post<Petition>(this.apiUrl, petition);
    }

    updatePetition(id: number | string, petition: FormData | any): Observable<Petition> {
        if (petition instanceof FormData) {

            return this.http.post<Petition>(`${this.apiUrl}/${id}`, petition);
        }
        return this.http.put<Petition>(`${this.apiUrl}/${id}`, petition);
    }

    deletePetition(id: number | string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    signPetition(id: number | string): Observable<{ message: string; signers_count: number; has_signed: boolean }> {
        return this.http.post<{ message: string; signers_count: number; has_signed: boolean }>(`${this.apiUrl}/${id}/sign`, {});
    }

    unsignPetition(id: number | string): Observable<{ message: string; signers_count: number; has_signed: boolean }> {
        return this.http.delete<{ message: string; signers_count: number; has_signed: boolean }>(`${this.apiUrl}/${id}/sign`);
    }
}
