# GMB Audit Hub

Initial client-hunting dashboard based on the uploaded **gmb audit** workbook.

## Included in this first build

- Location, niche, main keyword and radius search form
- Separate prospect records for every business
- Manual prospect entry
- Individual audit modal for all 37 audit factors
- Pass, Fail, Missing, Manual review and Notes fields
- Automatic audit scoring
- Pipeline status and summary cards
- CSV export
- Netlify-ready static structure

## Live search connection

The interface is ready for a server-side Google Places API connection. The production search function should use a protected `GOOGLE_MAPS_API_KEY` environment variable and return public place data only. It should search multiple related keyword variations, paginate where available, deduplicate by place ID, and then create one lead record per business.

Some checklist items are not reliably available through public place data, including call history, messaging, exact response rate, posts, QnAs and geo-tagging. Those should remain `Manual review` unless an authorized owner-level data source is connected.
