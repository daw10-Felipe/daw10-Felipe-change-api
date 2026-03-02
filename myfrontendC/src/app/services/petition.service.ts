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

    // Pide todas las peticiones al backend.
    getPetitions(): Observable<Petition[]> {
        return this.http.get<Petition[]>(this.apiUrl);
    }

    // Pide una petición concreta por su ID.
    getPetition(id: number | string): Observable<Petition> {
        return this.http.get<Petition>(`${this.apiUrl}/${id}`);
    }

    // Manda los datos al backend para crear una nueva petición.
    createPetition(petition: FormData): Observable<Petition> {
        return this.http.post<Petition>(this.apiUrl, petition);
    }

    // Actualiza una petición. Si hay imagen usa POST (truco de Laravel), si no PUT normal.
    updatePetition(id: number | string, petition: FormData | any): Observable<Petition> {
        if (petition instanceof FormData) {
            // Laravel no acepta PUT con FormData, hay que usar POST
            return this.http.post<Petition>(`${this.apiUrl}/${id}`, petition);
        }
        return this.http.put<Petition>(`${this.apiUrl}/${id}`, petition);
    }

    // Borra la petición.
    deletePetition(id: number | string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
