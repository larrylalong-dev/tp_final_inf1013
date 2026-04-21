import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatNativeDateModule } from '@angular/material/core';

import { Ad } from '../../models/ad.model';
import { User } from '../../models/user.model';
import { AdService } from '../../services/ads/ad.service';
import { AuthService } from '../../services/auth/auth.service';

const PLACEHOLDER_PHOTO = 'assets/images/placeholder.svg';

@Component({
  selector: 'app-ad-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatNativeDateModule,
    MatSnackBarModule
  ],
  templateUrl: './ad-form.component.html',
  styleUrls: ['./ad-form.component.css']
})
export class AdFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly snackBar = inject(MatSnackBar);
  private readonly adService = inject(AdService);
  private readonly authService = inject(AuthService);

  isEdit = false;
  notFound = false;
  currentUser: User | null = null;
  existingAd: Ad | null = null;

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    shortDescription: ['', [Validators.required, Validators.maxLength(120)]],
    longDescription: ['', [Validators.required, Validators.minLength(20)]],
    monthlyRent: [0, [Validators.required, Validators.min(0)]],
    availableFrom: [null as Date | string | null, [Validators.required]],
    street: ['', [Validators.required, Validators.minLength(4)]],
    city: ['', [Validators.required, Validators.minLength(2)]],
    postalCode: [
      '',
      [Validators.required, Validators.pattern(/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/)]
    ],
    photosText: ['']
  });

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser();

    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = params.get('id');
      this.isEdit = Boolean(id);

      if (!this.isEdit) {
        return;
      }

      const ad = id ? this.adService.getById(id) : undefined;
      if (!ad) {
        this.notFound = true;
        return;
      }

      this.existingAd = ad;
      this.form.patchValue({
        title: ad.title,
        shortDescription: ad.shortDescription,
        longDescription: ad.longDescription,
        monthlyRent: ad.monthlyRent,
        availableFrom: this.toDateForPicker(ad.availableFrom),
        street: ad.street ?? ad.streetAddress ?? '',
        city: ad.city ?? '',
        postalCode: ad.postalCode ?? '',
        photosText: ad.photos.join('\n')
      });
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.currentUser) {
      this.snackBar.open('Utilisateur non connecte.', 'Fermer', { duration: 2500 });
      return;
    }

    const value = this.form.getRawValue();
    const availableFrom = this.toDateString(value.availableFrom);
    const locationAddress = this.buildLocationAddress(
      value.street ?? '',
      value.city ?? '',
      value.postalCode ?? ''
    );
    const photos = this.parsePhotos(value.photosText ?? '');

    if (this.isEdit && this.existingAd) {
      const updated: Ad = {
        ...this.existingAd,
        title: value.title ?? '',
        shortDescription: value.shortDescription ?? '',
        longDescription: value.longDescription ?? '',
        monthlyRent: Number(value.monthlyRent ?? 0),
        availableFrom,
        street: value.street ?? '',
        city: value.city ?? '',
        postalCode: value.postalCode ?? '',
        locationAddress,
        photos
      };

      this.adService.update(updated);
      this.snackBar.open('Annonce mise a jour.', 'Fermer', { duration: 2500 });
      void this.router.navigateByUrl('/my-ads');
      return;
    }

    const created: Ad = {
      id: `ad-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      title: value.title ?? '',
      shortDescription: value.shortDescription ?? '',
      longDescription: value.longDescription ?? '',
      monthlyRent: Number(value.monthlyRent ?? 0),
      availableFrom,
      photos,
      street: value.street ?? '',
      city: value.city ?? '',
      postalCode: value.postalCode ?? '',
      locationAddress,
      ownerId: this.currentUser.id,
      isActive: true,
      views: 0
    };

    this.adService.create(created);
    this.snackBar.open('Annonce creee.', 'Fermer', { duration: 2500 });
    void this.router.navigateByUrl('/my-ads');
  }

  private parsePhotos(input: string): string[] {
    const urls = input
      .split('\n')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    const unique = Array.from(new Set(urls));
    return unique.length > 0 ? unique : [PLACEHOLDER_PHOTO];
  }

  private buildLocationAddress(street: string, city: string, postalCode: string): string {
    return [street, city, postalCode].filter((item) => item.trim().length > 0).join(', ');
  }

  private buildMapUrl(address: string): string {
    if (!address.trim()) {
      return '';
    }

    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }

  canPreviewMap(): boolean {
    const value = this.form.getRawValue();
    return Boolean(
      (value.street ?? '').trim() &&
        (value.city ?? '').trim() &&
        (value.postalCode ?? '').trim() &&
        this.form.controls.postalCode.valid &&
        this.form.controls.street.valid &&
        this.form.controls.city.valid
    );
  }

  getMapPreviewUrl(): string {
    if (!this.canPreviewMap()) {
      return '';
    }

    const value = this.form.getRawValue();
    const address = this.buildLocationAddress(
      value.street ?? '',
      value.city ?? '',
      value.postalCode ?? ''
    );
    return this.buildMapUrl(address);
  }

  private toDateString(value: unknown): string {
    if (!value) {
      return '';
    }

    if (value instanceof Date) {
      return this.formatDate(value);
    }

    if (typeof value === 'string') {
      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? value : this.formatDate(parsed);
    }

    return '';
  }

  private toDateForPicker(value: string): Date | null {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private formatDate(value: Date): string {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
