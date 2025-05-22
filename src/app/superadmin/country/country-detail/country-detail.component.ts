import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CountryService } from '../country.service';
import { CountryResponse } from '../country.model';
import { AdminLayoutComponent } from '../../../shared/layout/admin-layout.component';

@Component({
  selector: 'app-country-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminLayoutComponent],
  templateUrl: './country-detail.component.html',
  styleUrls: ['./country-detail.component.scss']
})
export class CountryDetailComponent implements OnInit {
  country?: CountryResponse;
  isLoading = true;
  errorMessage = '';

  constructor(
    private countryService: CountryService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadCountry(+params['id']);
      } else {
        this.router.navigate(['/superadmin/countries']);
      }
    });
  }

  loadCountry(id: number): void {
    this.isLoading = true;
    this.countryService.getCountryById(id).subscribe({
      next: (country) => {
        this.country = country;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load country';
        this.isLoading = false;
      }
    });
  }

  deleteCountry(): void {
    if (!this.country) return;
    
    if (confirm(`Are you sure you want to delete ${this.country.name}?`)) {
      this.countryService.deleteCountry(this.country.id).subscribe({
        next: () => {
          this.router.navigate(['/superadmin/countries']);
        },
        error: (error) => {
          this.errorMessage = error.error || 'Failed to delete country';
        }
      });
    }
  }
}
