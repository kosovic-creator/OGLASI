import { setCatchHandler } from 'workbox-routing';
import { matchPrecache } from 'workbox-precaching';

// Force offline fallback for failed document navigations (iOS Safari PWA edge case).
setCatchHandler(async ({ event }) => {
  if (event.request.destination === 'document') {
    return (await matchPrecache('/offline')) || Response.error();
  }

  return Response.error();
});
