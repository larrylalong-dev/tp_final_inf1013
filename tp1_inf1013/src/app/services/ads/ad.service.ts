import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { Ad } from '../../models/ad.model';
import { getDataSourceConfig } from '../../core/data-source.config';

// Clé utilisée pour stocker les annonces dans le localStorage
const STORAGE_KEY = 'ads';

// Photo affichée quand une annonce n'a pas de photo
const PLACEHOLDER_PHOTO = 'assets/images/placeholder.svg';

const POSTAL_CODE_REGEX = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;

@Injectable({
  providedIn: 'root'
})
export class AdService {
  private readonly platformId = inject(PLATFORM_ID);

  // HttpClient permet de faire des requêtes HTTP (ex: charger un fichier JSON)
  private readonly http = inject(HttpClient);

  // Cache en mémoire pour éviter de relire le localStorage à chaque appel
  private adsCache: Ad[] | null = null;

  // init() est appelé au démarrage de l'application (voir app.config.ts)
  // Si le localStorage est vide, on charge les annonces depuis le fichier JSON
  async init(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      // On ne fait rien côté serveur (SSR)
      this.adsCache = [];
      return;
    }

    const stored = localStorage.getItem(STORAGE_KEY);

    if (this.isApiMode()) {
      try {
        const url = `${this.businessBaseUrl()}/ads`;
        console.log('[AdService.init] Fetching ads from API:', url);
        const apiAds = await firstValueFrom(this.http.get<Ad[]>(url));
        console.log('[AdService.init] Ads loaded from API:', apiAds.length);
        this.adsCache = apiAds.map((ad) => this.normalizeAd(ad));
        this.persist(this.adsCache);
        return;
      } catch (error) {
        // Fallback local pour ne pas casser l'UI si l'API n'est pas encore disponible
        console.error('[AdService.init] Error fetching from API:', error);
      }
    }

