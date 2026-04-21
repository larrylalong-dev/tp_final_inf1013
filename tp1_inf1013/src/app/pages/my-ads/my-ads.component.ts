import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { Ad } from '../../models/ad.model';
import { User } from '../../models/user.model';
import { AdService } from '../../services/ads/ad.service';
import { AuthService } from '../../services/auth/auth.service';
import { MessageService } from '../../services/messages/message.service';
import {
  AdMessagesDialogComponent,
  AdMessagesDialogData
} from '../../components/ad-messages-dialog/ad-messages-dialog.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogData
} from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-my-ads',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatSlideToggleModule
  ],
  template: `
    <main class="page">
      <header class="page-header">
        <div>
          <h1>Mes annonces</h1>
          <p>Gerez vos annonces et consultez les messages recus.</p>
        </div>
        <a mat-raised-button color="primary" routerLink="/my-ads/new">Nouvelle annonce</a>
      </header>

      @if (!currentUser) {
        <p class="empty">Aucun utilisateur connecte.</p>
      } @else if (ads.length === 0) {
        <p class="empty">Vous n'avez pas encore d'annonces.</p>
      } @else {
        <section class="cards">
          @for (ad of ads; track ad.id) {
            <mat-card class="ad-card">
              <mat-card-content>
                <h2>{{ ad.title }}</h2>
                <div class="meta">
                  <span>{{ ad.monthlyRent }} $ / mois</span>
                  <span>Disponible le : {{ ad.availableFrom | date: 'longDate' }}</span>
                  <span>Vues: {{ ad.views }}</span>
                  <span>Messages: {{ getMessageCount(ad.id) }}</span>
                  <span class="status" [class.inactive]="!ad.isActive">
                    {{ ad.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </div>
                <p>{{ ad.shortDescription }}</p>
              </mat-card-content>
              <mat-card-actions>
                <a mat-button [routerLink]="['/my-ads', ad.id, 'edit']">Modifier</a>
                <button mat-stroked-button color="primary" type="button" (click)="openMessages(ad)">
                  Voir messages ({{ getMessageCount(ad.id) }})
                </button>
                <button mat-stroked-button color="warn" type="button" (click)="onDelete(ad)">
                  Supprimer
                </button>
                <mat-slide-toggle
                  color="primary"
                  [checked]="ad.isActive"
                  (change)="onToggle(ad)"
                >
                  {{ ad.isActive ? 'Active' : 'Inactive' }}
                </mat-slide-toggle>
              </mat-card-actions>
            </mat-card>
          }
        </section>
      }
    </main>
  `,
  styles: [
    `
      .page {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .page-header {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        align-items: center;
        justify-content: space-between;
      }

      .page-header h1 {
        margin: 0 0 0.25rem;
      }

      .page-header p {
        margin: 0;
        color: #555;
      }

      .cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 1rem;
      }

      .ad-card h2 {
        margin: 0 0 0.5rem;
      }

      mat-card-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        align-items: center;
      }

      .meta {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem 1rem;
        color: #555;
        font-size: 0.9rem;
        margin-bottom: 0.75rem;
      }

      .status.inactive {
        color: #9e2a2b;
      }

      .status {
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.4px;
        font-size: 0.75rem;
      }

      .empty {
        color: #666;
      }
    `
  ]
})
export class MyAdsComponent implements OnInit {
  private readonly adService = inject(AdService);
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);
  private readonly dialog = inject(MatDialog);

  currentUser: User | null = null;
  ads: Ad[] = [];

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser();

    if (this.currentUser) {
      this.ads = this.adService.getMine(this.currentUser.id);
    }
  }

  getMessageCount(adId: string | number): number {
    return this.messageService.countMessagesForAd(adId);
  }

  onToggle(ad: Ad): void {
    if (!ad.isActive) {
      this.adService.toggleActive(ad.id);
      this.refreshAds();
      return;
    }

    const data: ConfirmDialogData = {
      title: 'Confirmer la desactivation',
      message: 'Cette annonce ne sera plus visible publiquement.',
      confirmText: 'Desactiver'
    };

    this.dialog
      .open(ConfirmDialogComponent, { data })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.adService.toggleActive(ad.id);
          this.refreshAds();
        }
      });
  }

  openMessages(ad: Ad): void {
    const data: AdMessagesDialogData = {
      adId: ad.id,
      title: ad.title
    };

    this.dialog.open(AdMessagesDialogComponent, {
      data,
      width: '700px',
      maxWidth: '95vw'
    });
  }

  onDelete(ad: Ad): void {
    const data: ConfirmDialogData = {
      title: 'Confirmer la suppression',
      message: `L'annonce "${ad.title}" sera supprimee definitivement.`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    };

    this.dialog
      .open(ConfirmDialogComponent, { data })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.adService.delete(ad.id);
          this.refreshAds();
        }
      });
  }

  private refreshAds(): void {
    if (this.currentUser) {
      this.ads = this.adService.getMine(this.currentUser.id);
    }
  }
}
