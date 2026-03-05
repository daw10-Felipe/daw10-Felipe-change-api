import { Component, ChangeDetectionStrategy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PetitionService } from '../../../services/petition.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../services/toast.service';
import { AuthService } from '../../../auth/auth.service';
import { PetitionImage } from '../../../models/petition.model';

@Component({
    selector: 'app-edit-component',
    imports: [ReactiveFormsModule],
    templateUrl: './edit-component.html',
    styleUrls: ['./edit-component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditComponent implements OnInit {
    petitionForm: FormGroup;
    petitionId: number | null = null;
    existingImages = signal<PetitionImage[]>([]);
    imagesToDelete = signal<number[]>([]);
    selectedFiles = signal<File[]>([]);
    previewUrls = signal<string[]>([]);

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

            this.existingImages.set(petition.images ?? []);
        });
    }

    toggleDeleteImage(id: number) {
        const current = this.imagesToDelete();
        if (current.includes(id)) {
            this.imagesToDelete.set(current.filter(x => x !== id));
        } else {
            this.imagesToDelete.set([...current, id]);
        }
    }

    isMarkedForDelete(id: number): boolean {
        return this.imagesToDelete().includes(id);
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const newFiles = Array.from(input.files);
            const addedUrls = newFiles.map(f => URL.createObjectURL(f));
            this.selectedFiles.set([...this.selectedFiles(), ...newFiles]);
            this.previewUrls.set([...this.previewUrls(), ...addedUrls]);
        }
    }

    removeNewFile(index: number) {
        const files = this.selectedFiles().slice();
        files.splice(index, 1);
        this.selectedFiles.set(files);

        const urls = this.previewUrls().slice();
        URL.revokeObjectURL(urls[index]);
        urls.splice(index, 1);
        this.previewUrls.set(urls);
    }

    onSubmit() {
        if (this.petitionForm.invalid || !this.petitionId) return;

        const formData = new FormData();
        formData.append('title', this.petitionForm.get('title')?.value);
        formData.append('description', this.petitionForm.get('description')?.value);
        formData.append('_method', 'PUT');

        this.imagesToDelete().forEach(id => {
            formData.append('delete_images[]', String(id));
        });

        this.selectedFiles().forEach(file => {
            formData.append('images[]', file);
        });

        this.petitionService.updatePetition(this.petitionId, formData).subscribe({
            next: () => {
                this.toastService.show('Petición actualizada con éxito', 'success');
                this.router.navigate(['/petitions', this.petitionId]);
            },
            error: () => {
                this.toastService.show('Error al actualizar la petición', 'error');
            }
        });
    }
}
