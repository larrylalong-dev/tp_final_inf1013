import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Ad } from '../../models/ad.model';
import { AdService } from '../../services/ads/ad.service';
import { AuthService } from '../../services/auth/auth.service';
import { MessageService } from '../../services/messages/message.service';
import {
  ContactDialogComponent,
  ContactDialogResult
} from '../../components/contact-dialog/contact-dialog.component';

@Component({
  selector: 'app-ad-details',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <main class="page">
      @if (ad && (ad.isActive || isOwner)) {
        <div class="details-container">
          <header class="details-header">
            <div class="title-block">
              <h1>{{ ad.title }}</h1>
              <p class="address">{{ fullAddress || 'Adresse indisponible' }}</p>
            </div>
            <mat-chip-set class="meta-chips" aria-label="Infos annonce">
              <mat-chip>{{ ad.monthlyRent }} $ / mois</mat-chip>
              <mat-chip>Disponible le {{ ad.availableFrom }}</mat-chip>
              <mat-chip>Vues: {{ ad.views }}</mat-chip>
              @if (!ad.isActive) {
                <mat-chip color="warn" selected>Inactive</mat-chip>
              }
            </mat-chip-set>
          </header>

          <section class="details-grid">
            <div class="left-col">
              <section class="gallery">
                <div class="hero-wrapper">
                  <img
                    class="hero"
                    [src]="selectedPhoto"
                    [alt]="ad.title"
                    (error)="onImageError($event)"
                  />
                </div>
                @if (getPhotos(ad).length > 1) {
                  <div class="thumbs">
                    @for (photo of getPhotos(ad); track photo) {
                      <button type="button" class="thumb" (click)="selectPhoto(photo)">
                        <img [src]="photo" [alt]="ad.title" (error)="onImageError($event)" />
                      </button>
                    }
                  </div>
                }
              </section>

              <mat-divider></mat-divider>

              <section class="section">
                <h2>Description</h2>
                <p class="section-text">{{ ad.longDescription }}</p>
              </section>

              <mat-divider></mat-divider>

              <section class="section">
                <div class="section-header">
                  <h2>Localisation</h2>
                  @if (mapUrlSafe) {
                    <button
                      mat-stroked-button
                      color="primary"
                      type="button"
                      (click)="toggleMap()"
                    >
                      {{ showMap ? 'Masquer la carte' : 'Afficher la carte' }}
                    </button>
                  }
                </div>
                <p class="section-text">
                  {{ fullAddress || 'Adresse indisponible' }}
                </p>
                @if (showMap && mapUrlSafe) {
                  <mat-card class="map-card">
                    <div class="map-wrapper">
                      <iframe
                        class="map-frame"
                        [src]="mapUrlSafe"
                        title="Carte"
                        loading="lazy"
                        referrerpolicy="no-referrer-when-downgrade"
                      ></iframe>
                    </div>
                  </mat-card>
                }
              </section>
            </div>

            <aside class="right-col">
              <mat-card class="cta-card">
                <mat-card-content>
                  <div class="price">{{ ad.monthlyRent }} $ / mois</div>
                  <div class="cta-meta">
                    <span>Disponible le {{ ad.availableFrom }}</span>
                    <span>Vues: {{ ad.views }}</span>
                  </div>
                  @if (!ad.isActive) {
                    <div class="cta-status">Annonce inactive</div>
                  }
                </mat-card-content>
                <mat-card-actions class="cta-actions">
                  <button mat-raised-button color="primary" type="button" (click)="onContact()">
                    Contacter
                  </button>
                  <a mat-button routerLink="/">Retour</a>
                </mat-card-actions>
              </mat-card>
            </aside>
          </section>
        </div>
      } @else {
        <div class="not-found">
          <h1>Annonce desactivee</h1>
          <p>Cette annonce n'est pas disponible pour le moment.</p>
          <a mat-button color="primary" routerLink="/">Retour aux annonces</a>
        </div>
      }
    </main>
  `,
  styles: [
    `
      .page {
        padding: 1.5rem 1rem 3rem;
        background: #f7f7f7;
      }

      .details-container {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .details-header {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .title-block h1 {
        margin: 0 0 0.25rem;
        font-size: clamp(1.9rem, 2.4vw, 2.6rem);
        font-weight: 600;
      }

      .address {
        margin: 0;
        color: #5f6b7a;
        font-size: 1rem;
      }

      .meta-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .details-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 360px;
        gap: 1.75rem;
        align-items: start;
      }

      .left-col {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .gallery {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .hero-wrapper {
        border-radius: 16px;
        overflow: hidden;
        background: #f1f1f1;
        border: 1px solid #e1e5ea;
      }

      .hero {
        width: 100%;
        aspect-ratio: 16 / 9;
        object-fit: cover;
        display: block;
      }

      .thumbs {
        display: flex;
        gap: 0.5rem;
        overflow-x: auto;
        padding-bottom: 0.25rem;
      }

      .thumb {
        border: 1px solid #e0e0e0;
        padding: 0;
        border-radius: 10px;
        overflow: hidden;
        background: #ffffff;
        cursor: pointer;
        transition: transform 0.15s ease;
      }

      .thumb:hover {
        transform: translateY(-2px);
      }

      .thumb img {
        width: 84px;
        height: 64px;
        object-fit: cover;
        display: block;
      }

      .section {
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
      }

      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .section-text {
        margin: 0;
        color: #3a4653;
        line-height: 1.6;
      }

      .right-col {
        position: sticky;
        top: 88px;
      }

      .cta-card {
        border-radius: 16px;
        border: 1px solid #e3e7ee;
        box-shadow: 0 12px 30px rgba(15, 23, 42, 0.12);
      }

      .price {
        font-size: 1.6rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
      }

      .cta-meta {
        display: grid;
        gap: 0.35rem;
        color: #5f6b7a;
        font-size: 0.95rem;
        margin-bottom: 0.75rem;
      }

      .cta-status {
        font-size: 0.85rem;
        font-weight: 600;
        color: #a52a2a;
      }

      .cta-actions {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 0 1rem 1rem;
      }

      .map-card {
        border-radius: 16px;
        overflow: hidden;
        border: 1px solid #e3e7ee;
        box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
      }

      .map-wrapper {
        width: 100%;
        border-radius: 16px;
        overflow: hidden;
      }

      .map-frame {
        width: 100%;
        height: 340px;
        border: 0;
        display: block;
      }

      .not-found {
        text-align: center;
        padding: 2.5rem 1rem;
      }

      @media (max-width: 1024px) {
        .details-grid {
          grid-template-columns: minmax(0, 1fr) 300px;
        }

        .right-col {
          top: 72px;
        }
      }

      @media (max-width: 860px) {
        .details-grid {
          grid-template-columns: 1fr;
        }

        .right-col {
          position: static;
        }

        .cta-actions {
          flex-direction: row;
          flex-wrap: wrap;
        }

        .map-frame {
          height: 280px;
        }
      }
    `
  ]
})
export class AdDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly adService = inject(AdService);
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);
  private readonly sanitizer = inject(DomSanitizer);
  ad?: Ad;
  isOwner = false;
  selectedPhoto = 'assets/images/placeholder.svg';
  fullAddress = '';
  mapUrlSafe: SafeResourceUrl | null = null;
  showMap = false;

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = params.get('id');
      this.ad = id ? this.adService.getById(id) : undefined;

      const currentUser = this.authService.currentUser();
      this.isOwner = Boolean(currentUser && this.ad && this.ad.ownerId === currentUser.id);

      if (id && this.ad && this.ad.isActive) {
        this.adService.incrementViews(id);
        this.ad = this.adService.getById(id);
      }

      if (this.ad) {
        this.selectedPhoto = this.getPhotos(this.ad)[0];
        this.fullAddress = this.getFullAddress(this.ad).trim();
        this.mapUrlSafe = this.fullAddress
          ? this.sanitizer.bypassSecurityTrustResourceUrl(this.buildMapEmbedUrl(this.fullAddress))
          : null;
        this.showMap = false;
      }
    });
  }

  getPhotos(ad: Ad): string[] {
    if (ad.photos.length > 0) {
      return ad.photos;
    }

    return ['assets/images/placeholder.svg'];
  }

  onContact(): void {
    if (!this.ad) {
      return;
    }

    if (!this.authService.isLoggedIn()) {
      this.snackBar.open('Connectez-vous pour contacter.', 'Fermer', { duration: 2500 });
      void this.router.navigate(['/login'], {
        queryParams: { returnUrl: this.router.url }
      });
      return;
    }

    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      this.snackBar.open('Connexion requise.', 'Fermer', { duration: 2500 });
      return;
    }

    const dialogRef = this.dialog.open(ContactDialogComponent, {
      data: { adTitle: this.ad.title }
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result: ContactDialogResult | undefined) => {
        if (!result) {
          return;
        }

        this.messageService.sendMessage({
          adId: this.ad?.id ?? '',
          ownerId: this.ad?.ownerId ?? '',
          fromUserId: currentUser.id,
          subject: result.subject,
          body: result.body
        });

        this.snackBar.open('Message envoye.', 'Fermer', { duration: 2500 });
      });
  }

  selectPhoto(photo: string): void {
    this.selectedPhoto = photo;
  }

  toggleMap(): void {
    if (!this.mapUrlSafe) {
      return;
    }

    this.showMap = !this.showMap;
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement | null;
    if (target) {
      target.src = 'assets/images/placeholder.svg';
    }
  }

  getFullAddress(ad: Ad): string {
    const street = ad.street ?? ad.streetAddress ?? '';
    const city = ad.city ?? '';
    const postalCode = ad.postalCode ?? '';
    const composed = [street, city, postalCode].filter((item) => item.trim().length > 0).join(', ');
    return composed || ad.locationAddress;
  }

  private buildMapEmbedUrl(address: string): string {
    return `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
  }
}