    if (stored) {
      // Des annonces existent déjà dans le localStorage → on les utilise
      console.log('[AdService.init] Loading ads from localStorage');
      this.adsCache = this.parseAds(stored);
      console.log('[AdService.init] Loaded from localStorage:', this.adsCache.length, 'ads');
    } else {
      // Première visite : on charge les annonces pré-enregistrées depuis le fichier JSON
      console.log('[AdService.init] No stored ads, loading seed data from assets/mock/ads.json');
      try {
        const seedAds = await firstValueFrom(
          this.http.get<Ad[]>('assets/mock/ads.json')
        );
        // On normalise chaque annonce (photos, adresse…) avant de les sauvegarder
        this.adsCache = seedAds.map((ad) => this.normalizeAd(ad));
        console.log('[AdService.init] Loaded seed ads:', this.adsCache.length);
        this.persist(this.adsCache);
      } catch (error) {
        // Si le fichier JSON est introuvable, on démarre avec une liste vide
        console.error('[AdService.init] Error loading seed ads:', error);
        this.adsCache = [];
      }
    }
  }

  // Retourne toutes les annonces (copie pour éviter les mutations accidentelles)
  getAll(): Ad[] {
    const ads = this.adsCache ?? [];
    return ads.map((ad) => ({ ...ad, photos: [...ad.photos] }));
  }

  // Retourne une annonce par son identifiant
  getById(id: string | number): Ad | undefined {
    return (this.adsCache ?? []).find((ad) => this.matchesId(ad.id, id));
  }

  // Retourne les annonces d'un propriétaire donné
  getMine(ownerId: string): Ad[] {
    return (this.adsCache ?? []).filter((ad) => ad.ownerId === ownerId);
  }

  // Crée une nouvelle annonce et la sauvegarde dans le localStorage
  create(ad: Ad): Ad {
    const ads = this.adsCache ?? [];
    const normalized = this.normalizeAd(ad);
    ads.push(normalized);
    this.persist(ads);
    if (this.isApiMode()) {
      const url = `${this.businessBaseUrl()}/ads`;
      console.log('[AdService.create] Posting ad to:', url, normalized);
      this.http
        .post(`${url}`, normalized, this.withAuthIfAvailable())
        .subscribe({
          next: (response) => {
            console.log('[AdService.create] Success:', response);
          },
          error: (error) => {
            console.error('[AdService.create] Error:', error);
          }
        });
    }
    return normalized;
  }

  // Met à jour une annonce existante dans le localStorage
  update(ad: Ad): Ad {
    const ads = this.adsCache ?? [];
    const normalized = this.normalizeAd(ad);
    const index = ads.findIndex((item) => item.id === normalized.id);

    if (index === -1) {
      ads.push(normalized);
    } else {
      ads[index] = normalized;
    }

    this.persist(ads);
    if (this.isApiMode()) {
      const url = `${this.businessBaseUrl()}/ads/${encodeURIComponent(String(normalized.id))}`;
      console.log('[AdService.update] Putting ad to:', url, normalized);
      this.http
        .put(url, normalized, this.withAuthIfAvailable())
        .subscribe({
          next: (response) => {
            console.log('[AdService.update] Success:', response);
          },
          error: (error) => {
            console.error('[AdService.update] Error:', error);
          }
        });
    }
    return normalized;
  }

  // Supprime une annonce du localStorage
  delete(id: string | number): void {
    const ads = this.adsCache ?? [];
    const next = ads.filter((item) => !this.matchesId(item.id, id));
    this.persist(next);
    if (this.isApiMode()) {
      const url = `${this.businessBaseUrl()}/ads/${encodeURIComponent(String(id))}`;
      console.log('[AdService.delete] Deleting ad at:', url);
      this.http
        .delete(url, this.withAuthIfAvailable())
        .subscribe({
          next: (response) => {
            console.log('[AdService.delete] Success:', response);
          },
          error: (error) => {
            console.error('[AdService.delete] Error:', error);
          }
        });
    }
  }

  // Active ou désactive une annonce
  toggleActive(id: string | number): void {
    const ads = this.adsCache ?? [];
    const ad = ads.find((item) => this.matchesId(item.id, id));
    if (!ad) return;
    ad.isActive = !ad.isActive;
    this.persist(ads);
    if (this.isApiMode()) {
      const url = `${this.businessBaseUrl()}/ads/${encodeURIComponent(String(id))}/active`;
      console.log('[AdService.toggleActive] Patching ad at:', url, { isActive: ad.isActive });
      this.http
        .patch(url, { isActive: ad.isActive }, this.withAuthIfAvailable())
        .subscribe({
          next: (response) => {
            console.log('[AdService.toggleActive] Success:', response);
          },
          error: (error) => {
            console.error('[AdService.toggleActive] Error:', error);
          }
        });
    }
  }

  // Incrémente le compteur de vues d'une annonce
  incrementViews(id: string | number): void {
    const ads = this.adsCache ?? [];
    const ad = ads.find((item) => this.matchesId(item.id, id));
    if (!ad) return;
    ad.views += 1;
    this.persist(ads);
    if (this.isApiMode()) {
      const url = `${this.businessBaseUrl()}/ads/${encodeURIComponent(String(id))}/views`;
      console.log('[AdService.incrementViews] Posting views to:', url);
      this.http
        .post(url, {}, this.withAuthIfAvailable())
        .subscribe({
          next: (response) => {
            console.log('[AdService.incrementViews] Success:', response);
          },
          error: (error) => {
            console.error('[AdService.incrementViews] Error:', error);
          }
        });
    }
  }

  // Sauvegarde la liste dans le cache mémoire ET dans le localStorage
  private persist(ads: Ad[]): void {
    this.adsCache = ads;
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ads));
  }

  // Lit et parse les annonces stockées en JSON
  private parseAds(value: string): Ad[] {
    try {
      const parsed = JSON.parse(value) as Ad[];
      return parsed.map((ad) => this.normalizeAd(ad));
    } catch {
      return [];
    }
  }

  // S'assure que tous les champs d'une annonce sont valides et cohérents
  private normalizeAd(ad: Ad): Ad {
    const photos =
      Array.isArray(ad.photos) && ad.photos.length > 0
        ? ad.photos
        : [PLACEHOLDER_PHOTO];

    const legacyStreet = ad.streetAddress ?? '';
    const locationAddress = ad.locationAddress ?? '';
    const parsed = this.parseLocationAddress(locationAddress);

    const street = (ad.street ?? legacyStreet ?? '').trim() || parsed.street;
    const city = (ad.city ?? '').trim() || parsed.city;
    const postalCode = (ad.postalCode ?? '').trim() || parsed.postalCode;
    const computedAddress =
      this.buildLocationAddress(street, city, postalCode) || locationAddress;

    return {
      ...ad,
      photos,
      street: street || legacyStreet || locationAddress || '',
      city,
      postalCode,
      locationAddress: computedAddress
    };
  }

  // Décompose une adresse en rue, ville et code postal
  private parseLocationAddress(value: string): {
    street: string;
    city: string;
    postalCode: string;
  } {
    const trimmed = value.trim();
    if (!trimmed) return { street: '', city: '', postalCode: '' };

    const postalMatch = trimmed.match(POSTAL_CODE_REGEX);
    const postalCode = postalMatch ? postalMatch[0] : '';
    const withoutPostal = postalCode
      ? trimmed.replace(postalCode, '').trim()
      : trimmed;

    const parts = trimmed
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const street = parts[0] ?? '';
    const second = parts[1] ?? '';

    if (parts.length >= 3) return { street, city: second, postalCode: parts[2] };

    if (parts.length === 2) {
      if (POSTAL_CODE_REGEX.test(second))
        return { street, city: '', postalCode: second };
      return { street, city: second, postalCode: '' };
    }

    if (postalCode) {
      const tokens = withoutPostal.split(' ').filter((t) => t.length > 0);
      if (tokens.length >= 2) {
        const cityToken = tokens[tokens.length - 1];
        const streetTokens = tokens.slice(0, -1);
        return { street: streetTokens.join(' '), city: cityToken, postalCode };
      }
      return { street: withoutPostal, city: '', postalCode };
    }

    return { street: withoutPostal, city: '', postalCode: '' };
  }

  // Reconstruit l'adresse complète à partir de ses composantes
  private buildLocationAddress(
    street: string,
    city: string,
    postalCode: string
  ): string {
    return [street, city, postalCode]
      .filter((item) => item.trim().length > 0)
      .join(', ');
  }

  // Compare deux identifiants en les convertissant en chaîne de caractères
  private matchesId(a: string | number, b: string | number): boolean {
    return String(a) === String(b);
  }

  private isApiMode(): boolean {
    return getDataSourceConfig().ads === 'api';
  }

  private businessBaseUrl(): string {
    return getDataSourceConfig().api.businessBaseUrl.replace(/\/$/, '');
  }

  private withAuthIfAvailable(): { headers?: HttpHeaders } {
    if (!isPlatformBrowser(this.platformId)) {
      return {};
    }

    const token = localStorage.getItem('auth_token');
    if (!token) {
      return {};
    }

    return {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
    };
  }
}
