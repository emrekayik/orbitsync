import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing URL parameter" }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      next: { revalidate: 3600 } // cache for an hour
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const getMetaTag = (names: string[]) => {
      for (const name of names) {
        const content = $(`meta[property="${name}"], meta[name="${name}"]`).attr("content");
        if (content) return content;
      }
      return null;
    };

    const title = getMetaTag(["og:title", "twitter:title"]) || $("title").text() || null;
    const description = getMetaTag(["og:description", "twitter:description", "description"]) || null;
    let image = getMetaTag(["og:image", "twitter:image", "twitter:image:src"]) || null;
    
    if (image && !image.startsWith("http") && !image.startsWith("data:")) {
      const parsedUrl = new URL(url);
      image = `${parsedUrl.protocol}//${parsedUrl.host}${image.startsWith("/") ? "" : "/"}${image}`;
    }
    
    let favicon = $('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').attr('href') || null;
    if (favicon && !favicon.startsWith("http") && !favicon.startsWith("data:")) {
      const parsedUrl = new URL(url);
      favicon = `${parsedUrl.protocol}//${parsedUrl.host}${favicon.startsWith("/") ? "" : "/"}${favicon}`;
    }
    if (!favicon) {
       const parsedUrl = new URL(url);
       favicon = `${parsedUrl.protocol}//${parsedUrl.host}/favicon.ico`;
    }

    const domain = new URL(url).hostname;

    return NextResponse.json({ title, description, image, url, domain, favicon });
  } catch (error) {
    console.error(`Link preview error for ${url}:`, error);
    try {
      const domain = new URL(url).hostname;
      return NextResponse.json({ 
        title: url, 
        description: "Could not load preview", 
        image: null, 
        url,
        domain,
        favicon: null
      });
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }
  }
}
