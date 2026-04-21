import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatCardModule],
  template: `
    <main class="page">
      <mat-card class="not-found-card">
        <h1>404 - Page introuvable</h1>
        <p>La page demandee n'existe pas ou a ete deplacee.</p>
        <a mat-raised-button color="primary" routerLink="/">Retour accueil</a>
      </mat-card>
    </main>
  `,
  styles: [
    `
      .page {
        min-height: 60vh;
        display: grid;
        place-items: center;
      }

      .not-found-card {
        max-width: 560px;
        width: 100%;
        padding: 1.5rem;
      }

      h1 {
        margin: 0 0 0.5rem;
      }

      p {
        margin: 0 0 1rem;
      }
    `
  ]
})
export class PageNotFoundComponent {}
