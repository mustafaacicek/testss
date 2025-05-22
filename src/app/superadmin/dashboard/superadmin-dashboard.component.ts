import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AdminLayoutComponent } from '../../shared/layout/admin-layout.component';

@Component({
  selector: 'app-superadmin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminLayoutComponent],
  templateUrl: './superadmin-dashboard.component.html',
  styleUrls: ['./superadmin-dashboard.component.scss']
})
export class SuperAdminDashboardComponent implements OnInit {
  username: string = '';
  statsData = [
    { title: 'Total Sounds', value: 42, icon: 'music', iconClass: 'primary' },
    { title: 'Lyrics', value: 36, icon: 'file-alt', iconClass: 'success' },
    { title: 'Playlists', value: 15, icon: 'list', iconClass: 'warning' },
    { title: 'Admin Users', value: 8, icon: 'users', iconClass: 'info' },
    { title: 'System Stats', value: 'Active', icon: 'chart-line', iconClass: 'danger' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn() || !this.authService.isSuperAdmin()) {
      this.router.navigate(['/login']);
      return;
    }

    this.username = this.authService.currentUserValue?.username || '';
  }

  // No need for logout method as it's handled by the layout component
}
