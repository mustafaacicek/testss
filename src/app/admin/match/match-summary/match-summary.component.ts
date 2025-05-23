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
    // Create a date object directly from the ISO string without timezone conversion
    // Extract date parts directly from the string to avoid browser's automatic timezone conversion
    const parts = dateString.split('T');
    const datePart = parts[0]; // YYYY-MM-DD
    const timePart = parts[1].substring(0, 5); // HH:MM
    
    const [year, month, day] = datePart.split('-').map(Number);
    
    // Format the date manually to match the server's time exactly in 24-hour format
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return `${monthNames[month-1]} ${day}, ${year}, ${timePart}`;
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
