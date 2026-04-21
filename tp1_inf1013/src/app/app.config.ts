import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { AdService } from './services/ads/ad.service';
import { AuthService } from './services/auth/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // withFetch() améliore les performances SSR en utilisant l'API fetch native
    provideHttpClient(withFetch()),
    // Au démarrage : on charge les utilisateurs ET les annonces depuis les fichiers JSON
    // si le localStorage est encore vide (première visite).
    // IMPORTANT : inject() doit être appelé de façon synchrone AVANT tout await,
    // sinon Angular perd le contexte d'injection (erreur NG0203).
    provideAppInitializer(() => {
      const authService = inject(AuthService);
      const adService = inject(AdService);
      return authService.init().then(() => adService.init());
    }),
    provideClientHydration(withEventReplay()),
    provideAnimations()
  ]
};
