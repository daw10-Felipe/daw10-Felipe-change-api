import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../auth/auth.model';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit {
  user: User | null = null;

  constructor(
    public auth: AuthService,
    private router: Router,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.auth.user$.subscribe(user => {
      this.user = user;
    });
    this.auth.loadUserIfNeeded();
  }

  logout() {
    this.auth.logout().subscribe();
  }

  navigateToCreate() {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/petitions/create']);
    } else {
      this.toastService.show('Debes iniciar sesión para crear una petición', 'error');
    }
  }
}
