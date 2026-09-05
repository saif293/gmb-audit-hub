# GMB Audit Hub

Initial client-hunting dashboard based on the uploaded **gmb audit** workbook.

## Included in this first build

- Location, niche, main keyword and radius search form
- Free Google Maps link import: paste one listing link per line
- Separate prospect records for every business
- Manual prospect entry
- Individual audit modal for all 37 audit factors
- Yes, No and Notes fields
- Plain-language explanation for every check: what it checks, business effect and recommended action
- Automatic audit scoring
- Yes/No audit workflow with a professional proposal preview
- Browser print-to-PDF export for client-ready reports
- Premium agency-style report view with a branded cover, infographic impact cards, category health visuals, priority findings, a visual 90-day roadmap, and an icon-based evidence appendix
- Pipeline status and summary cards
- CSV export
- Netlify-ready static structure

## Free import mode

When no Google Maps API key or payment method is available, paste public Google Maps listing links into the **Paste Google Maps links** box. The app creates one separate prospect record for each accepted link and tries to read the public page title/description. It never invents missing business details, bypasses captchas, or accesses private owner data.

After import, open each prospect's audit and complete fields that Google does not expose reliably, such as services, posts, messaging, call history, review response rates, Q&As and photo checks. The original Maps URL is retained on the prospect for manual verification.

## Proposal export

Save your agency and contact details in Settings. Complete a prospect audit using Yes or No, then choose **Proposal** beside the business or **Save & proposal** inside its audit. The report view leads with overall profile health, visibility/trust/conversion impact cards, category visuals, priority findings and a visual 90-day roadmap. Choose **Export client PDF** and select "Save as PDF" in the browser print dialog. The detailed 37-point audit is presented as explainer cards with status icons, business effect, recommended action and evidence notes instead of a spreadsheet table.

## Live search connection

The interface is ready for a server-side Google Places API connection. The production search function should use a protected `GOOGLE_MAPS_API_KEY` environment variable and return public place data only. It should search multiple related keyword variations, paginate where available, deduplicate by place ID, and then create one lead record per business.

Some checklist items are not reliably available through public place data, including call history, messaging, exact response rate, posts, QnAs and geo-tagging. Those should remain `Manual review` unless an authorized owner-level data source is connected.
