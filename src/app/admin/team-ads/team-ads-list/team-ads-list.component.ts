import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TeamAdsService } from '../team-ads.service';
import { AdPosition, AdType, TeamAd } from '../team-ad.model';
import { AdminLayoutComponent } from '../../../shared/layout/admin-layout.component';

@Component({
  selector: 'app-team-ads-list',
  templateUrl: './team-ads-list.component.html',
  styleUrls: ['./team-ads-list.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AdminLayoutComponent]
})
export class TeamAdsListComponent implements OnInit {
  teamAds: TeamAd[] = [];
  filteredAds: TeamAd[] = [];
  searchQuery: string = '';
  positionFilter: string = 'ALL';
  typeFilter: string = 'ALL';
  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  
  // Expose enums to the template
  AdPosition = AdPosition;
  AdType = AdType;
  
  constructor(private teamAdsService: TeamAdsService) { }

  ngOnInit(): void {
    this.loadTeamAds();
  }

  /**
   * Takım reklamlarını yükler
   */
  loadTeamAds(): void {
    this.isLoading = true;
    this.teamAdsService.getAllTeamAds().subscribe({
      next: (ads) => {
        this.teamAds = ads;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Reklamlar yüklenirken hata oluştu';
        this.isLoading = false;
        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
      }
    });
  }

  /**
   * Arama yapar
   */
  searchAds(): void {
    this.applyFilters();
  }

  /**
   * Filtreleri uygular
   */
  applyFilters(): void {
    let result = [...this.teamAds];
    
    // Arama filtresini uygula
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      result = result.filter(ad => 
        ad.title.toLowerCase().includes(query) || 
        ad.description.toLowerCase().includes(query)
      );
    }
    
    // Pozisyon filtresini uygula
    if (this.positionFilter !== 'ALL') {
      result = result.filter(ad => ad.adPosition === this.positionFilter as AdPosition);
    }
    
    // Tip filtresini uygula
    if (this.typeFilter !== 'ALL') {
      result = result.filter(ad => ad.adType === this.typeFilter as AdType);
    }
    
    this.filteredAds = result;
  }

  /**
   * Aramayı temizler
   */
  clearSearch(): void {
    this.searchQuery = '';
    this.positionFilter = 'ALL';
    this.typeFilter = 'ALL';
    this.applyFilters();
  }

  /**
   * Reklam durumunu değiştirir
   * @param ad Reklam
   */
  toggleAdStatus(ad: TeamAd): void {
    const newStatus = !ad.isActive;
    this.teamAdsService.changeTeamAdStatus(ad.id, newStatus).subscribe({
      next: (updatedAd) => {
        // Reklamı dizilerde güncelle
        const index = this.teamAds.findIndex(a => a.id === ad.id);
        if (index !== -1) {
          this.teamAds[index] = updatedAd;
        }
        
        const filteredIndex = this.filteredAds.findIndex(a => a.id === ad.id);
        if (filteredIndex !== -1) {
          this.filteredAds[filteredIndex] = updatedAd;
        }
        
        const statusText = newStatus ? 'aktifleştirildi' : 'devre dışı bırakıldı';
        this.successMessage = `Reklam başarıyla ${statusText}`;
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        if (error.status === 400) {
          this.errorMessage = 'Bu pozisyonda zaten aktif bir reklam var';
        } else {
          this.errorMessage = error.message || 'Reklam durumu değiştirilirken hata oluştu';
        }
        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
      }
    });
  }

  /**
   * Reklamı siler
   * @param id Reklamın ID'si
   */
  deleteAd(id: number): void {
    if (confirm('Bu reklamı silmek istediğinizden emin misiniz?')) {
      this.teamAdsService.deleteTeamAd(id).subscribe({
        next: () => {
          this.teamAds = this.teamAds.filter(ad => ad.id !== id);
          this.filteredAds = this.filteredAds.filter(ad => ad.id !== id);
          this.successMessage = 'Reklam başarıyla silindi';
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          this.errorMessage = error.message || 'Reklam silinirken hata oluştu';
          setTimeout(() => {
            this.errorMessage = '';
          }, 3000);
        }
      });
    }
  }

  /**
   * Tarih formatını düzenler
   * @param dateString Tarih string'i
   * @returns Formatlanmış tarih
   */
  formatDate(dateString: string): string {
    // ISO string'den doğrudan tarih nesnesi oluştur
    const parts = dateString.split('T');
    const datePart = parts[0]; // YYYY-MM-DD
    
    const [year, month, day] = datePart.split('-').map(Number);
    
    // Tarihi manuel olarak formatla
    const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    
    return `${day} ${monthNames[month-1]} ${year}`;
  }

  /**
   * Pozisyon adını alır
   * @param position Pozisyon enum değeri
   * @returns Pozisyon adı
   */
  getPositionName(position: AdPosition): string {
    switch (position) {
      case AdPosition.TOP_BANNER:
        return 'Üst Banner';
      case AdPosition.BOTTOM_BANNER:
        return 'Alt Banner';
      default:
        return position;
    }
  }

  /**
   * Pozisyon CSS sınıfını alır
   * @param position Pozisyon enum değeri
   * @returns CSS sınıf adı
   */
  getPositionClass(position: AdPosition): string {
    switch (position) {
      case AdPosition.TOP_BANNER:
        return 'position-top';
      case AdPosition.BOTTOM_BANNER:
        return 'position-bottom';
      default:
        return '';
    }
  }

  /**
   * Tip CSS sınıfını alır
   * @param type Tip enum değeri
   * @returns CSS sınıf adı
   */
  getTypeClass(type: AdType): string {
    switch (type) {
      case AdType.BANNER:
        return 'type-banner';
      case AdType.VIDEO:
        return 'type-video';
      case AdType.POPUP:
        return 'type-popup';
      case AdType.SPONSOR:
        return 'type-sponsor';
      default:
        return '';
    }
  }
}
