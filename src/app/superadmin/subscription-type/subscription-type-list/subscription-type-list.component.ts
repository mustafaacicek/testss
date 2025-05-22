import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SubscriptionTypeService } from '../subscription-type.service';
import { SubscriptionTypeResponse } from '../subscription-type.model';
import { AdminLayoutComponent } from '../../../shared/layout/admin-layout.component';

@Component({
  selector: 'app-subscription-type-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AdminLayoutComponent],
  templateUrl: './subscription-type-list.component.html',
  styleUrls: ['./subscription-type-list.component.scss']
})
export class SubscriptionTypeListComponent implements OnInit {
  subscriptionTypes: SubscriptionTypeResponse[] = [];
  filteredSubscriptionTypes: SubscriptionTypeResponse[] = [];
  searchQuery = '';
  isLoading = false;
  errorMessage = '';
  isSearching = false;
  statusFilter: 'all' | 'active' | 'inactive' = 'all';

  constructor(private subscriptionTypeService: SubscriptionTypeService) {}

  ngOnInit(): void {
    this.loadSubscriptionTypes();
  }

  loadSubscriptionTypes(): void {
    this.isLoading = true;
    this.subscriptionTypeService.getSubscriptionTypes().subscribe({
      next: (subscriptionTypes) => {
        this.subscriptionTypes = subscriptionTypes;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load subscription types';
        this.isLoading = false;
      }
    });
  }

  searchSubscriptionTypes(): void {
    if (!this.searchQuery.trim()) {
      this.applyFilters();
      return;
    }

    this.isSearching = true;
    this.subscriptionTypeService.searchSubscriptionTypes(this.searchQuery).subscribe({
      next: (subscriptionTypes) => {
        this.filteredSubscriptionTypes = this.applyStatusFilter(subscriptionTypes);
        this.isSearching = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to search subscription types';
        this.isSearching = false;
        // Fallback to client-side filtering if API search fails
        this.filteredSubscriptionTypes = this.applyStatusFilter(
          this.subscriptionTypes.filter(type => 
            type.name.toLowerCase().includes(this.searchQuery.toLowerCase())
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
      this.filteredSubscriptionTypes = [...this.subscriptionTypes];
    } else {
      const isActive = this.statusFilter === 'active';
      this.filteredSubscriptionTypes = this.subscriptionTypes.filter(type => type.isActive === isActive);
    }

    if (this.searchQuery.trim()) {
      this.filteredSubscriptionTypes = this.filteredSubscriptionTypes.filter(type =>
        type.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  }

  applyStatusFilter(types: SubscriptionTypeResponse[]): SubscriptionTypeResponse[] {
    if (this.statusFilter === 'all') {
      return types;
    } else {
      const isActive = this.statusFilter === 'active';
      return types.filter(type => type.isActive === isActive);
    }
  }

  deleteSubscriptionType(id: number, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    const type = this.subscriptionTypes.find(t => t.id === id);
    if (!type) return;
    
    if (confirm(`Are you sure you want to delete subscription type ${type.name}?`)) {
      this.subscriptionTypeService.deleteSubscriptionType(id).subscribe({
        next: () => {
          this.subscriptionTypes = this.subscriptionTypes.filter(t => t.id !== id);
          this.filteredSubscriptionTypes = this.filteredSubscriptionTypes.filter(t => t.id !== id);
        },
        error: (error) => {
          this.errorMessage = error.error || 'Failed to delete subscription type';
        }
      });
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}
