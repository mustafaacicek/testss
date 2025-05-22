import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CountryService } from '../country.service';
import { Country, CountryRequest } from '../country.model';
import { AdminLayoutComponent } from '../../../shared/layout/admin-layout.component';

@Component({
  selector: 'app-country-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AdminLayoutComponent],
  templateUrl: './country-form.component.html',
  styleUrls: ['./country-form.component.scss']
})
export class CountryFormComponent implements OnInit {
  countryForm!: FormGroup;
  isEditMode = false;
  countryId?: number;
  isSubmitting = false;
  errorMessage = '';
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private countryService: CountryService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    
    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.countryId = +params['id'];
        this.loadCountry(this.countryId);
      }
    });
  }

  initForm(): void {
    this.countryForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      shortCode: ['', [Validators.required, Validators.maxLength(3)]],
      logoUrl: [''],
      description: ['']
    });
  }

  loadCountry(id: number): void {
    this.isLoading = true;
    this.countryService.getCountryById(id).subscribe({
      next: (country) => {
        this.countryForm.patchValue({
          name: country.name,
          shortCode: country.shortCode,
          logoUrl: country.logoUrl || '',
          description: country.description || ''
        });
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load country';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.countryForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const countryData: CountryRequest = {
      name: this.countryForm.value.name,
      shortCode: this.countryForm.value.shortCode,
      logoUrl: this.countryForm.value.logoUrl || undefined,
      description: this.countryForm.value.description || undefined
    };

    if (this.isEditMode && this.countryId) {
      this.updateCountry(this.countryId, countryData);
    } else {
      this.createCountry(countryData);
    }
  }

  createCountry(country: CountryRequest): void {
    this.countryService.createCountry(country).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/superadmin/countries']);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error.error || 'Failed to create country';
      }
    });
  }

  updateCountry(id: number, country: CountryRequest): void {
    this.countryService.updateCountry(id, country).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/superadmin/countries']);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error.error || 'Failed to update country';
      }
    });
  }

  get formTitle(): string {
    return this.isEditMode ? 'Edit Country' : 'Create Country';
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'Update Country' : 'Create Country';
  }
}
