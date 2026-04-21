import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface ContactDialogData {
  adTitle: string;
}

export interface ContactDialogResult {
  subject: string;
  body: string;
}

@Component({
  selector: 'app-contact-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <h2 mat-dialog-title>Contacter l'annonceur</h2>
    <div mat-dialog-content>
      <p class="subtitle">Annonce: {{ data.adTitle }}</p>
      <form [formGroup]="form">
        <mat-form-field appearance="outline">
          <mat-label>Objet</mat-label>
          <input matInput formControlName="subject" />
          @if (form.controls.subject.touched && form.controls.subject.invalid) {
            <mat-error>Objet requis (min 3 caracteres)</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Message</mat-label>
          <textarea matInput rows="5" formControlName="body"></textarea>
          @if (form.controls.body.touched && form.controls.body.invalid) {
            <mat-error>Message requis (min 10 caracteres)</mat-error>
          }
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button type="button" (click)="onCancel()">Annuler</button>
      <button mat-raised-button color="primary" type="button" (click)="onSubmit()" [disabled]="form.invalid">
        Envoyer
      </button>
    </div>
  `,
  styles: [
    `
      form {
        display: grid;
        gap: 1rem;
        margin-top: 1rem;
      }

      .subtitle {
        margin: 0;
        color: #555;
      }
    `
  ]
})
export class ContactDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ContactDialogComponent, ContactDialogResult>);
  readonly data = inject<ContactDialogData>(MAT_DIALOG_DATA);

  form = this.fb.group({
    subject: ['', [Validators.required, Validators.minLength(3)]],
    body: ['', [Validators.required, Validators.minLength(10)]]
  });

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.dialogRef.close({
      subject: value.subject ?? '',
      body: value.body ?? ''
    });
  }
}
