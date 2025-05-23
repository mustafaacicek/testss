import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatchSoundDetailService } from '../match-sound-detail.service';
import { MatchService } from '../match.service';
import { MatchResponse } from '../match.model';
import { 
  MatchSoundDetailResponse, 
  MatchSoundResponse, 
  EventType, 
  SoundStatus 
} from '../match-sound-detail.model';
import { AdminLayoutComponent } from '../../../shared/layout/admin-layout.component';

@Component({
  selector: 'app-match-sound-detail',
  templateUrl: './match-sound-detail.component.html',
  styleUrls: ['./match-sound-detail.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AdminLayoutComponent]
})
export class MatchSoundDetailComponent implements OnInit, OnDestroy {
  matchId: number | null = null;
  match: MatchResponse | null = null;
  availableSounds: MatchSoundResponse[] = [];
  soundDetails: MatchSoundDetailResponse[] = [];
  latestSoundDetail: MatchSoundDetailResponse | null = null;
  selectedSound: MatchSoundResponse | null = null;
  currentPosition: number = 0;
  isPlaying: boolean = false;
  isPaused: boolean = false;
  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  
  // Audio player
  audioPlayer: HTMLAudioElement | null = null;
  
  private isComponentActive: boolean = true;
  
  // Enums for template
  EventType = EventType;
  SoundStatus = SoundStatus;
  
  constructor(
    private matchService: MatchService,
    private matchSoundDetailService: MatchSoundDetailService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.matchId = +params['id'];
        this.loadMatch();
        this.loadAvailableSounds();
        this.loadSoundDetails();
        this.loadLatestSoundDetail();
      }
    });
    
    // Initialize audio player
    this.audioPlayer = new Audio();
    this.audioPlayer.addEventListener('timeupdate', this.updateCurrentPosition.bind(this));
    this.audioPlayer.addEventListener('ended', this.onAudioEnded.bind(this));
  }

  ngOnDestroy(): void {
    this.isComponentActive = false;
    
    // Clean up audio player
    if (this.audioPlayer) {
      this.audioPlayer.pause();
      this.audioPlayer.src = '';
    }
  }



  loadMatch(): void {
    if (!this.matchId) return;
    
    this.isLoading = true;
    this.matchService.getMatchById(this.matchId).subscribe({
      next: (match) => {
        this.match = match;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load match';
        this.isLoading = false;
      }
    });
  }

  loadAvailableSounds(): void {
    if (!this.matchId) return;
    
    this.isLoading = true;
    this.matchSoundDetailService.getAvailableSounds(this.matchId).subscribe({
      next: (sounds) => {
        this.availableSounds = sounds;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load available sounds';
        this.isLoading = false;
      }
    });
  }

  loadSoundDetails(): void {
    if (!this.matchId) return;
    
    this.matchSoundDetailService.getMatchSoundDetailsByMatchId(this.matchId).subscribe({
      next: (details) => {
        this.soundDetails = details;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load sound details';
      }
    });
  }

  loadLatestSoundDetail(): void {
    if (!this.matchId) return;
    
    this.matchSoundDetailService.getLatestMatchSoundDetail(this.matchId).subscribe({
      next: (detail) => {
        this.latestSoundDetail = detail;
        this.updatePlayerFromLatestDetail();
      },
      error: (error) => {
        console.error('Failed to load latest sound detail:', error);
      }
    });
  }

  updatePlayerFromLatestDetail(): void {
    if (!this.latestSoundDetail) return;
    
    // Find the sound in available sounds
    const sound = this.availableSounds.find(s => s.id === this.latestSoundDetail?.activeSoundId);
    
    if (sound && this.selectedSound?.id !== sound.id) {
      this.selectedSound = sound;
      
      // Update audio player source
      if (this.audioPlayer) {
        this.audioPlayer.src = sound.soundUrl1;
        this.audioPlayer.load();
      }
    }
    
    // Update position
    this.currentPosition = this.latestSoundDetail.currentMillisecond;
    
    // Update playback state
    if (this.latestSoundDetail.soundStatus === SoundStatus.PLAYING && !this.isPlaying) {
      this.isPlaying = true;
      this.isPaused = false;
      if (this.audioPlayer) {
        this.audioPlayer.currentTime = this.currentPosition / 1000;
        this.audioPlayer.play();
      }
    } else if (this.latestSoundDetail.soundStatus === SoundStatus.PAUSED && !this.isPaused) {
      this.isPlaying = false;
      this.isPaused = true;
      if (this.audioPlayer) {
        this.audioPlayer.pause();
      }
    } else if (this.latestSoundDetail.soundStatus === SoundStatus.STOPPED && (this.isPlaying || this.isPaused)) {
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
    if (this.audioPlayer && sound.soundUrl1) {
      this.audioPlayer.src = sound.soundUrl1;
      this.audioPlayer.load();
    }
  }

  startSound(): void {
    if (!this.selectedSound || !this.matchId) return;
    
    this.matchSoundDetailService.startSound(this.matchId, this.selectedSound.id).subscribe({
      next: (response) => {
        this.latestSoundDetail = response;
        this.isPlaying = true;
        this.isPaused = false;
        this.currentPosition = 0;
        
        // Play locally
        if (this.audioPlayer) {
          this.audioPlayer.currentTime = 0;
          this.audioPlayer.play();
        }
        
        this.successMessage = 'Sound started successfully';
        setTimeout(() => this.successMessage = '', 3000);
        
        // Refresh sound details
        this.loadSoundDetails();
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to start sound';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  stopSound(): void {
    if (!this.selectedSound || !this.matchId) return;
    
    this.matchSoundDetailService.stopSound(this.matchId, this.selectedSound.id).subscribe({
      next: (response) => {
        this.latestSoundDetail = response;
        this.isPlaying = false;
        this.isPaused = false;
        
        // Stop locally
        if (this.audioPlayer) {
          this.audioPlayer.pause();
          this.audioPlayer.currentTime = 0;
          this.currentPosition = 0;
        }
        
        this.successMessage = 'Sound stopped successfully';
        setTimeout(() => this.successMessage = '', 3000);
        
        // Refresh sound details
        this.loadSoundDetails();
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to stop sound';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  pauseSound(): void {
    if (!this.selectedSound || !this.matchId) return;
    
    this.matchSoundDetailService.pauseSound(this.matchId, this.selectedSound.id).subscribe({
      next: (response) => {
        this.latestSoundDetail = response;
        this.isPlaying = false;
        this.isPaused = true;
        
        // Pause locally
        if (this.audioPlayer) {
          this.audioPlayer.pause();
        }
        
        this.successMessage = 'Sound paused successfully';
        setTimeout(() => this.successMessage = '', 3000);
        
        // Refresh sound details
        this.loadSoundDetails();
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to pause sound';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  resumeSound(): void {
    if (!this.selectedSound || !this.matchId) return;
    
    this.matchSoundDetailService.resumeSound(this.matchId, this.selectedSound.id).subscribe({
      next: (response) => {
        this.latestSoundDetail = response;
        this.isPlaying = true;
        this.isPaused = false;
        
        // Resume locally
        if (this.audioPlayer) {
          this.audioPlayer.play();
        }
        
        this.successMessage = 'Sound resumed successfully';
        setTimeout(() => this.successMessage = '', 3000);
        
        // Refresh sound details
        this.loadSoundDetails();
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to resume sound';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  seekSound(position: number): void {
    if (!this.selectedSound || !this.matchId) return;
    
    this.currentPosition = position;
    
    this.matchSoundDetailService.updateSoundPosition(this.matchId, this.selectedSound.id, position).subscribe({
      next: (response) => {
        this.latestSoundDetail = response;
        
        // Seek locally
        if (this.audioPlayer) {
          this.audioPlayer.currentTime = position / 1000;
        }
        
        // Refresh sound details
        this.loadSoundDetails();
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
    this.isPlaying = false;
    this.isPaused = false;
    this.currentPosition = 0;
    
    // If the audio ended locally, update the server
    if (this.selectedSound && this.matchId) {
      this.stopSound();
    }
  }

  formatTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  formatDate(dateString: string): string {
    // Create a date object directly from the ISO string without timezone conversion
    const parts = dateString.split('T');
    const datePart = parts[0]; // YYYY-MM-DD
    const timePart = parts[1].substring(0, 5); // HH:MM
    
    const [year, month, day] = datePart.split('-').map(Number);
    
    // Format the date manually to match the server's time exactly in 24-hour format
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return `${monthNames[month-1]} ${day}, ${year}, ${timePart}`;
  }

  getEventTypeClass(eventType: EventType): string {
    switch (eventType) {
      case EventType.START:
      case EventType.PLAY:
        return 'event-start';
      case EventType.STOP:
        return 'event-stop';
      case EventType.PAUSE:
        return 'event-pause';
      case EventType.RESUME:
        return 'event-resume';
      case EventType.SEEK:
        return 'event-seek';
      default:
        return '';
    }
  }

  getSoundStatusClass(status: SoundStatus): string {
    switch (status) {
      case SoundStatus.PLAYING:
        return 'status-playing';
      case SoundStatus.PAUSED:
        return 'status-paused';
      case SoundStatus.STOPPED:
        return 'status-stopped';
      default:
        return '';
    }
  }
}
