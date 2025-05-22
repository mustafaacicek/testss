import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AdminLayoutComponent } from '../../shared/layout/admin-layout.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminLayoutComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  username: string = '';
  statsData = [
    { title: 'Total Sounds', value: 24, icon: 'music', iconClass: 'primary' },
    { title: 'Lyrics', value: 18, icon: 'file-alt', iconClass: 'success' },
    { title: 'Playlists', value: 7, icon: 'list', iconClass: 'warning' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn() || !this.authService.isAdmin()) {
      this.router.navigate(['/login']);
      return;
    }

    this.username = this.authService.currentUserValue?.username || '';
  }

  // No need for logout method as it's handled by the layout component
}
