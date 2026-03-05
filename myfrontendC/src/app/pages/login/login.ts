import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  email = '';
  password = '';
  constructor(
    private auth: AuthService,
    private router: Router,
    private toastService: ToastService
  ) { }
  login() {
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.router.navigate(['/petitions']);
      },
      error: (err) => {
        this.toastService.show('Credenciales incorrectas', 'error');
      },
    });
  }
}
