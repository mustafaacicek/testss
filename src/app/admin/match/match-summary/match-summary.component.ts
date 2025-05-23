import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatchService } from '../match.service';
import { MatchResponse, MatchStatus } from '../match.model';

@Component({
  selector: 'app-match-summary',
  templateUrl: './match-summary.component.html',
  styleUrls: ['./match-summary.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class MatchSummaryComponent implements OnInit {
  upcomingMatches: MatchResponse[] = [];
  pastMatches: MatchResponse[] = [];
  isLoadingUpcoming = false;
  isLoadingPast = false;
  errorMessage = '';
  
  // Expose MatchStatus enum to the template
  MatchStatus = MatchStatus;
  
  constructor(private matchService: MatchService) { }

  ngOnInit(): void {
    this.loadUpcomingMatches();
    this.loadPastMatches();
  }

  loadUpcomingMatches(): void {
    this.isLoadingUpcoming = true;
    this.matchService.getUpcomingMatches().subscribe({
      next: (matches) => {
        this.upcomingMatches = matches.slice(0, 3); // Show only the next 3 upcoming matches
        this.isLoadingUpcoming = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load upcoming matches';
        this.isLoadingUpcoming = false;
      }
    });
  }

  loadPastMatches(): void {
    this.isLoadingPast = true;
    this.matchService.getPastMatches().subscribe({
      next: (matches) => {
        this.pastMatches = matches.slice(0, 3); // Show only the last 3 past matches
        this.isLoadingPast = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load past matches';
        this.isLoadingPast = false;
      }
    });
  }

  getOpponentName(match: MatchResponse): string {
    return match.opponentTeamName || match.manualOpponentName || 'Unknown Opponent';
  }

  getOpponentLogo(match: MatchResponse): string {
    return match.opponentTeamLogo || match.manualOpponentLogo || 'assets/images/default-team-logo.png';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusClass(status: MatchStatus): string {
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
