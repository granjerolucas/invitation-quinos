# Fullscreen and WhatsApp sharing

The invitation configuration remains in the `invitation-data` JSON inside `../quince-blue-silver.html`.

- `music.opening.autoplay` attempts audible cover playback on load. Browsers can require a gesture. The cover music button remains available, and a first tap outside the cover controls retries blocked autoplay. A manual pause remains paused.
- `presentation.fullscreenOnMobile` requests document fullscreen when the envelope is opened on a coarse-pointer screen up to 1024px wide. This request runs in the same gesture as the audio transition; it is never awaited by the opening animation. Supported mobile browsers show a separate enter/exit control. Unsupported or rejected requests preserve the regular full-height layout.
- `share.title`, `share.description`, `share.image`, and `share.imageAlt` control the share card and message. `share.url` is the public invitation URL. An empty URL uses the current public HTTP/HTTPS page URL; localhost and file previews are not shared.

`share-cover.jpg` is a 1200 × 630 rendering of `share-cover.html`, made from the existing envelope, roses, local fonts, event name and date. The HTML template reads the invitation JSON. If its name/date or artwork changes, render it again in a browser at 1200 × 630 after `window.coverReady` resolves, and save a JPEG screenshot to `share-cover.jpg`.

## Static metadata for crawlers

WhatsApp's link preview needs a publicly reachable page and image. Client-side JSON updates alone cannot update the HTML fetched by a link crawler. After editing the share JSON, run:

```sh
node previews/blue-silver-assets/sync-sharing.mjs --url https://your-public-host.example/invitation.html
```

Replace the example with the actual public invitation URL. The command records it in `share.url` and writes static Open Graph/Twitter metadata and a canonical link, including an absolute image URL. With an existing configured URL, `node previews/blue-silver-assets/sync-sharing.mjs` resynchronizes the metadata without changing JSON formatting. Publish the HTML and its assets at those paths through the owner's normal deployment process. This command only edits local files; it never publishes or contacts the public host.

The WhatsApp button prepares the title, description and invitation URL. The image is supplied by the page's Open Graph metadata, rather than adding a second image URL to the WhatsApp message. The user selects recipients and confirms sending in WhatsApp. Actual previews can depend on crawler access and caching, so they must be verified after publication.

Local checks can verify playback, fullscreen requests, message encoding, cover rendering, metadata and unchanged files on invalid input. They cannot confirm a real WhatsApp preview without the public URL and published assets.
