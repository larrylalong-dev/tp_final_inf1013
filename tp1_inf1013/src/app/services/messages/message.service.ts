import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { Message } from '../../models/message.model';
import { getDataSourceConfig } from '../../core/data-source.config';

const STORAGE_KEY = 'messages';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly http = inject(HttpClient);
  private messagesCache: Message[] | null = null;

  seedIfNeeded(): void {
    if (this.messagesCache) {
      return;
    }

    if (!isPlatformBrowser(this.platformId)) {
      this.messagesCache = [];
      return;
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      this.messagesCache = this.parseMessages(stored);
      if (this.isApiMode()) {
        void this.refreshFromApi();
      }
      return;
    }

    this.messagesCache = [];

    if (this.isApiMode()) {
      void this.refreshFromApi();
    }
  }

  sendMessage(message: Omit<Message, 'id' | 'createdAt'> & Partial<Message>): Message {
    const messages = this.ensureCache();
    const created: Message = {
      id: message.id ?? this.generateId(),
      adId: message.adId,
      ownerId: message.ownerId,
      fromUserId: message.fromUserId,
      subject: message.subject,
      body: message.body,
      createdAt: message.createdAt ?? new Date().toISOString()
    };

    messages.push(created);
    this.persist(messages);

    if (this.isApiMode()) {
      this.http
        .post(`${this.businessBaseUrl()}/messages`, created, this.withAuthIfAvailable())
        .subscribe({ error: () => void 0 });
    }

    return created;
  }

  getMessagesForOwner(ownerId: string): Message[] {
    const messages = this.ensureCache();
    return this.sortByNewest(messages.filter((message) => message.ownerId === ownerId));
  }

  getMessagesForAd(adId: string | number): Message[] {
    const messages = this.ensureCache();
    return this.sortByNewest(messages.filter((message) => this.matchesId(message.adId, adId)));
  }

  countMessagesForAd(adId: string | number): number {
    return this.getMessagesForAd(adId).length;
  }

  private ensureCache(): Message[] {
    this.seedIfNeeded();

    if (this.messagesCache) {
      return this.messagesCache;
    }

    this.messagesCache = [];
    return this.messagesCache;
  }

  private persist(messages: Message[]): void {
    this.messagesCache = messages;

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }

  private parseMessages(value: string): Message[] {
    try {
      const parsed = JSON.parse(value) as Message[];
      return parsed;
    } catch {
      return [];
    }
  }

  private matchesId(a: string | number, b: string | number): boolean {
    return String(a) === String(b);
  }

  private sortByNewest(messages: Message[]): Message[] {
    return [...messages].sort((a, b) => this.toTime(b.createdAt) - this.toTime(a.createdAt));
  }

  private toTime(value: string): number {
    const time = Date.parse(value);
    return Number.isNaN(time) ? 0 : time;
  }

  private generateId(): string {
    return `msg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  private isApiMode(): boolean {
    return getDataSourceConfig().messages === 'api';
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

  private async refreshFromApi(): Promise<void> {
    try {
      const messages = await firstValueFrom(
        this.http.get<Message[]>(`${this.businessBaseUrl()}/messages`, this.withAuthIfAvailable())
      );
      this.persist(messages);
    } catch {
      // Fallback local si l'API n'est pas disponible
    }
  }
}
