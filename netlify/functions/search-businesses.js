const clean = (value) => String(value || "").trim();

export default async (request) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST is required" }), {
      status: 405,
      headers: { "content-type": "application/json" },
    });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Google Places API is not connected" }), {
      status: 503,
      headers: { "content-type": "application/json" },
    });
  }

  let input;
  try {
    input = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const location = clean(input.location);
  const niche = clean(input.niche);
  const keyword = clean(input.keyword) || niche;
  if (!location || !niche) {
    return new Response(JSON.stringify({ error: "Location and niche are required" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const queries = [...new Set([
    `${keyword} in ${location}`,
    `${niche} in ${location}`,
    `local ${niche} ${location}`,
  ])];
  const fieldMask = [
    "places.id",
    "places.displayName",
    "places.formattedAddress",
    "places.nationalPhoneNumber",
    "places.websiteUri",
    "places.rating",
    "places.userRatingCount",
    "places.googleMapsUri",
    "places.types",
    "nextPageToken",
  ].join(",");
  const results = new Map();

  for (const textQuery of queries) {
    let pageToken = undefined;
    for (let page = 0; page < 3; page += 1) {
      const body = { textQuery, pageSize: 20 };
      if (pageToken) body.pageToken = pageToken;
      const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-goog-api-key": apiKey,
          "x-goog-fieldmask": fieldMask,
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const detail = await response.text();
        return new Response(JSON.stringify({ error: "Google Places request failed", detail }), {
          status: 502,
          headers: { "content-type": "application/json" },
        });
      }
      const payload = await response.json();
      for (const place of payload.places || []) {
        if (!place.id) continue;
        results.set(place.id, {
          id: place.id,
          name: place.displayName?.text || "",
          category: place.types?.[0] || niche,
          address: place.formattedAddress || "",
          phone: place.nationalPhoneNumber || "",
          website: place.websiteUri || "",
          mapUrl: place.googleMapsUri || "",
          rating: place.rating ?? "",
          reviews: place.userRatingCount ?? "",
          sourceQuery: textQuery,
          pipelineStatus: "New",
          audit: {},
        });
      }
      pageToken = payload.nextPageToken;
      if (!pageToken) break;
    }
  }

  return new Response(JSON.stringify({
    location,
    niche,
    keyword,
    radius: clean(input.radius),
    count: results.size,
    businesses: [...results.values()],
  }), { headers: { "content-type": "application/json" } });
};
