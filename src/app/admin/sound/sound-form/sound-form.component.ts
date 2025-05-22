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
  soundFile1: File | null = null;
  soundFile2: File | null = null;
  uploadProgress1 = 0;
  uploadProgress2 = 0;
  isUploading1 = false;
  isUploading2 = false;
  
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
      soundUrl1: [''],
      soundUrl2: [''],
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
          soundUrl1: sound.soundUrl1,
          soundUrl2: sound.soundUrl2,
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
      // If we have a new primary sound file during edit mode, upload it first
      if (this.soundFile1) {
        this.uploadAndUpdateSound();
      } else {
        this.updateSound();
      }
    } else if (this.soundFile1) {
      this.uploadAndCreateSound();
    } else {
      this.createSound();
    }
  }

  createSound(): void {
    const soundData: SoundRequest = {
      title: this.soundForm.get('title')?.value,
      soundUrl1: this.soundForm.get('soundUrl1')?.value,
      soundUrl2: this.soundForm.get('soundUrl2')?.value,
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
    if (!this.soundFile1) return;
    
    const title = this.soundForm.get('title')?.value;
    
    this.soundService.uploadSoundFile(title, this.soundFile1).subscribe({
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
    if (!this.soundId || !this.soundFile1) return;
    
    // First upload the primary sound file
    const title = this.soundForm.get('title')?.value;
    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', this.soundFile1);
    
    this.isUploading1 = true;
    this.uploadProgress1 = 0;
    
    // Simulate upload progress
    const interval = setInterval(() => {
      this.uploadProgress1 += 5;
      if (this.uploadProgress1 >= 100) {
        clearInterval(interval);
      }
    }, 100);
    
    // Use a custom endpoint for updating with file upload
    this.soundService.uploadPrimarySoundFile(this.soundId, this.soundFile1).subscribe({
      next: (sound: SoundResponse) => {
        clearInterval(interval);
        this.uploadProgress1 = 100;
        this.isUploading1 = false;
        
        // Update the form with the new URL
        this.soundForm.patchValue({ soundUrl1: sound.soundUrl1 });
        
        // Now update the rest of the sound data
        this.updateSound();
      },
      error: (error: any) => {
        clearInterval(interval);
        this.isUploading1 = false;
        this.errorMessage = error.message || 'Failed to upload sound file';
        this.isSaving = false;
      }
    });
  }

  updateSound(): void {
    if (!this.soundId) return;
    
    const soundData: SoundRequest = {
      title: this.soundForm.get('title')?.value,
      soundUrl1: this.soundForm.get('soundUrl1')?.value,
      soundUrl2: this.soundForm.get('soundUrl2')?.value,
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
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Check if file is an audio file
      if (!file.type.startsWith('audio/')) {
        this.errorMessage = 'Please select an audio file';
        return;
      }
      
      if (fileNumber === 1) {
        this.soundFile1 = file;
        // Store the file name for display
        const fileName = file.name;
        console.log('Selected primary sound file:', fileName);
        
        // Don't immediately upload in edit mode, wait for form submission
        this.simulateUploadProgress(1);
      } else {
        this.soundFile2 = file;
        // Store the file name for display
        const fileName = file.name;
        console.log('Selected secondary sound file:', fileName);
        
        if (this.isEditMode && this.soundId) {
          this.uploadSecondarySoundFile();
        } else {
          this.simulateUploadProgress(2);
        }
      }
    }
  }

  uploadSecondarySoundFile(): void {
    if (!this.soundId || !this.soundFile2) return;
    
    this.isUploading2 = true;
    this.uploadProgress2 = 0;
    
    // Simulate upload progress
    const interval = setInterval(() => {
      this.uploadProgress2 += 10;
      if (this.uploadProgress2 >= 100) {
        clearInterval(interval);
      }
    }, 200);
    
    this.soundService.uploadSecondarySoundFile(this.soundId, this.soundFile2).subscribe({
      next: (sound) => {
        this.soundForm.patchValue({ soundUrl2: sound.soundUrl2 });
        this.isUploading2 = false;
        this.uploadProgress2 = 100;
        this.successMessage = 'Secondary sound file uploaded successfully';
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to upload secondary sound file';
        this.isUploading2 = false;
        clearInterval(interval);
      }
    });
  }

  simulateUploadProgress(fileNumber: number): void {
    if (fileNumber === 1) {
      this.isUploading1 = true;
      this.uploadProgress1 = 0;
      
      // Create a temporary object URL for the file to display it in the UI
      if (this.soundFile1) {
        const tempUrl = URL.createObjectURL(this.soundFile1);
        console.log('Created temporary URL for primary sound file:', tempUrl);
        this.soundForm.patchValue({ soundUrl1: tempUrl });
      }
      
      const interval = setInterval(() => {
        this.uploadProgress1 += 10;
        if (this.uploadProgress1 >= 100) {
          clearInterval(interval);
          this.isUploading1 = false;
          
          // Ensure the file is still displayed after upload simulation completes
          if (this.soundFile1) {
            console.log('Upload simulation complete, file should remain visible');
          }
        }
      }, 200);
    } else {
      this.isUploading2 = true;
      this.uploadProgress2 = 0;
      
      // Create a temporary object URL for the file to display it in the UI
      if (this.soundFile2) {
        const tempUrl = URL.createObjectURL(this.soundFile2);
        console.log('Created temporary URL for secondary sound file:', tempUrl);
        this.soundForm.patchValue({ soundUrl2: tempUrl });
      }
      
      const interval = setInterval(() => {
        this.uploadProgress2 += 10;
        if (this.uploadProgress2 >= 100) {
          clearInterval(interval);
          this.isUploading2 = false;
          
          // Ensure the file is still displayed after upload simulation completes
          if (this.soundFile2) {
            console.log('Upload simulation complete, file should remain visible');
          }
        }
      }, 200);
    }
  }

  removeFile(fileNumber: number): void {
    if (fileNumber === 1) {
      this.soundForm.patchValue({ soundUrl1: '' });
      this.soundFile1 = null;
    } else {
      this.soundForm.patchValue({ soundUrl2: '' });
      this.soundFile2 = null;
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
