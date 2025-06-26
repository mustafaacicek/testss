import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TeamAdsService } from '../team-ads.service';
import { AdPosition, AdType, TeamAd, TeamAdRequest } from '../team-ad.model';
import { AdminLayoutComponent } from '../../../shared/layout/admin-layout.component';

@Component({
  selector: 'app-team-ad-form',
  templateUrl: './team-ad-form.component.html',
  styleUrls: ['./team-ad-form.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, AdminLayoutComponent]
})
export class TeamAdFormComponent implements OnInit {
  adForm: FormGroup;
  isEditMode = false;
  adId: number | null = null;
  isLoading = false;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  
  // Enum değerleri
  adPositions: AdPosition[] = [];
  adTypes: AdType[] = [];
  
  constructor(
    private fb: FormBuilder,
    private teamAdsService: TeamAdsService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.adForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadEnums();
    
    // URL'den ID parametresini al
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.adId = +id;
      this.loadTeamAd(this.adId);
    }
  }

  /**
   * Form oluşturur
   */
  createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      imageUrl: ['', [Validators.required, Validators.pattern('https?://.+')]],
      redirectUrl: ['', [Validators.required, Validators.pattern('https?://.+')]],
      displayOrder: [1, [Validators.required, Validators.min(1)]],
      isActive: [false],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      adPosition: ['', Validators.required],
      adType: ['', Validators.required]
    });
  }

  /**
   * Enum değerlerini yükler
   */
  loadEnums(): void {
    this.isLoading = true;
    
    // Pozisyonları yükle
    this.teamAdsService.getAdPositions().subscribe({
      next: (positions) => {
        this.adPositions = positions;
      },
      error: (error) => {
        this.errorMessage = 'Pozisyonlar yüklenirken hata oluştu';
        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
      }
    });
    
    // Tipleri yükle
    this.teamAdsService.getAdTypes().subscribe({
      next: (types) => {
        this.adTypes = types;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Tipler yüklenirken hata oluştu';
        this.isLoading = false;
        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
      }
    });
  }

  /**
   * Takım reklamını yükler
   * @param id Reklamın ID'si
   */
  loadTeamAd(id: number): void {
    this.isLoading = true;
    this.teamAdsService.getTeamAdById(id).subscribe({
      next: (ad) => {
        // Form değerlerini doldur
        this.adForm.patchValue({
          title: ad.title,
          description: ad.description,
          imageUrl: ad.imageUrl,
          redirectUrl: ad.redirectUrl,
          displayOrder: ad.displayOrder,
          isActive: ad.isActive,
          startDate: this.formatDateForInput(ad.startDate),
          endDate: this.formatDateForInput(ad.endDate),
          adPosition: ad.adPosition,
          adType: ad.adType
        });
        this.isLoading = false;
      },
      error: (error) => {
        if (error.status === 404) {
          this.errorMessage = 'Reklam bulunamadı';
        } else if (error.status === 403) {
          this.errorMessage = 'Bu reklamı görüntüleme yetkiniz yok';
        } else {
          this.errorMessage = error.message || 'Reklam yüklenirken hata oluştu';
        }
        this.isLoading = false;
        setTimeout(() => {
          this.errorMessage = '';
          this.router.navigate(['/admin/team-ads']);
        }, 3000);
      }
    });
  }

  /**
   * Formu gönderir
   */
  onSubmit(): void {
    if (this.adForm.invalid) {
      this.markFormGroupTouched(this.adForm);
      return;
    }
    
    const formValue = this.adForm.value;
    
    // API'ye gönderilecek veriyi oluştur
    const teamAdRequest: TeamAdRequest = {
      title: formValue.title,
      description: formValue.description,
      imageUrl: formValue.imageUrl,
      redirectUrl: formValue.redirectUrl,
      displayOrder: formValue.displayOrder,
      isActive: formValue.isActive,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      adPosition: formValue.adPosition,
      adType: formValue.adType
    };
    
    this.isSubmitting = true;
    
    if (this.isEditMode && this.adId) {
      // Güncelleme işlemi
      this.teamAdsService.updateTeamAd(this.adId, teamAdRequest).subscribe({
        next: (updatedAd) => {
          this.successMessage = 'Reklam başarıyla güncellendi';
          this.isSubmitting = false;
          setTimeout(() => {
            this.router.navigate(['/admin/team-ads']);
          }, 1500);
        },
        error: (error) => {
          this.handleSubmitError(error);
        }
      });
    } else {
      // Oluşturma işlemi
      this.teamAdsService.createTeamAd(teamAdRequest).subscribe({
        next: (createdAd) => {
          this.successMessage = 'Reklam başarıyla oluşturuldu';
          this.isSubmitting = false;
          setTimeout(() => {
            this.router.navigate(['/admin/team-ads']);
          }, 1500);
        },
        error: (error) => {
          this.handleSubmitError(error);
        }
      });
    }
  }

  /**
   * Form gönderimi hatasını işler
   * @param error Hata nesnesi
   */
  handleSubmitError(error: any): void {
    this.isSubmitting = false;
    if (error.status === 400) {
      if (error.error && error.error.message && error.error.message.includes('active ad')) {
        this.errorMessage = 'Bu pozisyonda zaten aktif bir reklam var';
      } else {
        this.errorMessage = 'Geçersiz form verileri';
      }
    } else if (error.status === 403) {
      this.errorMessage = 'Bu işlemi gerçekleştirme yetkiniz yok';
    } else if (error.status === 404) {
      this.errorMessage = 'Reklam bulunamadı';
    } else {
      this.errorMessage = error.message || 'Reklam kaydedilirken hata oluştu';
    }
    
    setTimeout(() => {
      this.errorMessage = '';
    }, 3000);
  }

  /**
   * Tüm form alanlarını dokunulmuş olarak işaretler
   * @param formGroup Form grubu
   */
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  /**
   * Tarihi input için formatlar
   * @param dateString Tarih string'i
   * @returns Formatlanmış tarih
   */
  formatDateForInput(dateString: string): string {
    // ISO string'i YYYY-MM-DDThh:mm formatına dönüştür
    return dateString.substring(0, 16);
  }

  /**
   * İptal işlemi
   */
  onCancel(): void {
    this.router.navigate(['/admin/team-ads']);
  }
}
