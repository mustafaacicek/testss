import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AdminUserService } from '../admin-user.service';
import { AdminUserResponse } from '../admin-user.model';
import { AdminLayoutComponent } from '../../../shared/layout/admin-layout.component';

@Component({
  selector: 'app-admin-user-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminLayoutComponent],
  templateUrl: './admin-user-detail.component.html',
  styleUrls: ['./admin-user-detail.component.scss']
})
export class AdminUserDetailComponent implements OnInit {
  adminUser?: AdminUserResponse;
  isLoading = false;
  errorMessage = '';
  adminUserId!: number;

  constructor(
    private adminUserService: AdminUserService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.adminUserId = +params['id'];
        this.loadAdminUser(this.adminUserId);
      } else {
        this.errorMessage = 'Admin user ID not provided';
      }
    });
  }

  loadAdminUser(id: number): void {
    this.isLoading = true;
    this.adminUserService.getAdminUserById(id).subscribe({
      next: (adminUser) => {
        this.adminUser = adminUser;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load admin user';
        this.isLoading = false;
      }
    });
  }

  deleteAdminUser(): void {
    if (!this.adminUser) return;
    
    if (confirm(`Are you sure you want to delete admin user ${this.adminUser.username}?`)) {
      this.adminUserService.deleteAdminUser(this.adminUserId).subscribe({
        next: () => {
          this.router.navigate(['/superadmin/admin-users']);
        },
        error: (error) => {
          this.errorMessage = error.error || 'Failed to delete admin user';
        }
      });
    }
  }

  goToEdit(): void {
    this.router.navigate(['/superadmin/admin-users/edit', this.adminUserId]);
  }

  goBack(): void {
    this.router.navigate(['/superadmin/admin-users']);
  }
}
