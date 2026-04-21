import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '../../services/auth/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule
  ],
  template: `
    <main class="page">
      <mat-card class="form-card">
        <mat-card-content>
          <h1>Mon profil</h1>

          @if (!currentUser) {
            <p class="error">Aucun utilisateur connecte.</p>
          } @else {
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <div class="grid">
                <mat-form-field appearance="outline">
                  <mat-label>Prenom</mat-label>
                  <input matInput formControlName="firstName" />
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Nom</mat-label>
                  <input matInput formControlName="lastName" />
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline">
                <mat-label>Telephone</mat-label>
                <input matInput formControlName="phone" placeholder="514 000 0000" />
                <mat-hint>Ex: 514 123 4567</mat-hint>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput formControlName="email" readonly />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Adresse</mat-label>
                <input matInput formControlName="address" placeholder="123 rue Principale" />
              </mat-form-field>

              @if (savedMessage) {
                <p class="success">{{ savedMessage }}</p>
              }

              <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
                Mettre a jour
              </button>
            </form>
          }
        </mat-card-content>
        <mat-card-actions>
          <a mat-button routerLink="/">Retour aux annonces</a>
        </mat-card-actions>
      </mat-card>
    </main>
  `,
  styles: [
    `
      .page {
        display: flex;
        justify-content: center;
        padding: 1rem 0;
      }

      .form-card {
        width: min(720px, 100%);
      }

      form {
        display: grid;
        gap: 1rem;
        margin-top: 1rem;
      }

      .grid {
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      }

      .error {
        color: #b00020;
        margin: 0.5rem 0 0;
      }

      .success {
        color: #2e7d32;
        margin: 0;
      }
    `
  ]
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);

  currentUser: User | null = null;
  savedMessage = '';

  form = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9+()\s-]{7,}$/)]],
    email: [{ value: '', disabled: true }],
    address: ['', [Validators.required, Validators.minLength(4)]]
  });

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser();

    if (this.currentUser) {
      this.form.patchValue({
        firstName: this.currentUser.firstName,
        lastName: this.currentUser.lastName,
        phone: this.currentUser.phone,
        email: this.currentUser.email,
        address: this.currentUser.address
      });
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const updated = await this.authService.updateProfile({
      firstName: value.firstName ?? '',
      lastName: value.lastName ?? '',
      phone: value.phone ?? '',
      address: value.address ?? ''
    });

    if (updated) {
      this.currentUser = updated;
      this.savedMessage = 'Profil mis a jour.';
      this.snackBar.open('Profil mis a jour.', 'Fermer', { duration: 2000 });
    }
  }
}
