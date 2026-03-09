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

    loadPetition(id: number) {
        this.petitionService.getPetition(id).subscribe(petition => {
            this.petition.set(petition);
        });
    }

    deletePetition() {
        if (confirm('¿Estás seguro de que quieres eliminar esta petición?')) {
            this.petitionService.deletePetition(this.petition()!.id).subscribe(() => {
                this.toastService.show('Petición eliminada con éxito', 'success');
                this.router.navigate(['/']);
            });
        }
    }

    isOwner(): boolean {
        const user = this.auth.getCurrentUser();
        const p = this.petition();
        return !!(user && p && user.id === p.user_id);
    }

    toggleSign() {
        const p = this.petition();
        if (!p) return;

        const action = p.has_signed
            ? this.petitionService.unsignPetition(p.id)
            : this.petitionService.signPetition(p.id);

        action.subscribe({
            next: (res) => {
                this.petition.set({ ...p, signers_count: res.signers_count, has_signed: res.has_signed });
                this.toastService.show(res.message, 'success');
            },
            error: (err) => {
                this.toastService.show(err.error?.message || 'Error al firmar', 'error');
            }
        });
    }
}
