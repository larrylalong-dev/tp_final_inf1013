import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { Message } from '../../models/message.model';
import { User } from '../../models/user.model';
import { MessageService } from '../../services/messages/message.service';
import { AuthService } from '../../services/auth/auth.service';

export interface AdMessagesDialogData {
  adId: string | number;
  title: string;
}

@Component({
  selector: 'app-ad-messages-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatCardModule],
  template: `
    <h2 mat-dialog-title>Messages pour l'annonce</h2>
    <div mat-dialog-content class="dialog-content">
      <p class="subtitle">{{ data.title }}</p>

      @if (messages.length === 0) {
        <p class="empty">Aucun message pour cette annonce.</p>
      } @else {
        <div class="messages">
          @for (msg of messages; track msg.id) {
            <mat-card class="message-card">
              <mat-card-content>
                <div class="header">
                  <h3>{{ msg.subject }}</h3>
                  <span class="date">{{ msg.createdAt | date: 'short' }}</span>
                </div>
                <div class="body">{{ msg.body }}</div>

                <div class="sender">
                  <h4>Expediteur</h4>
                  @if (getSenderProfile(msg.fromUserId); as sender) {
                    <div class="sender-grid">
                      <span>{{ sender.firstName }} {{ sender.lastName }}</span>
                      <span>{{ sender.phone }}</span>
                      <span>{{ sender.email }}</span>
                      <span>{{ sender.address }}</span>
                    </div>
                  } @else {
                    <span class="unknown">Expediteur inconnu (compte supprime).</span>
                  }
                </div>

                <div class="mail-sim">
                  <h4>Reponse par mail (simulation)</h4>
                  @if (getOwnerProfile(msg.ownerId); as owner) {
                    <div class="mail-grid">
                      <span>Destinataire (annonceur): {{ owner.email }}</span>
                      @if (getSenderProfile(msg.fromUserId); as sender) {
                        <span>Expediteur: {{ sender.email }} — {{ sender.phone }}</span>
                      } @else {
                        <span>Expediteur: profil indisponible</span>
                      }
                      <span>Sujet: {{ msg.subject }}</span>
                      <span>Message: {{ msg.body }}</span>
                    </div>
                    <p class="mail-note">
                      Simulation: un email serait envoye au destinataire avec ces informations.
                    </p>
                  } @else {
                    <span class="unknown">Destinataire indisponible.</span>
                  }
                </div>
              </mat-card-content>
            </mat-card>
          }
        </div>
      }
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Fermer</button>
    </div>
  `,
  styles: [
    `
      .subtitle {
        margin: 0 0 1rem;
        color: #555;
      }

      .dialog-content {
        max-height: 60vh;
        overflow: auto;
      }

      .empty {
        color: #666;
        margin: 0;
        padding: 0.5rem 0 1rem;
      }

      .messages {
        display: grid;
        gap: 1rem;
      }

      .message-card {
        border: 1px solid #eceff3;
      }

      .header {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem 1rem;
        align-items: baseline;
        justify-content: space-between;
      }

      .header h3 {
        margin: 0;
        font-size: 1.05rem;
      }

      .date {
        color: #666;
        font-size: 0.85rem;
      }

      .body {
        color: #333;
        white-space: pre-wrap;
        margin: 0.75rem 0 1rem;
      }

      .sender h4 {
        margin: 0 0 0.5rem;
        font-size: 0.95rem;
      }

      .sender-grid {
        display: grid;
        gap: 0.25rem;
        color: #444;
      }

      .mail-sim {
        margin-top: 1rem;
        padding-top: 0.75rem;
        border-top: 1px dashed #e0e3e8;
      }

      .mail-sim h4 {
        margin: 0 0 0.5rem;
        font-size: 0.95rem;
      }

      .mail-grid {
        display: grid;
        gap: 0.35rem;
        color: #333;
      }

      .mail-note {
        margin: 0.5rem 0 0;
        color: #666;
        font-size: 0.9rem;
      }

      .unknown {
        color: #666;
      }
    `
  ]
})
export class AdMessagesDialogComponent {
  private readonly messageService = inject(MessageService);
  private readonly authService = inject(AuthService);
  readonly data = inject<AdMessagesDialogData>(MAT_DIALOG_DATA);
  readonly messages: Message[] = this.messageService.getMessagesForAd(this.data.adId);

  getSenderProfile(userId: string): User | null {
    return this.authService.getUserById(userId);
  }

  getOwnerProfile(userId: string): User | null {
    return this.authService.getUserById(userId);
  }
}
