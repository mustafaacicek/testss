import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TeamService } from '../team.service';
import { TeamResponse } from '../team.model';
import { AdminLayoutComponent } from '../../../shared/layout/admin-layout.component';

@Component({
  selector: 'app-team-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AdminLayoutComponent],
  templateUrl: './team-list.component.html',
  styleUrls: ['./team-list.component.scss']
})
export class TeamListComponent implements OnInit {
  teams: TeamResponse[] = [];
  filteredTeams: TeamResponse[] = [];
  searchQuery = '';
  isLoading = false;
  errorMessage = '';
  isSearching = false;
  statusFilter: 'all' | 'active' | 'inactive' = 'all';

  constructor(private teamService: TeamService) {}

  ngOnInit(): void {
    this.loadTeams();
  }

  loadTeams(): void {
    this.isLoading = true;
    this.teamService.getTeams().subscribe({
      next: (teams) => {
        this.teams = teams;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load teams';
        this.isLoading = false;
      }
    });
  }

  searchTeams(): void {
    if (!this.searchQuery.trim()) {
      this.applyFilters();
      return;
    }

    this.isSearching = true;
    this.teamService.searchTeams(this.searchQuery).subscribe({
      next: (teams) => {
        this.filteredTeams = this.applyStatusFilter(teams);
        this.isSearching = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to search teams';
        this.isSearching = false;
        // Fallback to client-side filtering if API search fails
        this.filteredTeams = this.applyStatusFilter(
          this.teams.filter(team => 
            team.name.toLowerCase().includes(this.searchQuery.toLowerCase())
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
      this.filteredTeams = [...this.teams];
    } else {
      const isActive = this.statusFilter === 'active';
      this.filteredTeams = this.teams.filter(team => team.isActive === isActive);
    }

    if (this.searchQuery.trim()) {
      this.filteredTeams = this.filteredTeams.filter(team =>
        team.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  }

  applyStatusFilter(teams: TeamResponse[]): TeamResponse[] {
    if (this.statusFilter === 'all') {
      return teams;
    } else {
      const isActive = this.statusFilter === 'active';
      return teams.filter(team => team.isActive === isActive);
    }
  }

  deleteTeam(id: number, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    const team = this.teams.find(t => t.id === id);
    if (!team) return;
    
    if (confirm(`Are you sure you want to delete ${team.name}?`)) {
      this.teamService.deleteTeam(id).subscribe({
        next: () => {
          this.teams = this.teams.filter(t => t.id !== id);
          this.filteredTeams = this.filteredTeams.filter(t => t.id !== id);
        },
        error: (error) => {
          this.errorMessage = error.error || 'Failed to delete team';
        }
      });
    }
  }

  getSubscriptionStatus(team: TeamResponse): 'active' | 'expired' | 'none' {
    if (!team.subscriptionExpiry) return 'none';
    
    const expiryDate = new Date(team.subscriptionExpiry);
    const now = new Date();
    
    return expiryDate > now ? 'active' : 'expired';
  }
}
