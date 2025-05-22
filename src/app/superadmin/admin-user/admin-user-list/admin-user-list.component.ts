import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminUserService } from '../admin-user.service';
import { AdminUserResponse } from '../admin-user.model';
import { AdminLayoutComponent } from '../../../shared/layout/admin-layout.component';

@Component({
  selector: 'app-admin-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AdminLayoutComponent],
  templateUrl: './admin-user-list.component.html',
  styleUrls: ['./admin-user-list.component.scss']
})
export class AdminUserListComponent implements OnInit {
  adminUsers: AdminUserResponse[] = [];
  filteredAdminUsers: AdminUserResponse[] = [];
  searchQuery = '';
  isLoading = false;
  errorMessage = '';
  isSearching = false;
  statusFilter: 'all' | 'active' | 'inactive' = 'all';

  constructor(private adminUserService: AdminUserService) {}

  ngOnInit(): void {
    this.loadAdminUsers();
  }

  loadAdminUsers(): void {
    this.isLoading = true;
    this.adminUserService.getAdminUsers().subscribe({
      next: (adminUsers) => {
        this.adminUsers = adminUsers;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load admin users';
        this.isLoading = false;
      }
    });
  }

  searchAdminUsers(): void {
    if (!this.searchQuery.trim()) {
      this.applyFilters();
      return;
    }

    this.isSearching = true;
    this.adminUserService.searchAdminUsers(this.searchQuery).subscribe({
      next: (adminUsers) => {
        this.filteredAdminUsers = this.applyStatusFilter(adminUsers);
        this.isSearching = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to search admin users';
        this.isSearching = false;
        // Fallback to client-side filtering if API search fails
        this.filteredAdminUsers = this.applyStatusFilter(
          this.adminUsers.filter(user => 
            user.username.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(this.searchQuery.toLowerCase())
          )
        );
      }
    });
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilters();
  }

  filterByStatus(status: 'all' | 'active' | 'inactive'): void {
    this.statusFilter = status;
    this.applyFilters();
  }

  applyFilters(): void {
    if (this.statusFilter === 'all') {
      this.filteredAdminUsers = [...this.adminUsers];
    } else {
      const isActive = this.statusFilter === 'active';
      this.filteredAdminUsers = this.adminUsers.filter(user => user.isActive === isActive);
    }

    if (this.searchQuery.trim()) {
      this.filteredAdminUsers = this.filteredAdminUsers.filter(user =>
        user.username.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  }

  applyStatusFilter(users: AdminUserResponse[]): AdminUserResponse[] {
    if (this.statusFilter === 'all') {
      return users;
    } else {
      const isActive = this.statusFilter === 'active';
      return users.filter(user => user.isActive === isActive);
    }
  }

  deleteAdminUser(id: number, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    const user = this.adminUsers.find(u => u.id === id);
    if (!user) return;
    
    if (confirm(`Are you sure you want to delete admin user ${user.username}?`)) {
      this.adminUserService.deleteAdminUser(id).subscribe({
        next: () => {
          this.adminUsers = this.adminUsers.filter(u => u.id !== id);
          this.filteredAdminUsers = this.filteredAdminUsers.filter(u => u.id !== id);
        },
        error: (error) => {
          this.errorMessage = error.error || 'Failed to delete admin user';
        }
      });
    }
  }
}
