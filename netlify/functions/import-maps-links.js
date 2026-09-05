const headers = { "content-type": "application/json" };
const validHost = (hostname) => ["google.com", "www.google.com", "maps.google.com", "maps.app.goo.gl", "goo.gl"].includes(hostname);
const decodeEntities = (value) => String(value || "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const cleanTitle = (value) => decodeEntities(value).replace(/\s*[-|]\s*Google Maps.*$/i, "").replace(/^Google Maps\s*[-|]\s*/i, "").trim();
const nameFromUrl = (value) => { try { const url = new URL(value); const match = url.pathname.match(/\/place\/([^/]+)/i); return match ? decodeURIComponent(match[1].replace(/\+/g, " ")).replace(/\+/g, " ").trim() : ""; } catch { return ""; } };
const fetchWithTimeout = async (url) => { const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 8000); try { return await fetch(url, {redirect:"follow",signal:controller.signal,headers:{"user-agent":"Mozilla/5.0 (compatible; GMB-Audit-Hub/1.0)"}}); } finally { clearTimeout(timeout); } };

export default async (request) => {
  if (request.method !== "POST") return new Response(JSON.stringify({error:"POST is required"}),{status:405,headers});
  let body; try { body = await request.json(); } catch { return new Response(JSON.stringify({error:"Invalid JSON body"}),{status:400,headers}); }
  const links = [...new Set((Array.isArray(body.links)?body.links:[]).map(x=>String(x).trim()).filter(Boolean))].slice(0,100);
  if (!links.length) return new Response(JSON.stringify({error:"At least one Google Maps link is required"}),{status:400,headers});
  const businesses=[]; const rejected=[];
  for (const originalUrl of links) {
    let parsed; try { parsed=new URL(originalUrl); } catch { rejected.push({url:originalUrl,reason:"Invalid URL"}); continue; }
    if (!validHost(parsed.hostname)) { rejected.push({url:originalUrl,reason:"Not a Google Maps link"}); continue; }
    let finalUrl=originalUrl; let title=""; let description="";
    try { const response=await fetchWithTimeout(originalUrl); finalUrl=response.url||originalUrl; if ((response.headers.get("content-type")||"").includes("text/html")) { const html=await response.text(); title=cleanTitle(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||""); description=cleanTitle(html.match(/<meta[^>]+(?:name|property)=["'](?:description|og:description)["'][^>]+content=["']([^"']*)["']/i)?.[1]||""); } } catch {}
    businesses.push({id:`maps-${Buffer.from(finalUrl).toString("base64url").slice(0,80)}`,name:title||nameFromUrl(finalUrl)||nameFromUrl(originalUrl)||"Google Maps listing",category:"Needs profile review",address:"",phone:"",website:"",mapUrl:finalUrl,sourceUrl:originalUrl,profileSummary:description,pipelineStatus:"New",audit:{}});
  }
  return new Response(JSON.stringify({count:businesses.length,businesses,rejected}),{headers});
};
