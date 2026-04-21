import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { User } from '../../models/user.model';
import { DATA_SOURCE_CONFIG } from '../../core/data-source.config';

// Clé pour stocker la liste des utilisateurs dans le localStorage
const USERS_KEY = 'users';

// Clé pour savoir quel utilisateur est connecté
const CURRENT_USER_KEY = 'current_user';
const CURRENT_USER_SNAPSHOT_KEY = 'current_user_snapshot';
const AUTH_TOKEN_KEY = 'auth_token';

interface AuthResponse {
  accessToken: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);

  // HttpClient pour charger le fichier JSON des utilisateurs
  private readonly http = inject(HttpClient);

  // Cache en mémoire des utilisateurs
  private usersCache: User[] | null = null;

  // Cache de l'identifiant de l'utilisateur connecté
  private currentUserIdCache: string | null = null;
  private currentUserSnapshotCache: User | null = null;
  private authTokenCache: string | null = null;

  private readonly authBaseUrl = DATA_SOURCE_CONFIG.api.authBaseUrl.replace(/\/$/, '');

  // init() est appelé au démarrage (voir app.config.ts)
  // Si aucun utilisateur n'existe dans le localStorage, on charge users.json
  async init(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      this.usersCache = [];
      return;
    }

    if (this.isApiMode()) {
      this.usersCache = [];
      this.authTokenCache = localStorage.getItem(AUTH_TOKEN_KEY);
      this.currentUserSnapshotCache = this.readCurrentUserSnapshot();

      if (this.authTokenCache && !this.currentUserSnapshotCache) {
        await this.refreshCurrentUserFromApi();
      }

      return;
    }

    const stored = localStorage.getItem(USERS_KEY);

    if (stored) {
      // Des utilisateurs existent déjà → on les charge depuis le localStorage
      try {
        this.usersCache = JSON.parse(stored) as User[];
      } catch {
        this.usersCache = [];
      }
    } else {
      // Première visite : on charge les utilisateurs pré-enregistrés depuis le fichier JSON
      try {
        const seedUsers = await firstValueFrom(
          this.http.get<User[]>('assets/mock/users.json')
        );
        this.usersCache = seedUsers;
        // On sauvegarde les utilisateurs dans le localStorage pour les prochaines visites
        this.saveUsers(seedUsers);
      } catch {
        // Si le fichier JSON est introuvable, on démarre sans utilisateurs
        this.usersCache = [];
      }
    }
  }

  // Vérifie si un utilisateur est connecté
  isLoggedIn(): boolean {
    if (this.isApiMode()) {
      return Boolean(this.getToken() && this.currentUser());
    }

    return Boolean(this.currentUser());
  }

  // Retourne l'utilisateur actuellement connecté (ou null si aucun)
  currentUser(): User | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    if (this.isApiMode()) {
      return this.currentUserSnapshotCache;
    }

    const currentId = this.getCurrentUserId();
    if (!currentId) return null;

    return this.getUsers().find((user) => user.id === currentId) ?? null;
  }

  // Retourne un utilisateur à partir de son identifiant
  getUserById(userId: string): User | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    if (this.isApiMode()) {
      const current = this.currentUser();
      if (current && current.id === userId) {
        return current;
      }
    }

    return this.getUsers().find((user) => user.id === userId) ?? null;
  }

  // Crée un nouveau compte utilisateur
  async register(payload: Omit<User, 'id'>): Promise<{ ok: boolean; message?: string }> {
    if (!isPlatformBrowser(this.platformId)) {
      return { ok: false, message: 'Not available on server.' };
    }

    if (this.isApiMode()) {
      try {
        const response = await firstValueFrom(
          this.http.post<AuthResponse>(`${this.authBaseUrl}/auth/register`, payload)
        );
        this.setToken(response.accessToken);
        this.setCurrentUserSnapshot(response.user);
        return { ok: true };
      } catch {
        return { ok: false, message: 'Registration failed.' };
      }
    }

    const users = this.getUsers();

    // Vérifie que l'email n'est pas déjà utilisé
    const exists = users.some(
      (user) => user.email.toLowerCase() === payload.email.toLowerCase()
    );
    if (exists) {
      return { ok: false, message: 'Email already registered.' };
    }

    const user: User = {
      ...payload,
      id: this.generateId()
    };

    users.push(user);
    this.saveUsers(users);
    this.setCurrentUserId(user.id);
    return { ok: true };
  }

  // Connecte un utilisateur avec son email et mot de passe
  async login(email: string, password: string): Promise<{ ok: boolean; message?: string }> {
    if (!isPlatformBrowser(this.platformId)) {
      return { ok: false, message: 'Not available on server.' };
    }

    if (this.isApiMode()) {
      try {
        const response = await firstValueFrom(
          this.http.post<AuthResponse>(`${this.authBaseUrl}/auth/login`, {
            email,
            password
          })
        );
        this.setToken(response.accessToken);
        this.setCurrentUserSnapshot(response.user);
        return { ok: true };
      } catch {
        return { ok: false, message: 'Invalid credentials.' };
      }
    }

    const users = this.getUsers();
    const user = users.find(
      (item) =>
        item.email.toLowerCase() === email.toLowerCase() &&
        item.password === password
    );

    if (!user) {
      return { ok: false, message: 'Invalid credentials.' };
    }

    this.setCurrentUserId(user.id);
    return { ok: true };
  }

  // Met à jour le profil de l'utilisateur connecté
  updateProfile(
    update: Pick<User, 'firstName' | 'lastName' | 'phone' | 'address'>
  ): Promise<User | null> {
    if (!isPlatformBrowser(this.platformId)) return Promise.resolve(null);

    if (this.isApiMode()) {
      const token = this.getToken();
      if (!token) {
        return Promise.resolve(null);
      }

      return firstValueFrom(
        this.http.put<User>(`${this.authBaseUrl}/auth/me`, update, {
          headers: this.buildAuthHeaders(token)
        })
      )
        .then((updated) => {
          this.setCurrentUserSnapshot(updated);
          return updated;
        })
        .catch(() => null);
    }

    const currentId = this.getCurrentUserId();
    if (!currentId) return Promise.resolve(null);

    const users = this.getUsers();
    const index = users.findIndex((user) => user.id === currentId);
    if (index === -1) return Promise.resolve(null);

    const updated: User = { ...users[index], ...update };
    users[index] = updated;
    this.saveUsers(users);
    return Promise.resolve(updated);
  }

  // Déconnecte l'utilisateur actuel
  logout(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(CURRENT_USER_SNAPSHOT_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    this.currentUserIdCache = null;
    this.currentUserSnapshotCache = null;
    this.authTokenCache = null;
  }

  getToken(): string | null {
    return this.authTokenCache;
  }

  // Retourne la liste des utilisateurs (depuis le cache ou le localStorage)
  private getUsers(): User[] {
    if (this.usersCache) return this.usersCache;

    const stored = localStorage.getItem(USERS_KEY);
    if (!stored) {
      this.usersCache = [];
      return this.usersCache;
    }

    try {
      const parsed = JSON.parse(stored) as User[];
      this.usersCache = parsed;
      return parsed;
    } catch {
      this.usersCache = [];
      return this.usersCache;
    }
  }

  // Sauvegarde la liste des utilisateurs dans le cache et le localStorage
  private saveUsers(users: User[]): void {
    this.usersCache = users;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  // Retourne l'identifiant de l'utilisateur connecté
  private getCurrentUserId(): string | null {
    if (this.currentUserIdCache) return this.currentUserIdCache;
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    if (!stored) return null;
    this.currentUserIdCache = stored;
    return stored;
  }

  // Sauvegarde l'identifiant de l'utilisateur connecté
  private setCurrentUserId(id: string): void {
    this.currentUserIdCache = id;
    localStorage.setItem(CURRENT_USER_KEY, id);
  }

  private setCurrentUserSnapshot(user: User): void {
    this.currentUserSnapshotCache = user;
    localStorage.setItem(CURRENT_USER_SNAPSHOT_KEY, JSON.stringify(user));
  }

  private readCurrentUserSnapshot(): User | null {
    const raw = localStorage.getItem(CURRENT_USER_SNAPSHOT_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  private setToken(token: string): void {
    this.authTokenCache = token;
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }

  private buildAuthHeaders(token: string): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  private isApiMode(): boolean {
    return DATA_SOURCE_CONFIG.auth === 'api';
  }

  private async refreshCurrentUserFromApi(): Promise<void> {
    const token = this.getToken();
    if (!token) {
      return;
    }

    try {
      const user = await firstValueFrom(
        this.http.get<User>(`${this.authBaseUrl}/auth/me`, {
          headers: this.buildAuthHeaders(token)
        })
      );
      this.setCurrentUserSnapshot(user);
    } catch {
      this.logout();
    }
  }

  // Génère un identifiant unique pour un nouvel utilisateur
  private generateId(): string {
    return `user-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;
  }
}
