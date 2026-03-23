import { Component, OnInit, signal } from '@angular/core';
import { AdminService, AdminStats } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class AdminDashboardComponent implements OnInit {
  stats = signal<AdminStats>({ total_users: 0, total_petitions: 0, total_categories: 0, active_petitions: 0 });
  loading = signal(true);

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.adminService.getStats().subscribe({
      next: (data) => { this.stats.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); }
    });
  }
}
