import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-login',
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
          <h1>Connexion</h1>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" autocomplete="email" placeholder="nom@exemple.com" />
              @if (form.controls.email.touched && form.controls.email.invalid) {
                <mat-error>Email requis</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Mot de passe</mat-label>
              <input matInput type="password" formControlName="password" autocomplete="current-password" />
              @if (form.controls.password.touched && form.controls.password.invalid) {
                <mat-error>Mot de passe requis</mat-error>
              }
            </mat-form-field>

            @if (errorMessage) {
              <p class="error">{{ errorMessage }}</p>
            }

            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
              Se connecter
            </button>
          </form>
        </mat-card-content>
        <mat-card-actions>
          <a mat-button routerLink="/register">Creer un compte</a>
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
        width: min(520px, 100%);
      }

      form {
        display: grid;
        gap: 1rem;
        margin-top: 1rem;
      }

      .error {
        color: #b00020;
        margin: 0;
      }
    `
  ]
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  errorMessage = '';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const email = this.form.controls.email.value ?? '';
    const password = this.form.controls.password.value ?? '';
    const result = await this.authService.login(email, password);

    if (!result.ok) {
      this.errorMessage = result.message ?? 'Connexion impossible.';
      return;
    }

    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';
    this.snackBar.open('Connexion reussie.', 'Fermer', { duration: 2000 });
    void this.router.navigateByUrl(returnUrl);
  }
}
