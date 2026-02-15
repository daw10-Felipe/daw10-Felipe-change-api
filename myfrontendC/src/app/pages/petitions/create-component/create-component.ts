import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PetitionService } from '../../../services/petition.service';
import { Router } from '@angular/router';
import { ToastService } from '../../../services/toast.service';

@Component({
    selector: 'app-create-component',
    standalone: true,
    imports: [ReactiveFormsModule],
    templateUrl: './create-component.html',
    styleUrls: ['./create-component.css']
})
export class CreateComponent {
    petitionForm: FormGroup;
    selectedFile = signal<File | null>(null);

    constructor(
        private fb: FormBuilder,
        private petitionService: PetitionService,
        private router: Router,
        private toastService: ToastService
    ) {
        this.petitionForm = this.fb.group({
            title: ['', Validators.required],
            description: ['', Validators.required],
            image: [null]
        });
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.selectedFile.set(input.files[0]);
        }
    }

    onSubmit() {
        if (this.petitionForm.invalid) return;

        const formData = new FormData();
        formData.append('title', this.petitionForm.get('title')?.value);
        formData.append('description', this.petitionForm.get('description')?.value);

        const file = this.selectedFile();
        if (file) {
            formData.append('image', file);
        }

        this.petitionService.createPetition(formData).subscribe({
            next: () => {
                this.toastService.show('¡Petición creada con éxito!', 'success');
                this.router.navigate(['/']);
            },
            error: (err) => {
                this.toastService.show('Error al crear la petición', 'error');
            }
        });
    }
}
