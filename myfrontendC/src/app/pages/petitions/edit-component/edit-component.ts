import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PetitionService } from '../../../services/petition.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../services/toast.service';
import { AuthService } from '../../../auth/auth.service';
import { Petition } from '../../../models/petition.model';

@Component({
    selector: 'app-edit-component',
    standalone: true,
    imports: [ReactiveFormsModule],
    templateUrl: './edit-component.html',
    styleUrls: ['./edit-component.css']
})
export class EditComponent implements OnInit {
    petitionForm: FormGroup;
    petitionId: number | null = null;
    currentImage = signal<string | null>(null);
    selectedFile = signal<File | null>(null);

    constructor(
        private fb: FormBuilder,
        private petitionService: PetitionService,
        private router: Router,
        private route: ActivatedRoute,
        private toastService: ToastService,
        private authService: AuthService
    ) {
        this.petitionForm = this.fb.group({
            title: ['', Validators.required],
            description: ['', Validators.required],
            image: [null]
        });
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.petitionId = +params['id'];
                this.loadPetition(this.petitionId);
            }
        });
    }

    loadPetition(id: number) {
        this.petitionService.getPetition(id).subscribe(petition => {
            const currentUser = this.authService.getCurrentUser();
            if (currentUser && petition.user_id !== currentUser.id) {
                this.toastService.show('No tienes autorización para editar esta petición', 'error');
                this.router.navigate(['/']);
                return;
            }

            this.petitionForm.patchValue({
                title: petition.title,
                description: petition.description
            });

            if (petition.image) {
                this.currentImage.set(petition.image);
            }
        });
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.selectedFile.set(input.files[0]);
        }
    }

    onSubmit() {
        if (this.petitionForm.invalid || !this.petitionId) return;

        const formData = new FormData();
        formData.append('title', this.petitionForm.get('title')?.value);
        formData.append('description', this.petitionForm.get('description')?.value);

        // Laravel needs _method: PUT to handle FormData in PUT requests
        formData.append('_method', 'PUT');

        const file = this.selectedFile();
        if (file) {
            formData.append('image', file);
        }

        this.petitionService.updatePetition(this.petitionId, formData).subscribe({
            next: () => {
                this.toastService.show('Petición actualizada con éxito', 'success');
                this.router.navigate(['/petitions', this.petitionId]);
            },
            error: (err) => {
                this.toastService.show('Error al actualizar la petición', 'error');
            }
        });
    }
}
