import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-register',
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
          <h1>Inscription</h1>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <div class="grid">
              <mat-form-field appearance="outline">
                <mat-label>Prenom</mat-label>
                <input matInput formControlName="firstName" placeholder="Amine" />
                @if (form.controls.firstName.touched && form.controls.firstName.invalid) {
                  <mat-error>Prenom requis</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Nom</mat-label>
                <input matInput formControlName="lastName" placeholder="Benali" />
                @if (form.controls.lastName.touched && form.controls.lastName.invalid) {
                  <mat-error>Nom requis</mat-error>
                }
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline">
              <mat-label>Telephone</mat-label>
              <input matInput formControlName="phone" placeholder="514 000 0000" />
              <mat-hint>Format libre, chiffres et espaces</mat-hint>
              @if (form.controls.phone.touched && form.controls.phone.invalid) {
                <mat-error>Telephone invalide</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" autocomplete="email" placeholder="nom@exemple.com" />
              @if (form.controls.email.touched && form.controls.email.invalid) {
                <mat-error>Email requis</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Adresse</mat-label>
              <input matInput formControlName="address" placeholder="123 rue Principale" />
              @if (form.controls.address.touched && form.controls.address.invalid) {
                <mat-error>Adresse requise</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Mot de passe</mat-label>
              <input matInput type="password" formControlName="password" autocomplete="new-password" />
              @if (form.controls.password.touched && form.controls.password.invalid) {
                <mat-error>Minimum 4 caracteres</mat-error>
              }
            </mat-form-field>

            @if (errorMessage) {
              <p class="error">{{ errorMessage }}</p>
            }

            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
              Creer un compte
            </button>
          </form>
        </mat-card-content>
        <mat-card-actions>
          <a mat-button routerLink="/login">Deja inscrit ? Se connecter</a>
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
        margin: 0;
      }
    `
  ]
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  errorMessage = '';

  form = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9+()\s-]{7,}$/)]],
    email: ['', [Validators.required, Validators.email]],
    address: ['', [Validators.required, Validators.minLength(4)]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      firstName: this.form.controls.firstName.value ?? '',
      lastName: this.form.controls.lastName.value ?? '',
      phone: this.form.controls.phone.value ?? '',
      email: this.form.controls.email.value ?? '',
      address: this.form.controls.address.value ?? '',
      password: this.form.controls.password.value ?? ''
    };

    const result = await this.authService.register(payload);
    if (!result.ok) {
      this.errorMessage = result.message ?? 'Inscription impossible.';
      return;
    }

    this.snackBar.open('Inscription reussie.', 'Fermer', { duration: 2000 });
    void this.router.navigateByUrl('/');
  }
}
