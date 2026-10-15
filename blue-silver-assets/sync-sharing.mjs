import { readFile, writeFile } from 'node:fs/promises';

const target = new URL('../quince-blue-silver.html', import.meta.url);
const args = process.argv.slice(2);
if (args.length && (args.length !== 2 || args[0] !== '--url' || !args[1])) {
  throw new Error('Usage: node previews/blue-silver-assets/sync-sharing.mjs [--url <public-invitation-url>]');
}
let html = await readFile(target, 'utf8');
const jsonPattern = /(<script type="application\/json" id="invitation-data">)([\s\S]*?)(<\/script>)/;
const jsonMatch = html.match(jsonPattern);
if (!jsonMatch) throw new Error('Invitation JSON was not found. No files changed.');
const data = JSON.parse(jsonMatch[2]);
const share = data.share || {};
const rawUrl = args[1] || share.url;
let pageUrl = '';
if (rawUrl) {
  const parsed = new URL(rawUrl);
  if (!['https:', 'http:'].includes(parsed.protocol) || /^(localhost|127\..*|0\.0\.0\.0|\[::1\])$/i.test(parsed.hostname)) {
    throw new Error('Sharing requires a public HTTP or HTTPS URL. No files changed.');
  }
  parsed.hash = '';
  pageUrl = parsed.href;
}
const title = share.title || `Mis XV Años · ${data.name}`;
const description = share.description || 'Una noche de magia y recuerdos para compartir contigo.';
const image = share.image || './blue-silver-assets/share-cover.jpg';
const imageUrl = pageUrl ? new URL(image, pageUrl).href : image;
if (/^[a-z][a-z\d+.-]*:/i.test(imageUrl) && !/^https?:/i.test(imageUrl)) {
  throw new Error('The sharing image must be a relative path or HTTP/HTTPS URL. No files changed.');
}
const escape = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));
const meta = (key, value, attribute = 'property') => `  <meta ${attribute}="${key}" content="${escape(value)}">`;
const imageExtension = new URL(imageUrl, 'https://placeholder.invalid/').pathname.split('.').pop().toLowerCase();
const imageType = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }[imageExtension];
const tags = [
  '  <!-- share-metadata:start -->',
  meta('og:type', 'website'), meta('og:title', title), meta('og:description', description),
  meta('og:image', imageUrl), ...(imageType ? [meta('og:image:type', imageType)] : []),
  meta('og:image:width', share.imageWidth || 1200), meta('og:image:height', share.imageHeight || 630),
  meta('og:image:alt', share.imageAlt || title), meta('og:locale', 'es_PE'),
  meta('twitter:card', 'summary_large_image', 'name'), meta('twitter:title', title, 'name'),
  meta('twitter:description', description, 'name'), meta('twitter:image', imageUrl, 'name'),
  ...(pageUrl ? [meta('og:url', pageUrl), `  <link rel="canonical" href="${escape(pageUrl)}">`] : []),
  '  <!-- share-metadata:end -->'
].join('\n');
const metadataPattern = /  <!-- share-metadata:start -->[\s\S]*?<!-- share-metadata:end -->/;
if (!metadataPattern.test(html)) throw new Error('Sharing metadata markers were not found. No files changed.');
html = html.replace(metadataPattern, tags);
html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${escape(description)}">`);
if (args[1]) {
  data.share = { ...share, url: pageUrl };
  html = html.replace(jsonPattern, (_, start, json, end) => `${start}\n    ${JSON.stringify(data, null, 2).replaceAll('<', '\\u003c').replaceAll('\n', '\n    ')}\n  ${end}`);
}
await writeFile(target, html);
console.log(pageUrl
  ? `Synchronized static sharing metadata for ${pageUrl}`
  : 'Synchronized local preview metadata. Set share.url or run with --url before publishing to enable absolute social-preview URLs.');
