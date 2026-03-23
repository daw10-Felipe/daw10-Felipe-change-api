import { Component, OnInit, signal } from '@angular/core';
import { AdminService, Category } from '../../../services/admin.service';
import { Petition } from '../../../models/petition.model';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-admin-petitions',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './petitions.html',
  styleUrls: ['../shared/admin-shared.css']
})
export class AdminPetitionsComponent implements OnInit {
  petitions = signal<Petition[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);
  showModal = signal(false);
  editingPetition: Petition | null = null;
  newImages: File[] = [];
  deleteImages: number[] = [];

  form = { title: '', description: '', category: '', status: 'active' };

  constructor(private adminService: AdminService, private toast: ToastService) {}

  ngOnInit() {
    this.loadPetitions();
    this.loadCategories();
  }

  loadCategories() {
    this.adminService.getCategories().subscribe({
      next: (data) => this.categories.set(data),
      error: (err) => console.error('Error loading categories', err)
    });
  }

  loadPetitions() {
    this.loading.set(true);
    this.adminService.getPetitions().subscribe({
      next: (data) => { this.petitions.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); }
    });
  }

  openEdit(petition: Petition) {
    this.editingPetition = petition;
    this.newImages = [];
    this.deleteImages = [];
    this.form = {
      title: petition.title,
      description: petition.description,
      category: petition.category || '',
      status: petition.status ? petition.status.toLowerCase() : 'active'
    };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingPetition = null;
  }

  onFileSelected(event: any) {
    if (event.target.files) {
      this.newImages = Array.from(event.target.files);
    }
  }

  markImageForDeletion(imageId: number) {
    if (!this.deleteImages.includes(imageId)) {
      this.deleteImages.push(imageId);
    } else {
      this.deleteImages = this.deleteImages.filter(id => id !== imageId);
    }
  }

  savePetition() {
    if (!this.editingPetition) return;

    const formData = new FormData();
    formData.append('title', this.form.title);
    formData.append('description', this.form.description);
    if (this.form.category) {
      formData.append('category', this.form.category);
    }
    formData.append('status', this.form.status);

    this.newImages.forEach(file => {
      formData.append('images[]', file);
    });

    this.deleteImages.forEach(id => {
      formData.append('delete_images[]', id.toString());
    });

    this.adminService.updatePetition(this.editingPetition.id, formData).subscribe({
      next: () => {
        this.toast.show('Petición actualizada correctamente', 'success');
        this.closeModal();
        this.loadPetitions();
      },
      error: () => this.toast.show('Error al actualizar petición', 'error')
    });
  }

  deletePetition(petition: Petition) {
    if (!confirm(`¿Eliminar la petición "${petition.title}"?`)) return;
    this.adminService.deletePetition(petition.id).subscribe({
      next: () => {
        this.toast.show('Petición eliminada', 'success');
        this.loadPetitions();
      },
      error: () => this.toast.show('Error al eliminar', 'error')
    });
  }
}
