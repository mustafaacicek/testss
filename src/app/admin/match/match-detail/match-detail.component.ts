import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatchService } from '../match.service';
import { MatchResponse, MatchStatus, MatchStatusUpdateRequest, MatchScoreUpdateRequest } from '../match.model';
import { AdminLayoutComponent } from '../../../shared/layout/admin-layout.component';

@Component({
  selector: 'app-match-detail',
  templateUrl: './match-detail.component.html',
  styleUrls: ['./match-detail.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AdminLayoutComponent]
})
export class MatchDetailComponent implements OnInit {
  matchId: number | null = null;
  match: MatchResponse | null = null;
  isLoading = false;
  isUpdating = false;
  successMessage = '';
  errorMessage = '';
  matchStatuses = Object.values(MatchStatus);
  editingScore = false;
  homeScore: number = 0;
  awayScore: number = 0;
  // Expose MatchStatus enum to the template
  MatchStatus = MatchStatus;
  
  constructor(
    private matchService: MatchService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.matchId = +params['id'];
        this.loadMatch();
      }
    });
  }

  loadMatch(): void {
    if (!this.matchId) return;
    
    this.isLoading = true;
    this.matchService.getMatchById(this.matchId).subscribe({
      next: (match) => {
        this.match = match;
        this.homeScore = match.homeScore;
        this.awayScore = match.awayScore;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load match';
        this.isLoading = false;
      }
    });
  }

  updateMatchStatus(status: MatchStatus): void {
    if (!this.matchId) return;
    
    const statusUpdate: MatchStatusUpdateRequest = { status };
    this.isUpdating = true;
    
    this.matchService.updateMatchStatus(this.matchId, statusUpdate).subscribe({
      next: (updatedMatch) => {
        this.match = updatedMatch;
        this.successMessage = `Match status updated to ${status}`;
        this.isUpdating = false;
        
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to update match status';
        this.isUpdating = false;
        
        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
      }
    });
  }

  startEditingScore(): void {
    if (!this.match) return;
    
    this.homeScore = this.match.homeScore;
    this.awayScore = this.match.awayScore;
    this.editingScore = true;
  }

  cancelEditingScore(): void {
    this.editingScore = false;
  }

  saveScore(): void {
    if (!this.matchId) return;
    
    const scoreUpdate: MatchScoreUpdateRequest = {
      homeScore: this.homeScore,
      awayScore: this.awayScore
    };
    
    this.isUpdating = true;
    this.matchService.updateMatchScore(this.matchId, scoreUpdate).subscribe({
      next: (updatedMatch) => {
        this.match = updatedMatch;
        this.editingScore = false;
        this.successMessage = 'Match score updated successfully';
        this.isUpdating = false;
        
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to update match score';
        this.isUpdating = false;
        
        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
      }
    });
  }

  deleteMatch(): void {
    if (!this.matchId) return;
    
    if (confirm('Are you sure you want to delete this match?')) {
      this.isUpdating = true;
      this.matchService.deleteMatch(this.matchId).subscribe({
        next: () => {
          this.successMessage = 'Match deleted successfully';
          this.isUpdating = false;
          
          // Navigate back to matches list after a short delay
          setTimeout(() => {
            this.router.navigate(['/admin/matches']);
          }, 1500);
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to delete match';
          this.isUpdating = false;
          
          setTimeout(() => {
            this.errorMessage = '';
          }, 3000);
        }
      });
    }
  }

  getOpponentName(): string {
    if (!this.match) return 'Unknown Opponent';
    return this.match.opponentTeamName || this.match.manualOpponentName || 'Unknown Opponent';
  }

  getOpponentLogo(): string {
    if (!this.match) return 'assets/images/default-team-logo.png';
    return this.match.opponentTeamLogo || this.match.manualOpponentLogo || 'assets/images/default-team-logo.png';
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusClass(status: MatchStatus | undefined): string {
    if (!status) return '';
    
    switch (status) {
      case MatchStatus.PLANNED:
        return 'status-planned';
      case MatchStatus.PLAYING:
        return 'status-playing';
      case MatchStatus.FINISHED:
        return 'status-finished';
      case MatchStatus.CANCELLED:
        return 'status-cancelled';
      case MatchStatus.POSTPONED:
        return 'status-postponed';
      default:
        return '';
    }
  }
}
