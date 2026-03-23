import { Component, OnInit, signal } from '@angular/core';
import { AdminService, Category } from '../../../services/admin.service';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './categories.html',
  styleUrls: ['../shared/admin-shared.css']
})
export class AdminCategoriesComponent implements OnInit {
  categories = signal<Category[]>([]);
  loading = signal(true);
  showModal = signal(false);
  editingCategory: Category | null = null;

  form = { name: '' };

  constructor(private adminService: AdminService, private toast: ToastService) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.loading.set(true);
    this.adminService.getCategories().subscribe({
      next: (data) => { this.categories.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); }
    });
  }

  openCreate() {
    this.editingCategory = null;
    this.form = { name: '' };
    this.showModal.set(true);
  }

  openEdit(category: Category) {
    this.editingCategory = category;
    this.form = { name: category.name };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingCategory = null;
  }

  saveCategory() {
    if (this.editingCategory) {
      this.adminService.updateCategory(this.editingCategory.id, this.form).subscribe({
        next: () => {
          this.toast.show('Categoría actualizada', 'success');
          this.closeModal();
          this.loadCategories();
        },
        error: () => this.toast.show('Error al actualizar', 'error')
      });
    } else {
      this.adminService.createCategory(this.form).subscribe({
        next: () => {
          this.toast.show('Categoría creada', 'success');
          this.closeModal();
          this.loadCategories();
        },
        error: (err) => this.toast.show(err.error?.message || 'Error al crear categoría', 'error')
      });
    }
  }

  deleteCategory(category: Category) {
    if (!confirm(`¿Eliminar la categoría "${category.name}"?`)) return;
    this.adminService.deleteCategory(category.id).subscribe({
      next: () => {
        this.toast.show('Categoría eliminada', 'success');
        this.loadCategories();
      },
      error: () => this.toast.show('Error al eliminar', 'error')
    });
  }
}
