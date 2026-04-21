import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Ad } from '../../models/ad.model';
import { AdService } from '../../services/ads/ad.service';

const PLACEHOLDER_PHOTO = 'assets/images/placeholder.svg';

@Component({
  selector: 'app-ads-list',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  template: `
    <main class="page">
      <div class="container">
        <header class="page-header">
          <h1>Annonces de logements</h1>
          <p>Consultez les annonces disponibles et leurs détails.</p>
        </header>

        <section class="filters" aria-label="Filtres annonces">
          <mat-form-field appearance="outline">
            <mat-label>Ville</mat-label>
            <input matInput [(ngModel)]="cityFilter" (ngModelChange)="applyFilters()" />
          </mat-form-field>
          <button mat-button type="button" (click)="clearFilters()">Effacer</button>
        </section>

        @if (loading) {
          <div class="loading">
            <mat-progress-spinner diameter="44" mode="indeterminate"></mat-progress-spinner>
            <span>Chargement des annonces...</span>
          </div>
        } @else if (filteredAds.length === 0) {
          <div class="empty">Aucune annonce active pour le moment.</div>
        } @else {
          <section class="cards">
            @for (ad of filteredAds; track ad.id) {
              <mat-card class="ad-card">
                <div class="ad-photo-wrapper">
                  <img
                    class="ad-photo"
                    [src]="getPrimaryPhoto(ad)"
                    [alt]="ad.title"
                    (error)="onImageError($event)"
                  />
                  <span class="status" [class.inactive]="!ad.isActive">
                    {{ ad.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </div>
                <mat-card-content>
                  <h2 class="ad-title">{{ ad.title }}</h2>
                  <p class="ad-meta">
                    <span>{{ getFullAddress(ad) }}</span>
                    <span class="dot">•</span>
                    <span>Disponible le {{ ad.availableFrom }}</span>
                  </p>
                  <mat-chip-set class="ad-chips" aria-label="Infos annonce">
                    <mat-chip>{{ ad.monthlyRent }} $ / mois</mat-chip>
                    <mat-chip>Disponible le {{ ad.availableFrom }}</mat-chip>
                    <mat-chip>Vues: {{ ad.views }}</mat-chip>
                  </mat-chip-set>
                  <p class="ad-short" [matTooltip]="ad.shortDescription">
                    {{ ad.shortDescription }}
                  </p>
                </mat-card-content>
                <mat-card-actions>
                  <a mat-raised-button color="primary" [routerLink]="['/ads', ad.id]">
                    Voir la fiche
                  </a>
                  <a mat-button [routerLink]="['/ads', ad.id]">Voir les détails</a>
                </mat-card-actions>
              </mat-card>
            }
          </section>
        }
      </div>
    </main>
  `,
  styles: [
    `
      :host {
        --page-bg: #f7f7f7;
        --ink-strong: #1f2937;
        --ink-soft: #6b7280;
        --card-border: rgba(15, 23, 42, 0.06);
        --card-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
        display: block;
      }

      .page {
        min-height: 100vh;
        padding: 2.5rem 1.5rem 4rem;
        background: var(--page-bg);
        color: var(--ink-strong);
      }

      .container {
        max-width: 1100px;
        margin: 0 auto;
      }

      .page-header {
        margin-bottom: 1.5rem;
      }

      .page-header h1 {
        margin: 0 0 0.5rem;
        font-size: clamp(1.8rem, 2.6vw, 2.4rem);
        font-weight: 600;
      }

      .page-header p {
        margin: 0;
        color: var(--ink-soft);
        font-size: 1rem;
      }

      .filters {
        display: flex;
        gap: 0.75rem;
        align-items: center;
        margin-bottom: 1.75rem;
      }

      .filters mat-form-field {
        width: 220px;
      }

      .loading {
        display: flex;
        align-items: center;
        gap: 1rem;
        color: var(--ink-soft);
      }

      .cards {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 1.5rem;
      }

      @media (max-width: 1024px) {
        .cards {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 700px) {
        .page {
          padding: 2rem 1rem 3rem;
        }

        .filters {
          flex-wrap: wrap;
        }

        .filters mat-form-field {
          width: 100%;
        }

        .cards {
          grid-template-columns: 1fr;
        }
      }

      .ad-card {
        display: flex;
        flex-direction: column;
        height: 100%;
        border: 1px solid var(--card-border);
        border-radius: 14px;
        background: #ffffff;
        box-shadow: var(--card-shadow);
        overflow: hidden;
      }

      .ad-photo-wrapper {
        position: relative;
      }

      .ad-photo {
        width: 100%;
        height: 200px;
        object-fit: cover;
        background: #f1f1f1;
      }

      .status {
        position: absolute;
        top: 12px;
        left: 12px;
        padding: 4px 10px;
        border-radius: 999px;
        background: rgba(15, 23, 42, 0.72);
        color: #fff;
        font-size: 0.72rem;
        letter-spacing: 0.02em;
      }

      .status.inactive {
        background: rgba(107, 114, 128, 0.78);
      }

      mat-card-content {
        padding: 1rem 1.25rem 0;
      }

      mat-card-actions {
        padding: 0.75rem 1.25rem 1.25rem;
        display: flex;
        gap: 0.5rem;
        align-items: center;
      }

      .ad-title {
        margin: 0.4rem 0 0.35rem;
        font-size: 1.1rem;
        font-weight: 600;
      }

      .ad-meta {
        margin: 0 0 0.7rem;
        color: var(--ink-soft);
        font-size: 0.92rem;
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem;
        align-items: center;
      }

      .ad-meta .dot {
        color: #d1d5db;
      }

      .ad-chips {
        margin-bottom: 0.6rem;
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
      }

      .ad-chips mat-chip {
        font-size: 0.78rem;
        background: #f3f4f6;
        color: #4b5563;
        border: 1px solid #e5e7eb;
        height: 28px;
      }

      .ad-short {
        margin: 0.6rem 0 0.5rem;
        color: var(--ink-soft);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      mat-card-actions a[mat-raised-button] {
        border-radius: 10px;
        text-transform: none;
        font-weight: 600;
      }
    `
  ]
})
export class AdsListComponent implements OnInit {
  private readonly adService = inject(AdService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  ads: Ad[] = [];
  filteredAds: Ad[] = [];
  cityFilter = '';
  loading = true;

  ngOnInit(): void {
    this.loadAds();

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event) => {
        const navigation = event as NavigationEnd;
        if (navigation.urlAfterRedirects === '/') {
          this.loadAds();
        }
      });
  }

  private loadAds(): void {
    this.ads = this.adService.getAll().filter((ad) => ad.isActive);
    this.applyFilters();
    this.loading = false;
  }

  applyFilters(): void {
    const cityQuery = this.cityFilter.trim().toLowerCase();

    this.filteredAds = this.ads.filter((ad) => {
      const city = this.getCityForFilter(ad);

      const cityMatches = cityQuery ? city.includes(cityQuery) : true;
      return cityMatches;
    });
  }

  clearFilters(): void {
    this.cityFilter = '';
    this.applyFilters();
  }

  getFullAddress(ad: Ad): string {
    const street = ad.street ?? ad.streetAddress ?? '';
    const city = ad.city ?? '';
    const postalCode = ad.postalCode ?? '';
    const composed = [street, city, postalCode].filter((item) => item.trim().length > 0).join(', ');
    return composed || ad.locationAddress;
  }

  getPrimaryPhoto(ad: Ad): string {
    if (ad.photos.length > 0) {
      return ad.photos[0];
    }

    return PLACEHOLDER_PHOTO;
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement | null;
    if (target) {
      target.src = PLACEHOLDER_PHOTO;
    }
  }

  private getCityForFilter(ad: Ad): string {
    if (ad.city) {
      return ad.city.toLowerCase();
    }

    const fallback = this.getFullAddress(ad).toLowerCase();
    return fallback;
  }
}
