import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminUserService } from '../admin-user.service';
import { AdminUserRequest, TeamDropdown } from '../admin-user.model';
import { AdminLayoutComponent } from '../../../shared/layout/admin-layout.component';

@Component({
  selector: 'app-admin-user-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, AdminLayoutComponent],
  templateUrl: './admin-user-form.component.html',
  styleUrls: ['./admin-user-form.component.scss']
})
export class AdminUserFormComponent implements OnInit {
  adminUserForm!: FormGroup;
  isEditMode = false;
  adminUserId?: number;
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  teams: TeamDropdown[] = [];
  
  constructor(
    private fb: FormBuilder,
    private adminUserService: AdminUserService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadTeams();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.adminUserId = +params['id'];
        this.loadAdminUser(this.adminUserId);
      }
    });
  }

  initForm(): void {
    this.adminUserForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      teamId: ['', [Validators.required]],
      isActive: [true]
    });

    // Make password optional in edit mode
    if (this.isEditMode) {
      this.adminUserForm.get('password')?.setValidators([]);
    }
  }

  loadTeams(): void {
    this.adminUserService.getTeamsForDropdown().subscribe({
      next: (teams) => {
        this.teams = teams;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load teams';
      }
    });
  }

  loadAdminUser(id: number): void {
    this.isLoading = true;
    this.adminUserService.getAdminUserById(id).subscribe({
      next: (adminUser) => {
        // Remove password field for edit mode
        const formData = {
          username: adminUser.username,
          email: adminUser.email,
          teamId: adminUser.teamId,
          isActive: adminUser.isActive
        };
        
        this.adminUserForm.patchValue(formData);
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load admin user';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.adminUserForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.adminUserForm.controls).forEach(key => {
        const control = this.adminUserForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const adminUserData: AdminUserRequest = this.adminUserForm.value;
    
    // If password is empty in edit mode, remove it from the request
    if (this.isEditMode && !adminUserData.password) {
      delete adminUserData.password;
    }

    if (this.isEditMode && this.adminUserId) {
      this.updateAdminUser(this.adminUserId, adminUserData);
    } else {
      this.createAdminUser(adminUserData);
    }
  }

  createAdminUser(adminUserData: AdminUserRequest): void {
    this.adminUserService.createAdminUser(adminUserData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage = 'Admin user created successfully!';
        
        // Navigate to the admin user list after a short delay
        setTimeout(() => {
          this.router.navigate(['/superadmin/admin-users']);
        }, 1500);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error.error || 'Failed to create admin user';
      }
    });
  }

  updateAdminUser(id: number, adminUserData: AdminUserRequest): void {
    this.adminUserService.updateAdminUser(id, adminUserData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage = 'Admin user updated successfully!';
        
        // Navigate to the admin user list after a short delay
        setTimeout(() => {
          this.router.navigate(['/superadmin/admin-users']);
        }, 1500);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error.error || 'Failed to update admin user';
      }
    });
  }

  // Helper methods for form validation
  get usernameControl() { return this.adminUserForm.get('username'); }
  get emailControl() { return this.adminUserForm.get('email'); }
  get passwordControl() { return this.adminUserForm.get('password'); }
  get teamIdControl() { return this.adminUserForm.get('teamId'); }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.adminUserForm.get(controlName);
    return !!control && control.touched && control.hasError(errorName);
  }

  cancel(): void {
    this.router.navigate(['/superadmin/admin-users']);
  }
}
