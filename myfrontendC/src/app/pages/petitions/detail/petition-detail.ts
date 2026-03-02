import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { PetitionService } from '../../../services/petition.service';
import { ToastService } from '../../../services/toast.service';
import { AuthService } from '../../../auth/auth.service';
import { Petition } from '../../../models/petition.model';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
    selector: 'app-petition-detail',
    standalone: true,
    imports: [RouterLink, DatePipe, CommonModule],
    templateUrl: './petition-detail.html',
    styleUrls: ['./petition-detail.css']
})
export class PetitionDetailComponent implements OnInit {
    petition = signal<Petition | null>(null);

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private petitionService: PetitionService,
        private toastService: ToastService,
        public auth: AuthService
    ) { }

    ngOnInit() {
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.loadPetition(+params['id']);
            }
        });
    }

    // Carga la info completa de la petición.
    loadPetition(id: number) {
        this.petitionService.getPetition(id).subscribe(petition => {
            this.petition.set(petition);
        });
    }

    // Borra la petición si confirmas y eres el dueño.
    deletePetition() {
        if (confirm('¿Estás seguro de que quieres eliminar esta petición?')) {
            this.petitionService.deletePetition(this.petition()!.id).subscribe(() => {
                this.toastService.show('Petición eliminada con éxito', 'success');
                this.router.navigate(['/']);
            });
        }
    }

    // Comprueba si la petición es tuya para mostrar botones de editar/borrar.
    isOwner(): boolean {
        const user = this.auth.getCurrentUser();
        const p = this.petition();
        return !!(user && p && user.id === p.user_id);
    }
}
