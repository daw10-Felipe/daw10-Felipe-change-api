import { Component, OnInit, signal } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { User } from '../../../auth/auth.model';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './users.html',
  styleUrls: ['../shared/admin-shared.css']
})
export class AdminUsersComponent implements OnInit {
  users = signal<(User & { petitions_count?: number })[]>([]);
  loading = signal(true);
  showModal = signal(false);
  editingUser: User | null = null;

  form = { name: '', email: '', password: '', rol_id: 0 };

  constructor(private adminService: AdminService, private toast: ToastService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.adminService.getUsers().subscribe({
      next: (data) => { this.users.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); }
    });
  }

  openEdit(user: User) {
    this.editingUser = user;
    this.form = { name: user.name, email: user.email, password: '', rol_id: user.rol_id };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingUser = null;
  }

  saveUser() {
    if (!this.editingUser) return;
    const data: any = { name: this.form.name, email: this.form.email, rol_id: this.form.rol_id };
    if (this.form.password) data.password = this.form.password;

    this.adminService.updateUser(this.editingUser.id, data).subscribe({
      next: () => {
        this.toast.show('Usuario actualizado correctamente', 'success');
        this.closeModal();
        this.loadUsers();
      },
      error: () => this.toast.show('Error al actualizar usuario', 'error')
    });
  }

  deleteUser(user: User) {
    if (!confirm(`¿Eliminar al usuario "${user.name}"?`)) return;
    this.adminService.deleteUser(user.id).subscribe({
      next: () => {
        this.toast.show('Usuario eliminado', 'success');
        this.loadUsers();
      },
      error: (err) => this.toast.show(err.error?.message || 'Error al eliminar', 'error')
    });
  }
}
