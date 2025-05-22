import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { SubscriptionTypeService } from '../subscription-type.service';
import { SubscriptionTypeResponse } from '../subscription-type.model';
import { AdminLayoutComponent } from '../../../shared/layout/admin-layout.component';

@Component({
  selector: 'app-subscription-type-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminLayoutComponent],
  templateUrl: './subscription-type-detail.component.html',
  styleUrls: ['./subscription-type-detail.component.scss']
})
export class SubscriptionTypeDetailComponent implements OnInit {
  subscriptionType?: SubscriptionTypeResponse;
  isLoading = false;
  errorMessage = '';
  subscriptionTypeId!: number;

  constructor(
    private subscriptionTypeService: SubscriptionTypeService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.subscriptionTypeId = +params['id'];
        this.loadSubscriptionType(this.subscriptionTypeId);
      } else {
        this.errorMessage = 'Subscription type ID not provided';
      }
    });
  }

  loadSubscriptionType(id: number): void {
    this.isLoading = true;
    this.subscriptionTypeService.getSubscriptionTypeById(id).subscribe({
      next: (subscriptionType) => {
        this.subscriptionType = subscriptionType;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load subscription type';
        this.isLoading = false;
      }
    });
  }

  deleteSubscriptionType(): void {
    if (!this.subscriptionType) return;
    
    if (this.subscriptionType.teamsCount > 0) {
      this.errorMessage = `Cannot delete subscription type '${this.subscriptionType.name}' as it is being used by ${this.subscriptionType.teamsCount} teams`;
      return;
    }
    
    if (confirm(`Are you sure you want to delete subscription type ${this.subscriptionType.name}?`)) {
      this.subscriptionTypeService.deleteSubscriptionType(this.subscriptionTypeId).subscribe({
        next: () => {
          this.router.navigate(['/superadmin/subscription-types']);
        },
        error: (error) => {
          this.errorMessage = error.error || 'Failed to delete subscription type';
        }
      });
    }
  }

  goToEdit(): void {
    this.router.navigate(['/superadmin/subscription-types/edit', this.subscriptionTypeId]);
  }

  goBack(): void {
    this.router.navigate(['/superadmin/subscription-types']);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}
