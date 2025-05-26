import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { LyricsService } from '../lyrics.service';
import { SoundService } from '../../sound/sound.service';
import { Lyrics, LyricsRequest } from '../lyrics.model';
import { SoundResponse } from '../../sound/sound.model';
import { AdminLayoutComponent } from '../../../shared/layout/admin-layout.component';

@Component({
  selector: 'app-lyrics-editor',
  templateUrl: './lyrics-editor.component.html',
  styleUrls: ['./lyrics-editor.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AdminLayoutComponent
  ]
})
export class LyricsEditorComponent implements OnInit, OnDestroy {
  soundId: number | null = null;
  sound: SoundResponse | null = null;
  lyrics: Lyrics[] = [];
  lyricsForm: FormGroup;
  isLoading = false;
  isPlaying = false;
  isPaused = false;
  currentTime = 0;
  duration = 0;
  audioElement: HTMLAudioElement | null = null;
  successMessage = '';
  errorMessage = '';
  isEditMode = false;
  editingLyricsId: number | null = null;
  private subscriptions: Subscription[] = [];
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private lyricsService: LyricsService,
    private soundService: SoundService
  ) {
    this.lyricsForm = this.formBuilder.group({
      lyric: ['', [Validators.required]],
      second: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.soundId = +params['id'];
        this.loadSound();
        this.loadLyrics();
      }
    });
  }

  ngOnDestroy(): void {
    this.stopAudio();
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadSound(): void {
    if (!this.soundId) return;
    
    this.isLoading = true;
    this.soundService.getSoundById(this.soundId).subscribe({
      next: (sound) => {
        this.sound = sound;
        this.isLoading = false;
        
        // Initialize audio element
        if (sound.soundUrl) {
          this.initAudio(sound.soundUrl);
        }
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load sound';
        this.isLoading = false;
      }
    });
  }

  loadLyrics(): void {
    if (!this.soundId) return;
    
    this.isLoading = true;
    this.lyricsService.getLyricsForSound(this.soundId).subscribe({
      next: (lyrics) => {
        this.lyrics = lyrics;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load lyrics';
        this.isLoading = false;
      }
    });
  }

  initAudio(url: string): void {
    this.audioElement = new Audio(url);
    
    this.audioElement.addEventListener('loadedmetadata', () => {
      if (this.audioElement) {
        this.duration = this.audioElement.duration;
      }
    });
    
    this.audioElement.addEventListener('timeupdate', () => {
      if (this.audioElement) {
        this.currentTime = this.audioElement.currentTime;
      }
    });
    
    this.audioElement.addEventListener('ended', () => {
      this.isPlaying = false;
      this.isPaused = false;
    });
  }

  playAudio(): void {
    if (!this.audioElement) return;
    
    this.audioElement.play();
    this.isPlaying = true;
    this.isPaused = false;
  }

  pauseAudio(): void {
    if (!this.audioElement) return;
    
    this.audioElement.pause();
    this.isPlaying = false;
    this.isPaused = true;
  }

  stopAudio(): void {
    if (!this.audioElement) return;
    
    this.audioElement.pause();
    this.audioElement.currentTime = 0;
    this.isPlaying = false;
    this.isPaused = false;
  }

  seekAudio(event: Event): void {
    if (!this.audioElement) return;
    
    const target = event.target as HTMLInputElement;
    const seekTime = parseFloat(target.value);
    this.audioElement.currentTime = seekTime;
  }

  captureCurrentTime(): void {
    if (!this.audioElement) return;
    
    const currentSecond = Math.floor(this.audioElement.currentTime);
    this.lyricsForm.patchValue({ second: currentSecond });
  }

  addLyrics(): void {
    if (!this.soundId || this.lyricsForm.invalid) return;
    
    const lyricsData: LyricsRequest = {
      lyric: this.lyricsForm.get('lyric')?.value,
      second: this.lyricsForm.get('second')?.value
    };
    
    if (this.isEditMode && this.editingLyricsId) {
      // Update existing lyrics
      this.lyricsService.updateLyrics(this.editingLyricsId, lyricsData).subscribe({
        next: (updatedLyric) => {
          // Find and replace the updated lyrics in the array
          const index = this.lyrics.findIndex(item => item.id === this.editingLyricsId);
          if (index !== -1) {
            this.lyrics[index] = updatedLyric;
          }
          this.lyrics.sort((a, b) => a.second - b.second);
          this.successMessage = 'Lyrics updated successfully';
          
          // Reset form and edit mode
          this.lyricsForm.reset({ lyric: '', second: 0 });
          this.isEditMode = false;
          this.editingLyricsId = null;
          
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to update lyrics';
          
          setTimeout(() => {
            this.errorMessage = '';
          }, 3000);
        }
      });
    } else {
      // Create new lyrics
      this.lyricsService.createLyrics(this.soundId, lyricsData).subscribe({
        next: (newLyric) => {
          this.lyrics.push(newLyric);
          this.lyrics.sort((a, b) => a.second - b.second);
          this.successMessage = 'Lyrics added successfully';
          this.lyricsForm.reset({ lyric: '', second: 0 });
          
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to add lyrics';
          
          setTimeout(() => {
            this.errorMessage = '';
          }, 3000);
        }
      });
    }
  }

  editLyrics(lyrics: Lyrics): void {
    if (!lyrics.id) return;
    
    // Set edit mode and store the lyrics ID being edited
    this.isEditMode = true;
    this.editingLyricsId = lyrics.id;
    
    // Populate the form with the lyrics data
    this.lyricsForm.patchValue({
      lyric: lyrics.lyric,
      second: lyrics.second
    });
    
    // Scroll to form
    document.getElementById('lyricsForm')?.scrollIntoView({ behavior: 'smooth' });
  }

  deleteLyrics(id: number): void {
    if (confirm('Are you sure you want to delete these lyrics?')) {
      this.lyricsService.deleteLyrics(id).subscribe({
        next: () => {
          this.lyrics = this.lyrics.filter(item => item.id !== id);
          this.successMessage = 'Lyrics deleted successfully';
          
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to delete lyrics';
          
          setTimeout(() => {
            this.errorMessage = '';
          }, 3000);
        }
      });
    }
  }

  deleteAllLyrics(): void {
    if (!this.soundId) return;
    
    if (confirm('Are you sure you want to delete all lyrics for this sound?')) {
      this.lyricsService.deleteAllLyricsForSound(this.soundId).subscribe({
        next: () => {
          this.lyrics = [];
          this.successMessage = 'All lyrics deleted successfully';
          
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          this.errorMessage = error.message || 'Failed to delete all lyrics';
          
          setTimeout(() => {
            this.errorMessage = '';
          }, 3000);
        }
      });
    }
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  cancelEdit(): void {
    // Reset form and edit mode
    this.lyricsForm.reset({ lyric: '', second: 0 });
    this.isEditMode = false;
    this.editingLyricsId = null;
  }

  goBack(): void {
    this.router.navigate(['/admin/sounds']);
  }
}
