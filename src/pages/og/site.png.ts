import { renderOgImage, PNG_HEADERS } from '~/lib/og';
import { SITE } from '~/consts';

export function GET() {
  return new Response(renderOgImage({ title: SITE.taglineAr, kicker: SITE.name }), {
    headers: PNG_HEADERS,
  });
}
