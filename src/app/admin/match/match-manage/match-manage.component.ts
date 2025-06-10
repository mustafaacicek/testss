import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatchManageService } from '../match-manage.service';
import { MatchService } from '../match.service';
import { 
  MatchDetailResponse, 
  MatchSoundResponse, 
  SoundStatus,
  ActiveSound
} from '../match-manage.model';
import { AdminLayoutComponent } from '../../../shared/layout/admin-layout.component';

@Component({
  selector: 'app-match-manage',
  templateUrl: './match-manage.component.html',
  styleUrls: ['./match-manage.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AdminLayoutComponent],
  animations: [
    trigger('toastAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(-20px)' }))
      ])
    ])
  ]
})
export class MatchManageComponent implements OnInit, OnDestroy {
  matchId: number | null = null;
  matchDetail: MatchDetailResponse | null = null;
  availableSounds: MatchSoundResponse[] = [];
  selectedSound: MatchSoundResponse | null = null;
  currentPosition: number = 0;
  isPlaying: boolean = false;
  isPaused: boolean = false;
  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  
  // Audio player
  audioPlayer: HTMLAudioElement | null = null;
  
  // Track if we need to update from server
  private needsUpdate: boolean = false;
  
  // Flashlight control
  flashlightEnabled: boolean | null = null;
  flashlightLoading: boolean = false;
  
  // Enums for template
  SoundStatus = SoundStatus;
  
