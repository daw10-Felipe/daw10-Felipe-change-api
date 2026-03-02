import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { ToastService } from '../../services/toast.service';
@Component({
  standalone: true,
  selector: 'app-register',
  imports: [FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent {
  formData = {
    name: '',
    email: '',
    password: '',
  };
  constructor(
    private auth: AuthService,
    private router: Router,
    private toastService: ToastService
  ) { }
  // Registra al usuario. Si sale bien te manda al login, si no muestra el error que devuelva el backend.
  register() {
    // Llamada al servicio de autenticación
    this.auth.register(this.formData).subscribe({
      next: () => {
        this.toastService.show('Registro exitoso', 'success');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        let msg = 'Error al registrar usuario';
        if (err.error && err.error.message) {
          msg = err.error.message;
        }
        // Si hay errores de validación específicos, cogemos el primero
        if (err.error && err.error.errors) {
          const firstErrorKey = Object.keys(err.error.errors)[0];
          if (firstErrorKey) {
            msg = err.error.errors[firstErrorKey][0];
          }
        }
        this.toastService.show(msg, 'error');
      },
    });
  }
}
