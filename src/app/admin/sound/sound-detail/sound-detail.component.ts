import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SoundService } from '../sound.service';
import { SoundResponse, SoundStatus } from '../sound.model';
import { AdminLayoutComponent } from '../../../shared/layout/admin-layout.component';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-sound-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminLayoutComponent],
  templateUrl: './sound-detail.component.html',
  styleUrls: ['./sound-detail.component.scss']
})
export class SoundDetailComponent implements OnInit, OnDestroy {
  sound: SoundResponse | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  soundId: number | null = null;
  audio1: HTMLAudioElement | null = null;
  audio2: HTMLAudioElement | null = null;
  isPlaying = false;
  isPaused = false;
  currentTime = 0;
  duration = 0;
  volume = 1;
  SoundStatus = SoundStatus; // Make enum available to template
  
  private updateInterval: Subscription | null = null;
  
  constructor(
    private soundService: SoundService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.soundId = +params['id'];
        this.loadSound(this.soundId);
      }
    });
  }

  ngOnDestroy(): void {
    this.stopAudio();
    if (this.updateInterval) {
      this.updateInterval.unsubscribe();
    }
  }

  loadSound(id: number): void {
    this.isLoading = true;
    this.soundService.getSoundById(id).subscribe({
      next: (sound) => {
        this.sound = sound;
        this.isLoading = false;
        this.setupAudio();
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load sound';
        this.isLoading = false;
      }
    });
  }

  setupAudio(): void {
    if (!this.sound) return;
    
    if (this.sound.soundUrl1) {
      this.audio1 = new Audio(this.sound.soundUrl1);
      this.audio1.addEventListener('timeupdate', () => this.onTimeUpdate());
      this.audio1.addEventListener('loadedmetadata', () => {
        if (this.audio1) {
          this.duration = this.audio1.duration * 1000; // Convert to milliseconds
        }
      });
      
      // Set the current position if available
      if (this.sound.currentMillisecond) {
        this.audio1.currentTime = this.sound.currentMillisecond / 1000; // Convert to seconds
      }
    }
    
    if (this.sound.soundUrl2) {
      this.audio2 = new Audio(this.sound.soundUrl2);
    }
    
    // If the sound status is STARTED, start playing
    if (this.sound.status === SoundStatus.STARTED) {
      this.playAudio();
    }
  }

  playAudio(): void {
    if (!this.audio1) return;
    
    this.audio1.play().then(() => {
      this.isPlaying = true;
      this.isPaused = false;
      
      // Start interval to update the position in the database
      this.startUpdateInterval();
      
      // Update the sound status in the database
      if (this.soundId) {
        this.soundService.updateSoundStatus(this.soundId, SoundStatus.STARTED).subscribe({
          next: (updatedSound) => {
            this.sound = updatedSound;
          },
          error: (error) => {
            this.errorMessage = error.message || 'Failed to update sound status';
          }
        });
      }
    }).catch(error => {
      this.errorMessage = 'Failed to play audio: ' + error.message;
    });
    
    // Play the second audio if available
    if (this.audio2) {
      this.audio2.play().catch(() => {
        // Ignore errors for the second audio
      });
    }
  }

  pauseAudio(): void {
    if (!this.audio1) return;
    
    this.audio1.pause();
    this.isPlaying = false;
    this.isPaused = true;
    
    // Stop the update interval
    if (this.updateInterval) {
      this.updateInterval.unsubscribe();
      this.updateInterval = null;
    }
    
    // Pause the second audio if available
    if (this.audio2) {
      this.audio2.pause();
    }
    
    // Update the sound status in the database
    if (this.soundId) {
      this.soundService.updateSoundStatus(this.soundId, SoundStatus.PAUSED).subscribe({
        next: (updatedSound) => {
          this.sound = updatedSound;
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to update sound status';
        }
      });
    }
  }

  stopAudio(): void {
    if (!this.audio1) return;
    
    this.audio1.pause();
    this.audio1.currentTime = 0;
    this.isPlaying = false;
    this.isPaused = false;
    this.currentTime = 0;
    
    // Stop the update interval
    if (this.updateInterval) {
      this.updateInterval.unsubscribe();
      this.updateInterval = null;
    }
    
    // Stop the second audio if available
    if (this.audio2) {
      this.audio2.pause();
      this.audio2.currentTime = 0;
    }
    
    // Update the sound status in the database
    if (this.soundId) {
      this.soundService.updateSoundStatus(this.soundId, SoundStatus.STOPPED).subscribe({
        next: (updatedSound) => {
          this.sound = updatedSound;
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to update sound status';
        }
      });
    }
  }

  onTimeUpdate(): void {
    if (!this.audio1) return;
    
    this.currentTime = this.audio1.currentTime * 1000; // Convert to milliseconds
    
    // Check if the audio has ended
    if (this.audio1.ended) {
      this.isPlaying = false;
      this.isPaused = false;
      
      // Stop the update interval
      if (this.updateInterval) {
        this.updateInterval.unsubscribe();
        this.updateInterval = null;
      }
      
      // Update the sound status in the database
      if (this.soundId) {
        this.soundService.updateSoundStatus(this.soundId, SoundStatus.ENDED).subscribe({
          next: (updatedSound) => {
            this.sound = updatedSound;
          },
          error: (error) => {
            this.errorMessage = error.message || 'Failed to update sound status';
          }
        });
      }
    }
  }

  onSeek(event: Event): void {
    if (!this.audio1 || !this.duration) return;
    
    const input = event.target as HTMLInputElement;
    const seekTime = parseInt(input.value, 10);
    
    this.audio1.currentTime = seekTime / 1000; // Convert to seconds
    this.currentTime = seekTime;
    
    // Update the second audio if available
    if (this.audio2) {
      this.audio2.currentTime = seekTime / 1000;
    }
    
    // Update the sound position in the database
    if (this.soundId) {
      this.soundService.updateSoundPosition(this.soundId, seekTime).subscribe({
        next: (updatedSound) => {
          this.sound = updatedSound;
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to update sound position';
        }
      });
    }
  }

  onVolumeChange(event: Event): void {
    if (!this.audio1) return;
    
    const input = event.target as HTMLInputElement;
    const volumeValue = parseFloat(input.value);
    
    this.volume = volumeValue;
    this.audio1.volume = volumeValue;
    
    // Update the second audio if available
    if (this.audio2) {
      this.audio2.volume = volumeValue;
    }
  }

  startUpdateInterval(): void {
    // Update the position in the database every 5 seconds
    this.updateInterval = interval(5000).subscribe(() => {
      if (this.soundId && this.isPlaying && this.currentTime > 0) {
        this.soundService.updateSoundPosition(this.soundId, this.currentTime).subscribe({
          next: (updatedSound) => {
            // We don't need to update the local sound object here
          },
          error: (error) => {
            // Silently fail, we'll try again in 5 seconds
          }
        });
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

  deleteSound(): void {
    if (!this.sound || !this.soundId) return;
    
    if (confirm(`Are you sure you want to delete sound "${this.sound.title}"?`)) {
      this.soundService.deleteSound(this.soundId).subscribe({
        next: (response) => {
          // The response is now a text string, not a JSON object
          console.log('Delete response:', response);
          this.successMessage = 'Sound deleted successfully';
          setTimeout(() => {
            this.router.navigate(['/admin/sounds']);
          }, 1500);
        },
        error: (error) => {
          console.error('Delete error:', error);
          this.errorMessage = error.message || 'Failed to delete sound';
        }
      });
    }
  }
}