  constructor(
    private matchService: MatchService,
    private matchManageService: MatchManageService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.matchId = +params['id'];
        this.loadMatchDetails();
        this.loadTeamSounds();
        
        // Initial load is enough
      }
    });
    
    // Initialize audio player
    this.audioPlayer = new Audio();
    this.audioPlayer.addEventListener('timeupdate', this.updateCurrentPosition.bind(this));
    this.audioPlayer.addEventListener('ended', this.onAudioEnded.bind(this));
  }

  ngOnDestroy(): void {
    // Clean up audio player
    if (this.audioPlayer) {
      this.audioPlayer.pause();
      this.audioPlayer.src = '';
    }
    
    // No polling to stop
  }

  loadMatchDetails(): void {
    if (!this.matchId) return;
    
    this.isLoading = true;
    this.matchManageService.getMatchDetails(this.matchId).subscribe({
      next: (detail) => {
        this.matchDetail = detail;
        this.isLoading = false;
        this.updatePlayerFromMatchDetail();
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load match details';
        this.isLoading = false;
      }
    });
  }

  loadTeamSounds(): void {
    if (!this.matchId) return;
    
    this.isLoading = true;
    this.matchManageService.getTeamSounds(this.matchId).subscribe({
      next: (sounds) => {
        this.availableSounds = sounds;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load team sounds';
        this.isLoading = false;
      }
    });
  }

  updatePlayerFromMatchDetail(): void {
    if (!this.matchDetail) return;
    
    // Update position regardless of active sound
    this.currentPosition = this.matchDetail.currentMillisecond || 0;
    
    // If there's no active sound, just update the state
    if (!this.matchDetail.activeSound) {
      this.isPlaying = false;
      this.isPaused = false;
      if (this.audioPlayer) {
        this.audioPlayer.pause();
        this.audioPlayer.currentTime = 0;
      }
      return;
    }
    
    const activeSound = this.matchDetail.activeSound;
    
    // Find the sound in available sounds
    const sound = this.availableSounds.find(s => s.id === activeSound.id);
    
    if (sound) {
      this.selectedSound = sound;
    } else {
      // If not found in available sounds, create a temporary sound object
      this.selectedSound = {
        id: activeSound.id,
        title: activeSound.title,
        soundUrl: activeSound.soundUrl,
        soundImageUrl: activeSound.soundImageUrl,
        status: this.matchDetail.soundStatus || 'STOPPED',
        currentMillisecond: this.matchDetail.currentMillisecond
      };
    }
    
    // Always update audio player source to match the active sound
    if (this.audioPlayer && activeSound.soundUrl) {
      // Only reload if the source has changed
      if (this.audioPlayer.src !== activeSound.soundUrl) {
        this.audioPlayer.src = activeSound.soundUrl;
        this.audioPlayer.load();
      }
      
      // Always set the current time to match the server's position
      this.audioPlayer.currentTime = this.currentPosition / 1000;
    }
    
    // Update playback state based on the server status
    if (this.matchDetail.soundStatus === SoundStatus.STARTED) {
      this.isPlaying = true;
      this.isPaused = false;
      if (this.audioPlayer) {
        this.audioPlayer.play().catch(error => {
          console.error('Error playing audio:', error);
        });
      }
    } else if (this.matchDetail.soundStatus === SoundStatus.PAUSED) {
      this.isPlaying = false;
      this.isPaused = true;
      if (this.audioPlayer) {
        this.audioPlayer.pause();
      }
    } else if (this.matchDetail.soundStatus === SoundStatus.STOPPED) {
      this.isPlaying = false;
      this.isPaused = false;
      if (this.audioPlayer) {
        this.audioPlayer.pause();
        this.audioPlayer.currentTime = 0;
      }
    }
  }

  selectSound(sound: MatchSoundResponse): void {
    this.selectedSound = sound;
    this.currentPosition = 0;
    
    // Stop any currently playing audio
    if (this.audioPlayer && this.isPlaying) {
      this.audioPlayer.pause();
      this.isPlaying = false;
      this.isPaused = false;
    }
    
    // Load the new sound
    if (this.audioPlayer && sound.soundUrl) {
      this.audioPlayer.src = sound.soundUrl;
      this.audioPlayer.load();
    }
  }

  startSound(): void {
    if (!this.selectedSound || !this.matchId) {
      this.errorMessage = 'No sound selected';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }
    
    // Immediately update UI state to give instant feedback
    this.isPlaying = true;
    this.isPaused = false;
    
    // Start playing audio immediately if available
    if (this.audioPlayer && this.selectedSound?.soundUrl) {
      if (this.audioPlayer.src !== this.selectedSound.soundUrl) {
        this.audioPlayer.src = this.selectedSound.soundUrl;
        this.audioPlayer.load();
      }
      this.audioPlayer.currentTime = 0;
      this.audioPlayer.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    }
    
    // Show success message immediately
    this.successMessage = `Playing: ${this.selectedSound?.title}`;
    setTimeout(() => this.successMessage = '', 3000);
    
    // Make API call without showing loading indicator
    this.matchManageService.startSound(this.matchId, this.selectedSound.id).subscribe({
      next: (response) => {
        // Update match details without full reload
        this.refreshMatchDetails();
      },
      error: (error) => {
        // Revert UI state if there was an error
        this.isPlaying = false;
        this.errorMessage = error.message || 'Failed to start sound';
        setTimeout(() => this.errorMessage = '', 3000);
        
        // Stop audio player
        if (this.audioPlayer) {
          this.audioPlayer.pause();
          this.audioPlayer.currentTime = 0;
        }
      }
    });
  }

  pauseSound(): void {
    if (!this.selectedSound || !this.matchId || !this.isPlaying) return;
    
    // Immediately update UI state to give instant feedback
    this.isPlaying = false;
    this.isPaused = true;
    
    // Pause audio player immediately
    if (this.audioPlayer) {
      this.audioPlayer.pause();
    }
    
    // Show success message immediately
    this.successMessage = `Paused: ${this.selectedSound?.title}`;
    setTimeout(() => this.successMessage = '', 3000);
    
    // Make API call without showing loading indicator
    this.matchManageService.pauseSound(this.matchId).subscribe({
      next: (response) => {
        // Update match details without full reload
        this.refreshMatchDetails();
      },
      error: (error) => {
        // Revert UI state if there was an error
        this.isPlaying = true;
        this.isPaused = false;
        this.errorMessage = error.message || 'Failed to pause sound';
        setTimeout(() => this.errorMessage = '', 3000);
        
        // Resume audio player
        if (this.audioPlayer) {
          this.audioPlayer.play().catch(error => {
            console.error('Error resuming audio after failed pause:', error);
          });
        }
      }
    });
  }

  resumeSound(): void {
    if (!this.selectedSound || !this.matchId || !this.isPaused) return;
    
    // Immediately update UI state to give instant feedback
    this.isPlaying = true;
    this.isPaused = false;
    
    // Resume audio player immediately
    if (this.audioPlayer) {
      this.audioPlayer.play().catch(error => {
        console.error('Error resuming audio:', error);
      });
    }
    
    // Show success message immediately
    this.successMessage = `Resumed: ${this.selectedSound?.title}`;
    setTimeout(() => this.successMessage = '', 3000);
    
    // Make API call without showing loading indicator
    this.matchManageService.resumeSound(this.matchId).subscribe({
      next: (response) => {
        // Update match details without full reload
        this.refreshMatchDetails();
      },
      error: (error) => {
        // Revert UI state if there was an error
        this.isPlaying = false;
        this.isPaused = true;
        this.errorMessage = error.message || 'Failed to resume sound';
        setTimeout(() => this.errorMessage = '', 3000);
        
        // Pause audio player
        if (this.audioPlayer) {
          this.audioPlayer.pause();
        }
      }
    });
  }

  seekSound(position: number): void {
    if (!this.selectedSound || !this.matchId) return;
    
    // Immediately update UI state to give instant feedback
    this.currentPosition = position;
    
    // Seek locally immediately
    if (this.audioPlayer) {
      this.audioPlayer.currentTime = position / 1000;
    }
    
    // Show success message immediately
    this.successMessage = `Seeked to ${this.formatTime(position)}`;
    setTimeout(() => this.successMessage = '', 3000);
    
    // Make API call without showing loading indicator
    this.matchManageService.seekSound(this.matchId, position).subscribe({
      next: (response) => {
        // Update match details without full reload
        this.refreshMatchDetails();
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to seek sound';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  onSeekChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const position = parseInt(input.value, 10);
    this.seekSound(position);
  }

  updateCurrentPosition(): void {
    if (this.audioPlayer) {
      this.currentPosition = Math.floor(this.audioPlayer.currentTime * 1000);
    }
  }

  onAudioEnded(): void {
    // Reset UI state when audio ends
    this.isPlaying = false;
    this.isPaused = false;
    this.currentPosition = 0;
    
    // If we have a match ID, stop the sound on the server
    if (this.matchId) {
      this.stopSound();
    }
  }

  stopSound(): void {
    if (!this.matchId) return;
    
    // Immediately update UI state to give instant feedback
    this.isPlaying = false;
    this.isPaused = false;
    
    // Stop audio player immediately
    if (this.audioPlayer) {
      this.audioPlayer.pause();
      this.audioPlayer.currentTime = 0;
    }
    
    // Show success message immediately
    if (this.selectedSound) {
      this.successMessage = `Stopped: ${this.selectedSound.title}`;
      setTimeout(() => this.successMessage = '', 3000);
    }
    
    // Make API call without showing loading indicator
    this.matchManageService.stopSound(this.matchId).subscribe({
      next: (response) => {
        // Update match details without full reload
        this.refreshMatchDetails();
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to stop sound';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  formatTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    
    // Create a date object directly from the ISO string without timezone conversion
    const parts = dateString.split('T');
    const datePart = parts[0]; // YYYY-MM-DD
    const timePart = parts[1]?.substring(0, 5); // HH:MM
    
    if (!datePart || !timePart) return dateString;
    
    const [year, month, day] = datePart.split('-').map(Number);
    
    // Format the date manually to match the server's time exactly in 24-hour format
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return `${monthNames[month-1]} ${day}, ${year}, ${timePart}`;
  }

  getScoreDisplay(): string {
    if (!this.matchDetail) return '0 : 0';
    return `${this.matchDetail.homeScore} : ${this.matchDetail.awayScore}`;
  }

  getStatusClass(status: string | null): string {
    if (!status) return '';
    
    switch (status) {      
      case 'PLAYING':
      case 'STARTED':
        return 'status-playing';
      case 'PAUSED':
        return 'status-paused';
      case 'STOPPED':
        return 'status-stopped';
      case 'PLANNED':
        return 'status-planned';
      case 'FINISHED':
        return 'status-finished';
      case 'CANCELLED':
        return 'status-cancelled';
      case 'POSTPONED':
        return 'status-postponed';
      default:
        return '';
    }
  }

  private updateFromResponse(response: any): void {
    if (response.activeSound) {
      // Update the selected sound if it's the same as the active sound
      if (this.selectedSound && this.selectedSound.id === response.activeSound.id) {
        this.selectedSound = {
          ...this.selectedSound,
          status: response.soundStatus,
          currentMillisecond: response.currentMillisecond
        };
      }
      
      // Update the match detail
      if (this.matchDetail) {
        this.matchDetail = {
          ...this.matchDetail,
          activeSound: response.activeSound,
          soundStatus: response.soundStatus,
          currentMillisecond: response.currentMillisecond,
          soundUpdatedAt: response.soundUpdatedAt
        };
      }
    }
  }
  
  /**
   * Refreshes match details after an action
   * Only called after a control action (start, stop, pause, etc.)
   * Uses partial updates to avoid full page reloads
   */
  private refreshMatchDetails(): void {
    if (!this.matchId) {
      this.isLoading = false;
      return;
    }
    
    // Don't show loading indicator for refreshes
    this.matchManageService.getMatchDetails(this.matchId).subscribe({
      next: (detail) => {
        // Update only necessary parts of the match detail
        if (this.matchDetail) {
          // Update active sound and sound status
          this.matchDetail.activeSound = detail.activeSound;
          this.matchDetail.soundStatus = detail.soundStatus;
          this.matchDetail.currentMillisecond = detail.currentMillisecond;
          this.matchDetail.soundUpdatedAt = detail.soundUpdatedAt;
          
          // Update scores if they changed
          if (this.matchDetail.homeScore !== detail.homeScore || 
              this.matchDetail.awayScore !== detail.awayScore) {
            this.matchDetail.homeScore = detail.homeScore;
            this.matchDetail.awayScore = detail.awayScore;
          }
          
          // Update match status if it changed
          if (this.matchDetail.status !== detail.status) {
            this.matchDetail.status = detail.status;
          }
        } else {
          // If no existing match detail, set it completely
          this.matchDetail = detail;
        }
        
        this.updatePlayerFromMatchDetail();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error refreshing match details:', error);
        this.isLoading = false;
      }
    });
  }
  
  /**
   * Toggle flashlight feature for the match
   * @param enabled Whether to enable or disable the flashlight
   */
  toggleFlashlight(enabled: boolean): void {
    if (!this.matchId) return;
    
    this.flashlightLoading = true;
    this.matchManageService.toggleFlashlight(this.matchId, enabled).subscribe({
      next: (response) => {
        this.flashlightEnabled = response.enabled;
        this.successMessage = response.message || `Fener ışığı ${enabled ? 'açıldı' : 'kapatıldı'}`;
        setTimeout(() => this.successMessage = '', 3000);
        this.flashlightLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || `Fener ışığı ${enabled ? 'açılamadı' : 'kapatılamadı'}`;
        setTimeout(() => this.errorMessage = '', 3000);
        this.flashlightLoading = false;
      }
    });
  }
}
