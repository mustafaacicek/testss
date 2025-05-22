import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SoundService } from '../sound.service';
import { SoundResponse, SoundStatus } from '../sound.model';
import { AdminLayoutComponent } from '../../../shared/layout/admin-layout.component';

@Component({
  selector: 'app-sound-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AdminLayoutComponent],
  templateUrl: './sound-list.component.html',
  styleUrls: ['./sound-list.component.scss']
})
export class SoundListComponent implements OnInit {
  sounds: SoundResponse[] = [];
  filteredSounds: SoundResponse[] = [];
  searchQuery = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  SoundStatus = SoundStatus; // Make enum available to template

  constructor(private soundService: SoundService) {}

  ngOnInit(): void {
    this.loadSounds();
  }

  loadSounds(): void {
    this.isLoading = true;
    this.soundService.getSounds().subscribe({
      next: (sounds) => {
        this.sounds = sounds;
        this.filteredSounds = [...sounds];
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load sounds';
        this.isLoading = false;
      }
    });
  }

  searchSounds(): void {
    if (!this.searchQuery.trim()) {
      this.filteredSounds = [...this.sounds];
      return;
    }

    this.isLoading = true;
    this.soundService.searchSounds(this.searchQuery).subscribe({
      next: (sounds) => {
        this.filteredSounds = sounds;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to search sounds';
        this.isLoading = false;
        // Fallback to client-side filtering if API search fails
        this.filteredSounds = this.sounds.filter(sound => 
          sound.title.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }
    });
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filteredSounds = [...this.sounds];
  }

  deleteSound(id: number): void {
    if (confirm('Are you sure you want to delete this sound?')) {
      this.soundService.deleteSound(id).subscribe({
        next: (response) => {
          // The response is now a text string, not a JSON object
          console.log('Delete response:', response);
          this.successMessage = 'Sound deleted successfully';
          this.sounds = this.sounds.filter(sound => sound.id !== id);
          this.filteredSounds = this.filteredSounds.filter(sound => sound.id !== id);
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          console.error('Delete error:', error);
          this.errorMessage = error.message || 'Failed to delete sound';
          setTimeout(() => {
            this.errorMessage = '';
          }, 3000);
        }
      });
    }
  }

  updateSoundStatus(id: number, status: SoundStatus): void {
    this.soundService.updateSoundStatus(id, status).subscribe({
      next: (updatedSound) => {
        const index = this.sounds.findIndex(sound => sound.id === id);
        if (index !== -1) {
          this.sounds[index] = updatedSound;
        }
        
        const filteredIndex = this.filteredSounds.findIndex(sound => sound.id === id);
        if (filteredIndex !== -1) {
          this.filteredSounds[filteredIndex] = updatedSound;
        }
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to update sound status';
        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
      }
    });
  }

  formatTime(milliseconds: number): string {
    if (!milliseconds) return '0:00';
    
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}
