import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TeamService } from '../team.service';
import { CountryService } from '../../country/country.service';
import { SubscriptionTypeService } from '../../subscription-type/subscription-type.service';
import { TeamResponse, TeamRequest } from '../team.model';
import { CountryResponse } from '../../country/country.model';
import { SubscriptionTypeResponse } from '../../subscription-type/subscription-type.model';
import { AdminLayoutComponent } from '../../../shared/layout/admin-layout.component';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-team-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AdminLayoutComponent],
  templateUrl: './team-form.component.html',
  styleUrls: ['./team-form.component.scss']
})
export class TeamFormComponent implements OnInit {
  teamForm!: FormGroup;
  isEditMode = false;
  teamId?: number;
  isSubmitting = false;
  errorMessage = '';
  isLoading = false;
  countries: CountryResponse[] = [];
  subscriptionTypes: SubscriptionTypeResponse[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private teamService: TeamService,
    private countryService: CountryService,
    private subscriptionTypeService: SubscriptionTypeService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.isLoading = true;
    
    // Load countries and subscription types in parallel
    forkJoin([
      this.countryService.getCountries().pipe(catchError(error => {
        this.errorMessage = error.message || 'Failed to load countries';
        return of([]);
      })),
      this.subscriptionTypeService.getSubscriptionTypes().pipe(catchError(error => {
        this.errorMessage = error.message || 'Failed to load subscription types';
        return of([]);
      }))
    ]).subscribe(([countries, subscriptionTypes]) => {
      this.countries = countries;
      this.subscriptionTypes = subscriptionTypes.filter(type => type.isActive);
      this.isLoading = false;
    });
    
    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.teamId = +params['id'];
        this.loadTeam(this.teamId);
      }
    });
  }

  initForm(): void {
    this.teamForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      logoUrl: [''],
      stadiumName: ['', [Validators.required]],
      stadiumLocation: ['', [Validators.required]],
      countryId: ['', [Validators.required]],
      subscriptionTypeId: [''],
      isActive: [true]
    });
  }



  loadTeam(id: number): void {
    this.isLoading = true;
    this.teamService.getTeamById(id).subscribe({
      next: (team) => {
        this.teamForm.patchValue({
          name: team.name,
          logoUrl: team.logoUrl || '',
          stadiumName: team.stadiumName,
          stadiumLocation: team.stadiumLocation,
          countryId: team.countryId,
          subscriptionTypeId: team.subscriptionTypeId || '',
          isActive: team.isActive
        });
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load team';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.teamForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const teamData: TeamRequest = {
      name: this.teamForm.value.name,
      logoUrl: this.teamForm.value.logoUrl || undefined,
      stadiumName: this.teamForm.value.stadiumName,
      stadiumLocation: this.teamForm.value.stadiumLocation,
      countryId: +this.teamForm.value.countryId,
      subscriptionTypeId: this.teamForm.value.subscriptionTypeId ? +this.teamForm.value.subscriptionTypeId : undefined,
      isActive: this.teamForm.value.isActive
    };

    if (this.isEditMode && this.teamId) {
      this.updateTeam(this.teamId, teamData);
    } else {
      this.createTeam(teamData);
    }
  }

  createTeam(team: TeamRequest): void {
    this.teamService.createTeam(team).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/superadmin/teams']);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error.error || 'Failed to create team';
      }
    });
  }

  updateTeam(id: number, team: TeamRequest): void {
    this.teamService.updateTeam(id, team).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/superadmin/teams']);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error.error || 'Failed to update team';
      }
    });
  }

  get formTitle(): string {
    return this.isEditMode ? 'Edit Team' : 'Create Team';
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'Update Team' : 'Create Team';
  }
}
