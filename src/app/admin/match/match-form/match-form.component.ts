import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatchService } from '../match.service';
import { Match, MatchResponse, MatchRequest, MatchStatus, OpponentTeam } from '../match.model';
import { AdminLayoutComponent } from '../../../shared/layout/admin-layout.component';

@Component({
  selector: 'app-match-form',
  templateUrl: './match-form.component.html',
  styleUrls: ['./match-form.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, AdminLayoutComponent]
})
export class MatchFormComponent implements OnInit {
  matchForm: FormGroup;
  matchId: number | null = null;
  isEditMode = false;
  isLoading = false;
  isSaving = false;
  successMessage = '';
  errorMessage = '';
  availableOpponents: OpponentTeam[] = [];
  matchStatuses = Object.values(MatchStatus);
  opponentType: 'team' | 'manual' = 'team';
  
  constructor(
    private formBuilder: FormBuilder,
    private matchService: MatchService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.matchForm = this.createMatchForm();
  }

  ngOnInit(): void {
    this.loadAvailableOpponents();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.matchId = +params['id'];
        this.isEditMode = true;
        this.loadMatch(this.matchId);
      }
    });
  }

  createMatchForm(): FormGroup {
    return this.formBuilder.group({
      opponentTeamId: [null],
      manualOpponentName: [''],
      manualOpponentLogo: [''],
      status: [MatchStatus.PLANNED, Validators.required],
      homeScore: [0, [Validators.required, Validators.min(0)]],
      awayScore: [0, [Validators.required, Validators.min(0)]],
      matchDate: ['', Validators.required]
    });
  }

  loadAvailableOpponents(): void {
    this.isLoading = true;
    this.matchService.getAvailableOpponents().subscribe({
      next: (opponents) => {
        this.availableOpponents = opponents;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load available opponents';
        this.isLoading = false;
      }
    });
  }

  loadMatch(id: number): void {
    this.isLoading = true;
    this.matchService.getMatchById(id).subscribe({
      next: (match) => {
        // Determine opponent type
        if (match.opponentTeamId) {
          this.opponentType = 'team';
        } else if (match.manualOpponentName) {
          this.opponentType = 'manual';
        }
        
        // Format the date for the form by directly parsing the ISO string
        // This preserves the exact time as it comes from the server without any timezone conversion
        const parts = match.matchDate.split('T');
        const datePart = parts[0]; // YYYY-MM-DD
        const timePart = parts[1].substring(0, 5); // HH:MM
        const formattedDate = `${datePart}T${timePart}`; // Format: "YYYY-MM-DDThh:mm"
        
        this.matchForm.patchValue({
          opponentTeamId: match.opponentTeamId,
          manualOpponentName: match.manualOpponentName,
          manualOpponentLogo: match.manualOpponentLogo,
          status: match.status,
          homeScore: match.homeScore,
          awayScore: match.awayScore,
          matchDate: formattedDate
        });
        
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load match';
        this.isLoading = false;
      }
    });
  }

  onOpponentTypeChange(type: 'team' | 'manual'): void {
    this.opponentType = type;
    
    if (type === 'team') {
      this.matchForm.get('manualOpponentName')?.setValue('');
      this.matchForm.get('manualOpponentLogo')?.setValue('');
    } else {
      this.matchForm.get('opponentTeamId')?.setValue(null);
    }
  }

  saveMatch(): void {
    if (this.matchForm.invalid) return;
    
    this.isSaving = true;
    
    // Prepare match data based on opponent type
    const matchData: MatchRequest = {
      opponentTeamId: this.opponentType === 'team' ? this.matchForm.get('opponentTeamId')?.value : null,
      manualOpponentName: this.opponentType === 'manual' ? this.matchForm.get('manualOpponentName')?.value : null,
      manualOpponentLogo: this.opponentType === 'manual' ? this.matchForm.get('manualOpponentLogo')?.value : null,
      status: this.matchForm.get('status')?.value,
      homeScore: this.matchForm.get('homeScore')?.value,
      awayScore: this.matchForm.get('awayScore')?.value,
      matchDate: this.matchForm.get('matchDate')?.value
    };
    
    if (this.isEditMode && this.matchId) {
      this.updateMatch(this.matchId, matchData);
    } else {
      this.createMatch(matchData);
    }
  }

  createMatch(matchData: MatchRequest): void {
    this.matchService.createMatch(matchData).subscribe({
      next: (match) => {
        this.successMessage = 'Match created successfully';
        this.isSaving = false;
        
        // Navigate to match detail page after a short delay
        setTimeout(() => {
          this.router.navigate(['/admin/matches', match.id]);
        }, 1500);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to create match';
        this.isSaving = false;
      }
    });
  }

  updateMatch(id: number, matchData: MatchRequest): void {
    this.matchService.updateMatch(id, matchData).subscribe({
      next: (match) => {
        this.successMessage = 'Match updated successfully';
        this.isSaving = false;
        
        // Navigate to match detail page after a short delay
        setTimeout(() => {
          this.router.navigate(['/admin/matches', match.id]);
        }, 1500);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to update match';
        this.isSaving = false;
      }
    });
  }

  cancel(): void {
    if (this.isEditMode && this.matchId) {
      this.router.navigate(['/admin/matches', this.matchId]);
    } else {
      this.router.navigate(['/admin/matches']);
    }
  }

  // Helper method to get form control validation status
  isInvalid(controlName: string): boolean {
    const control = this.matchForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
}
