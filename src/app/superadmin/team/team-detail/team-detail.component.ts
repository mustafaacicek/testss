import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TeamService } from '../team.service';
import { TeamResponse } from '../team.model';
import { AdminLayoutComponent } from '../../../shared/layout/admin-layout.component';

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminLayoutComponent],
  templateUrl: './team-detail.component.html',
  styleUrls: ['./team-detail.component.scss']
})
export class TeamDetailComponent implements OnInit {
  team?: TeamResponse;
  isLoading = true;
  errorMessage = '';

  constructor(
    private teamService: TeamService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadTeam(+params['id']);
      } else {
        this.router.navigate(['/superadmin/teams']);
      }
    });
  }

  loadTeam(id: number): void {
    this.isLoading = true;
    this.teamService.getTeamById(id).subscribe({
      next: (team) => {
        this.team = team;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load team';
        this.isLoading = false;
      }
    });
  }

  deleteTeam(): void {
    if (!this.team) return;
    
    if (confirm(`Are you sure you want to delete ${this.team.name}?`)) {
      this.teamService.deleteTeam(this.team.id).subscribe({
        next: () => {
          this.router.navigate(['/superadmin/teams']);
        },
        error: (error) => {
          this.errorMessage = error.error || 'Failed to delete team';
        }
      });
    }
  }

  getSubscriptionStatus(): 'active' | 'expired' | 'none' {
    if (!this.team?.subscriptionExpiry) return 'none';
    
    const expiryDate = new Date(this.team.subscriptionExpiry);
    const now = new Date();
    
    return expiryDate > now ? 'active' : 'expired';
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
