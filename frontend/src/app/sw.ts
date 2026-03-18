/// <reference lib="webworker" />

import { defaultCache } from "@serwist/next/worker";
import {
  ExpirationPlugin,
  NetworkFirst,
  NetworkOnly,
  Serwist,
  type PrecacheEntry,
  type RouteMatchCallbackOptions,
  type RuntimeCaching,
  type SerwistGlobalConfig,
} from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[];
  }
}

declare const self: ServiceWorkerGlobalScope;

const APP_SHELL_PREFIXES = [
  "/prompts",
  "/notes",
  "/projects",
  "/work-items",
  "/sessions",
  "/offline",
];

const isAppShellRequest = ({ sameOrigin, url, request }: RouteMatchCallbackOptions): boolean => {
  if (!sameOrigin || request.method !== "GET") {
    return false;
  }

  if (url.pathname === "/") {
    return true;
  }

  return APP_SHELL_PREFIXES.some((prefix) => url.pathname === prefix || url.pathname.startsWith(`${prefix}/`));
};

const runtimeCaching: RuntimeCaching[] = [
  {
    method: "GET",
    matcher: isAppShellRequest,
    handler: new NetworkFirst({
      cacheName: "oro-app-shell",
      networkTimeoutSeconds: 8,
      plugins: [
        new ExpirationPlugin({
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60,
          maxAgeFrom: "last-used",
        }),
      ],
    }),
  },
  {
    method: "GET",
    matcher: ({ sameOrigin, url }: RouteMatchCallbackOptions) =>
      sameOrigin && url.pathname.startsWith("/api/v1/"),
    handler: new NetworkFirst({
      cacheName: "oro-api-v1",
      networkTimeoutSeconds: 10,
      plugins: [
        new ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 10 * 60,
          maxAgeFrom: "last-used",
        }),
      ],
    }),
  },
  {
    method: "POST",
    matcher: ({ sameOrigin, url }: RouteMatchCallbackOptions) =>
      sameOrigin && url.pathname.startsWith("/api/v1/"),
    handler: new NetworkOnly(),
  },
  {
    method: "PUT",
    matcher: ({ sameOrigin, url }: RouteMatchCallbackOptions) =>
      sameOrigin && url.pathname.startsWith("/api/v1/"),
    handler: new NetworkOnly(),
  },
  {
    method: "DELETE",
    matcher: ({ sameOrigin, url }: RouteMatchCallbackOptions) =>
      sameOrigin && url.pathname.startsWith("/api/v1/"),
    handler: new NetworkOnly(),
  },
  {
    method: "PATCH",
    matcher: ({ sameOrigin, url }: RouteMatchCallbackOptions) =>
      sameOrigin && url.pathname.startsWith("/api/v1/"),
    handler: new NetworkOnly(),
  },
  {
    method: "POST",
    matcher: ({ url }: RouteMatchCallbackOptions) =>
      url.origin === "http://localhost:4000" && url.pathname === "/v1/chat/completions",
    handler: new NetworkOnly({
      networkTimeoutSeconds: 10,
    }),
  },
  ...defaultCache,
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching,
});

serwist.setCatchHandler(async ({ request }) => {
  if (request.mode === "navigate") {
    const fallback = await serwist.matchPrecache("/offline");
    if (fallback) {
      return fallback;
    }
  }

  return Response.error();
});

serwist.addEventListeners();

