import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'ads/:id', renderMode: RenderMode.Server },
  { path: 'my-ads/:id/edit', renderMode: RenderMode.Server },
  { path: '**', renderMode: RenderMode.Prerender }
];
