import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CountryService } from '../country.service';
import { CountryResponse } from '../country.model';
import { AdminLayoutComponent } from '../../../shared/layout/admin-layout.component';

@Component({
  selector: 'app-country-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AdminLayoutComponent],
  templateUrl: './country-list.component.html',
  styleUrls: ['./country-list.component.scss']
})
export class CountryListComponent implements OnInit {
  countries: CountryResponse[] = [];
  filteredCountries: CountryResponse[] = [];
  searchQuery = '';
  isLoading = false;
  errorMessage = '';
  isSearching = false;

  constructor(private countryService: CountryService) {}

  ngOnInit(): void {
    this.loadCountries();
  }

  loadCountries(): void {
    this.isLoading = true;
    this.countryService.getCountries().subscribe({
      next: (countries) => {
        this.countries = countries;
        this.filteredCountries = [...countries];
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load countries';
        this.isLoading = false;
      }
    });
  }

  searchCountries(): void {
    if (!this.searchQuery.trim()) {
      this.filteredCountries = [...this.countries];
      return;
    }

    this.isSearching = true;
    this.countryService.searchCountries(this.searchQuery).subscribe({
      next: (countries) => {
        this.filteredCountries = countries;
        this.isSearching = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to search countries';
        this.isSearching = false;
        // Fallback to client-side filtering if API search fails
        this.filteredCountries = this.countries.filter(country => 
          country.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          country.shortCode.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }
    });
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filteredCountries = [...this.countries];
  }

  deleteCountry(id: number, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    const country = this.countries.find(c => c.id === id);
    if (!country) return;
    
    if (country.teamCount > 0) {
      alert(`Cannot delete ${country.name} because it has ${country.teamCount} teams associated with it.`);
      return;
    }
    
    if (confirm(`Are you sure you want to delete ${country.name}?`)) {
      this.countryService.deleteCountry(id).subscribe({
        next: () => {
          this.countries = this.countries.filter(c => c.id !== id);
          this.filteredCountries = this.filteredCountries.filter(c => c.id !== id);
        },
        error: (error) => {
          this.errorMessage = error.error || 'Failed to delete country';
        }
      });
    }
  }
}
