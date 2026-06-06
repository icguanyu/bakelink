const BOT_UA = /facebookexternalhit|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Slackbot|LINE|Discordbot|bingbot|Googlebot|Applebot|Pinterest|Snapchat/i;

function escape(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function onRequest(context) {
  const { params, request, env } = context;
  const ua = request.headers.get("User-Agent") ?? "";
  const url = new URL(request.url);

  // 瀏覽器端 JS redirect 帶來的第二次請求，直接交給 SPA
  if (url.searchParams.has("_spa")) {
    return context.next();
  }

  if (!BOT_UA.test(ua)) {
    return context.next();
  }

  const apiUrl = (env.API_URL ?? "").replace(/\/$/, "");
  if (!apiUrl) return context.next();

  try {
    const res = await fetch(`${apiUrl}/shop/${params.slug}`, {
      headers: { "Accept": "application/json" },
    });
    if (!res.ok) return context.next();

    const shop = await res.json();
    const title = shop.shopName ?? "Prelo";
    const description = shop.intro ?? "麵包烘焙訂購平台";
    const image = shop.coverImage ?? shop.avatar ?? "";

    const pageUrl = new URL(request.url);
    pageUrl.search = "";
    const canonical = pageUrl.toString();

    const html = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8" />
  <title>${escape(title)}</title>
  <meta name="description" content="${escape(description)}" />
  <meta property="og:site_name" content="Prelo" />
  <meta property="og:title" content="${escape(title)}" />
  <meta property="og:description" content="${escape(description)}" />
  <meta property="og:url" content="${escape(canonical)}" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="zh_TW" />
  ${image ? `<meta property="og:image" content="${escape(image)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />` : ""}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escape(title)}" />
  <meta name="twitter:description" content="${escape(description)}" />
  ${image ? `<meta name="twitter:image" content="${escape(image)}" />` : ""}
  <link rel="canonical" href="${escape(canonical)}" />
</head>
<body>
  <a href="${escape(canonical)}">${escape(title)}</a>
  <script>window.location.replace("${escape(canonical)}?_spa=1");</script>
</body>
</html>`;

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch {
    return context.next();
  }
}
