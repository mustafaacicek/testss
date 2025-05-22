import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SubscriptionTypeService } from '../subscription-type.service';
import { SubscriptionTypeRequest } from '../subscription-type.model';
import { AdminLayoutComponent } from '../../../shared/layout/admin-layout.component';

@Component({
  selector: 'app-subscription-type-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, AdminLayoutComponent],
  templateUrl: './subscription-type-form.component.html',
  styleUrls: ['./subscription-type-form.component.scss']
})
export class SubscriptionTypeFormComponent implements OnInit {
  subscriptionTypeForm!: FormGroup;
  isEditMode = false;
  subscriptionTypeId?: number;
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  
  constructor(
    private fb: FormBuilder,
    private subscriptionTypeService: SubscriptionTypeService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.subscriptionTypeId = +params['id'];
        this.loadSubscriptionType(this.subscriptionTypeId);
      }
    });
  }

  initForm(): void {
    this.subscriptionTypeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      price: [0, [Validators.required, Validators.min(0)]],
      durationDays: [30, [Validators.required, Validators.min(1)]],
      maxClients: [0, [Validators.required, Validators.min(0)]],
      maxMatches: [0, [Validators.required, Validators.min(0)]],
      description: [''],
      isActive: [true]
    });
  }

  loadSubscriptionType(id: number): void {
    this.isLoading = true;
    this.subscriptionTypeService.getSubscriptionTypeById(id).subscribe({
      next: (subscriptionType) => {
        this.subscriptionTypeForm.patchValue({
          name: subscriptionType.name,
          price: subscriptionType.price,
          durationDays: subscriptionType.durationDays,
          maxClients: subscriptionType.maxClients,
          maxMatches: subscriptionType.maxMatches,
          description: subscriptionType.description,
          isActive: subscriptionType.isActive
        });
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load subscription type';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.subscriptionTypeForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.subscriptionTypeForm.controls).forEach(key => {
        const control = this.subscriptionTypeForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const subscriptionTypeData: SubscriptionTypeRequest = this.subscriptionTypeForm.value;

    if (this.isEditMode && this.subscriptionTypeId) {
      this.updateSubscriptionType(this.subscriptionTypeId, subscriptionTypeData);
    } else {
      this.createSubscriptionType(subscriptionTypeData);
    }
  }

  createSubscriptionType(subscriptionTypeData: SubscriptionTypeRequest): void {
    this.subscriptionTypeService.createSubscriptionType(subscriptionTypeData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage = 'Subscription type created successfully!';
        
        // Navigate to the subscription type list after a short delay
        setTimeout(() => {
          this.router.navigate(['/superadmin/subscription-types']);
        }, 1500);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error.error || 'Failed to create subscription type';
      }
    });
  }

  updateSubscriptionType(id: number, subscriptionTypeData: SubscriptionTypeRequest): void {
    this.subscriptionTypeService.updateSubscriptionType(id, subscriptionTypeData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.successMessage = 'Subscription type updated successfully!';
        
        // Navigate to the subscription type list after a short delay
        setTimeout(() => {
          this.router.navigate(['/superadmin/subscription-types']);
        }, 1500);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error.error || 'Failed to update subscription type';
      }
    });
  }

  // Helper methods for form validation
  get nameControl() { return this.subscriptionTypeForm.get('name'); }
  get priceControl() { return this.subscriptionTypeForm.get('price'); }
  get durationDaysControl() { return this.subscriptionTypeForm.get('durationDays'); }
  get maxClientsControl() { return this.subscriptionTypeForm.get('maxClients'); }
  get maxMatchesControl() { return this.subscriptionTypeForm.get('maxMatches'); }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.subscriptionTypeForm.get(controlName);
    return !!control && control.touched && control.hasError(errorName);
  }

  cancel(): void {
    this.router.navigate(['/superadmin/subscription-types']);
  }
}
