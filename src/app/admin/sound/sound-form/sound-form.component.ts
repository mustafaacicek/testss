import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SoundService } from '../sound.service';
import { Sound, SoundRequest, SoundResponse, SoundStatus } from '../sound.model';
import { AdminLayoutComponent } from '../../../shared/layout/admin-layout.component';

@Component({
  selector: 'app-sound-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, AdminLayoutComponent],
  templateUrl: './sound-form.component.html',
  styleUrls: ['./sound-form.component.scss']
})
export class SoundFormComponent implements OnInit {
  soundForm: FormGroup;
  soundId: number | null = null;
  isEditMode = false;
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';
  soundFile: File | null = null;
  imageFile: File | null = null;
  uploadProgressSound = 0;
  uploadProgressImage = 0;
  isUploadingSound = false;
  isUploadingImage = false;
  
  constructor(
    private fb: FormBuilder,
    private soundService: SoundService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.soundForm = this.createForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.soundId = +params['id'];
        this.isEditMode = true;
        this.loadSound(this.soundId);
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      soundUrl: [''],
      soundImageUrl: [''],
      status: [SoundStatus.STOPPED],
      currentMillisecond: [0]
    });
  }

  loadSound(id: number): void {
    this.isLoading = true;
    this.soundService.getSoundById(id).subscribe({
      next: (sound) => {
        this.soundForm.patchValue({
          title: sound.title,
          soundUrl: sound.soundUrl,
          soundImageUrl: sound.soundImageUrl,
          status: sound.status,
          currentMillisecond: sound.currentMillisecond
        });
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load sound';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.soundForm.invalid) {
      this.markFormGroupTouched(this.soundForm);
      return;
    }

    this.isSaving = true;
    
    if (this.isEditMode && this.soundId) {
      // If we have a new sound file during edit mode, upload it first
      if (this.soundFile) {
        this.uploadAndUpdateSound();
      } else {
        this.updateSound();
      }
    } else if (this.soundFile) {
      this.uploadAndCreateSound();
    } else {
      this.createSound();
    }
  }

  createSound(): void {
    const soundData: SoundRequest = {
      title: this.soundForm.get('title')?.value,
      soundUrl: this.soundForm.get('soundUrl')?.value,
      soundImageUrl: this.soundForm.get('soundImageUrl')?.value,
      status: this.soundForm.get('status')?.value,
      currentMillisecond: this.soundForm.get('currentMillisecond')?.value
    };

    this.soundService.createSound(soundData).subscribe({
      next: (sound) => {
        this.successMessage = 'Sound created successfully';
        this.isSaving = false;
        setTimeout(() => {
          this.router.navigate(['/admin/sounds', sound.id]);
        }, 1500);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to create sound';
        this.isSaving = false;
      }
    });
  }

  uploadAndCreateSound(): void {
    if (!this.soundFile) return;
    
    const title = this.soundForm.get('title')?.value;
    
    // Convert null to undefined for the imageFile parameter
    const imageFileParam = this.imageFile || undefined;
    
    this.soundService.uploadNewSoundFile(title, this.soundFile, imageFileParam).subscribe({
      next: (sound) => {
        this.successMessage = 'Sound uploaded and created successfully';
        this.isSaving = false;
        setTimeout(() => {
          this.router.navigate(['/admin/sounds', sound.id]);
        }, 1500);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to upload and create sound';
        this.isSaving = false;
      }
    });
  }

  uploadAndUpdateSound(): void {
    if (!this.soundId || !this.soundFile) return;
    
    this.isUploadingSound = true;
    this.uploadProgressSound = 0;
    
    // Simulate upload progress
    const interval = setInterval(() => {
      this.uploadProgressSound += 10;
      if (this.uploadProgressSound >= 100) {
        clearInterval(interval);
      }
    }, 200);
    
    // Upload the sound file
    this.soundService.uploadSoundFile(this.soundId, this.soundFile).subscribe({
      next: (sound: SoundResponse) => {
        clearInterval(interval);
        this.uploadProgressSound = 100;
        this.isUploadingSound = false;
        
        // Update the form with the new URL
        this.soundForm.patchValue({ soundUrl: sound.soundUrl });
        
        // Now update the rest of the sound data
        this.updateSound();
      },
      error: (error) => {
        clearInterval(interval);
        this.isUploadingSound = false;
        this.errorMessage = error.message || 'Failed to upload sound file';
        this.isSaving = false;
      }
    });
  }

  updateSound(): void {
    if (!this.soundId) return;
    
    const soundData: SoundRequest = {
      title: this.soundForm.get('title')?.value,
      soundUrl: this.soundForm.get('soundUrl')?.value,
      soundImageUrl: this.soundForm.get('soundImageUrl')?.value,
      status: this.soundForm.get('status')?.value,
      currentMillisecond: this.soundForm.get('currentMillisecond')?.value
    };

    this.soundService.updateSound(this.soundId, soundData).subscribe({
      next: (sound) => {
        this.successMessage = 'Sound updated successfully';
        this.isSaving = false;
        setTimeout(() => {
          this.router.navigate(['/admin/sounds', sound.id]);
        }, 1500);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to update sound';
        this.isSaving = false;
      }
    });
  }

  onFileSelected(event: Event, fileNumber: number): void {
    const element = event.target as HTMLInputElement;
    if (element.files && element.files.length > 0) {
      const file = element.files[0];
      
      if (fileNumber === 1) {
        // Check if it's an audio file
        if (!file.type.startsWith('audio/')) {
          this.errorMessage = 'Please select an audio file (MP3, WAV, etc.)';
          return;
        }
        
        this.soundFile = file;
        // Store the file name for display
        const fileName = file.name;
        console.log('Selected sound file:', fileName);
        
        // Don't immediately upload in edit mode, wait for form submission
        this.simulateUploadProgress(1);
      } else {
        // Check if it's an image file
        if (!file.type.startsWith('image/')) {
          this.errorMessage = 'Please select an image file (JPG, PNG, etc.)';
          return;
        }
        
        this.imageFile = file;
        // Store the file name for display
        const fileName = file.name;
        console.log('Selected image file:', fileName);
        
        if (this.isEditMode && this.soundId) {
          this.uploadSoundImageFile();
        } else {
          this.simulateUploadProgress(2);
        }
      }
    }
  }

  uploadSoundImageFile(): void {
    if (!this.soundId || !this.imageFile) return;
    
    this.isUploadingImage = true;
    this.uploadProgressImage = 0;
    
    // Simulate upload progress
    const interval = setInterval(() => {
      this.uploadProgressImage += 10;
      if (this.uploadProgressImage >= 100) {
        clearInterval(interval);
      }
    }, 200);
    
    this.soundService.uploadSoundImageFile(this.soundId, this.imageFile).subscribe({
      next: (sound) => {
        this.soundForm.patchValue({ soundImageUrl: sound.soundImageUrl });
        this.isUploadingImage = false;
        this.uploadProgressImage = 100;
        this.successMessage = 'Sound image file uploaded successfully';
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to upload sound image file';
        this.isUploadingImage = false;
        clearInterval(interval);
      }
    });
  }

  simulateUploadProgress(fileNumber: number): void {
    if (fileNumber === 1) {
      this.isUploadingSound = true;
      this.uploadProgressSound = 0;
      
      // Create a temporary object URL for the file to display it in the UI
      if (this.soundFile) {
        const tempUrl = URL.createObjectURL(this.soundFile);
        console.log('Created temporary URL for sound file:', tempUrl);
        this.soundForm.patchValue({ soundUrl: tempUrl });
      }
      
      const interval = setInterval(() => {
        this.uploadProgressSound += 10;
        if (this.uploadProgressSound >= 100) {
          clearInterval(interval);
          this.isUploadingSound = false;
          
          // Ensure the file is still displayed after upload simulation completes
          if (this.soundFile) {
            console.log('Upload simulation complete, file should remain visible');
          }
        }
      }, 200);
    } else {
      this.isUploadingImage = true;
      this.uploadProgressImage = 0;
      
      // Create a temporary object URL for the file to display it in the UI
      if (this.imageFile) {
        const tempUrl = URL.createObjectURL(this.imageFile);
        console.log('Created temporary URL for image file:', tempUrl);
        this.soundForm.patchValue({ soundImageUrl: tempUrl });
      }
      
      const interval = setInterval(() => {
        this.uploadProgressImage += 10;
        if (this.uploadProgressImage >= 100) {
          clearInterval(interval);
          this.isUploadingImage = false;
          
          // Ensure the file is still displayed after upload simulation completes
          if (this.imageFile) {
            console.log('Upload simulation complete, file should remain visible');
          }
        }
      }, 200);
    }
  }

  removeFile(fileNumber: number): void {
    if (fileNumber === 1) {
      this.soundForm.patchValue({ soundUrl: '' });
      this.soundFile = null;
    } else {
      this.soundForm.patchValue({ soundImageUrl: '' });
      this.imageFile = null;
    }
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  cancelEdit(): void {
    if (this.isEditMode && this.soundId) {
      this.router.navigate(['/admin/sounds', this.soundId]);
    } else {
      this.router.navigate(['/admin/sounds']);
    }
  }
}
