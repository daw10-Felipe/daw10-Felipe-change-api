import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PetitionService } from '../../../services/petition.service';
import { Router } from '@angular/router';
import { ToastService } from '../../../services/toast.service';

@Component({
    selector: 'app-create-component',
    imports: [ReactiveFormsModule],
    templateUrl: './create-component.html',
    styleUrls: ['./create-component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateComponent {
    petitionForm: FormGroup;
    selectedFiles = signal<File[]>([]);
    previewUrls = signal<string[]>([]);

    constructor(
        private fb: FormBuilder,
        private petitionService: PetitionService,
        private router: Router,
        private toastService: ToastService
    ) {
        this.petitionForm = this.fb.group({
            title: ['', Validators.required],
            description: ['', Validators.required],
        });
    }

    // Guarda las imágenes seleccionadas y genera miniaturas de vista previa.
    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const newFiles = Array.from(input.files);
            const currentFiles = this.selectedFiles();
            const currentUrls = this.previewUrls();

            const addedUrls = newFiles.map(f => URL.createObjectURL(f));
            this.selectedFiles.set([...currentFiles, ...newFiles]);
            this.previewUrls.set([...currentUrls, ...addedUrls]);
        }
    }

    // Elimina una imagen de la selección.
    removeFile(index: number) {
        const files = this.selectedFiles().slice();
        files.splice(index, 1);
        this.selectedFiles.set(files);

        const urls = this.previewUrls().slice();
        URL.revokeObjectURL(urls[index]);
        urls.splice(index, 1);
        this.previewUrls.set(urls);
    }

    // Crea el FormData con título, descripción e imágenes y lo manda al servicio.
    onSubmit() {
        if (this.petitionForm.invalid) return;

        const formData = new FormData();
        formData.append('title', this.petitionForm.get('title')?.value);
        formData.append('description', this.petitionForm.get('description')?.value);

        this.selectedFiles().forEach(file => {
            formData.append('images[]', file);
        });

        this.petitionService.createPetition(formData).subscribe({
            next: () => {
                this.toastService.show('¡Petición creada con éxito!', 'success');
                this.router.navigate(['/']);
            },
            error: () => {
                this.toastService.show('Error al crear la petición', 'error');
            }
        });
    }
}
