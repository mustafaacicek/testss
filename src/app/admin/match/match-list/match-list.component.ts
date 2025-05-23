import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatchService } from '../match.service';
import { MatchResponse, MatchStatus, MatchStatusUpdateRequest } from '../match.model';
import { AdminLayoutComponent } from '../../../shared/layout/admin-layout.component';

@Component({
  selector: 'app-match-list',
  templateUrl: './match-list.component.html',
  styleUrls: ['./match-list.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AdminLayoutComponent]
})
export class MatchListComponent implements OnInit {
  matches: MatchResponse[] = [];
  filteredMatches: MatchResponse[] = [];
  searchQuery: string = '';
  statusFilter: string | MatchStatus = 'ALL';
  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  matchStatuses = Object.values(MatchStatus);
  // Expose MatchStatus enum to the template
  MatchStatus = MatchStatus;
  
  constructor(private matchService: MatchService) { }

  ngOnInit(): void {
    this.loadMatches();
  }

  loadMatches(): void {
    this.isLoading = true;
    this.matchService.getAllMatches().subscribe({
      next: (matches) => {
        this.matches = matches;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load matches';
        this.isLoading = false;
        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
      }
    });
  }

  searchMatches(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.matches];
    
    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      result = result.filter(match => 
        (match.opponentTeamName && match.opponentTeamName.toLowerCase().includes(query)) || 
        (match.manualOpponentName && match.manualOpponentName.toLowerCase().includes(query))
      );
    }
    
    // Apply status filter
    if (this.statusFilter !== 'ALL') {
      result = result.filter(match => match.status === this.statusFilter as MatchStatus);
    }
    
    this.filteredMatches = result;
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.statusFilter = 'ALL';
    this.applyFilters();
  }

  updateMatchStatus(id: number, status: MatchStatus): void {
    const statusUpdate: MatchStatusUpdateRequest = { status };
    
    this.matchService.updateMatchStatus(id, statusUpdate).subscribe({
      next: (updatedMatch) => {
        // Update the match in the arrays
        const index = this.matches.findIndex(m => m.id === id);
        if (index !== -1) {
          this.matches[index] = updatedMatch;
        }
        
        const filteredIndex = this.filteredMatches.findIndex(m => m.id === id);
        if (filteredIndex !== -1) {
          this.filteredMatches[filteredIndex] = updatedMatch;
        }
        
        this.successMessage = `Match status updated to ${status}`;
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to update match status';
        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
      }
    });
  }

  deleteMatch(id: number): void {
    if (confirm('Are you sure you want to delete this match?')) {
      this.matchService.deleteMatch(id).subscribe({
        next: () => {
          this.matches = this.matches.filter(match => match.id !== id);
          this.filteredMatches = this.filteredMatches.filter(match => match.id !== id);
          this.successMessage = 'Match deleted successfully';
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to delete match';
          setTimeout(() => {
            this.errorMessage = '';
          }, 3000);
        }
      });
    }
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
