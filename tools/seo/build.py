"""Builds the service / area pages from tools/seo/pages.py.
Usage (from the repo root): python3 tools/seo/build.py
Pages are Arabic-first: the Arabic text is written into the HTML (what Google reads),
and site.js swaps to English when the visitor picks English."""
import html, json, os, re, sys, datetime
sys.path.insert(0, os.path.dirname(__file__))
from pages import PAGES, AREAS_AR, AREAS_EN, WHY_AR, WHY_EN

ROOT = os.path.join(os.path.dirname(__file__), "..", "..")
SITE = "https://melsaelevators.com/"
WA = "201017765778"
TEL = "+201017765778"
e = lambda s: html.escape(s, quote=True)
js = lambda o: json.dumps(o, ensure_ascii=False)

CSS = """
.sv-hero{position:relative;color:#fff;background:#0b1d35;overflow:hidden}
.sv-hero img.bgimg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.42}
.sv-hero::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,#0b1d35f2 0%,#0b1d35b3 55%,#0b1d3566 100%)}
[dir=rtl] .sv-hero::after{background:linear-gradient(270deg,#0b1d35f2 0%,#0b1d35b3 55%,#0b1d3566 100%)}
.sv-hero .wrap{position:relative;z-index:1;padding-top:76px;padding-bottom:70px;max-width:1200px}
.sv-hero h1{color:#fff;max-width:860px;font-size:clamp(32px,4.4vw,56px)}.sv-hero .lead{color:#dfe4ec;max-width:700px}.sv-hero .eyebrow{color:#c5ad87}
.crumbs{font-size:13px;color:#aeb5be;margin-bottom:14px}.crumbs a{color:#aeb5be;text-decoration:none}.crumbs a:hover{color:#fff}
.sv-hero .btn.ghost{color:#fff;border-color:#ffffff88}
.inc{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-top:22px}
.inc .card h3{font-size:18px}.inc .card p{margin:6px 0 0;color:var(--muted);font-size:15px}
.inc .n{font-size:30px;color:#c5ad87;font-weight:300;line-height:1;margin-bottom:12px;display:block;direction:ltr}
[dir=rtl] .inc .n{text-align:right}
.ph3{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:12px;margin-top:8px}
.ph3 img{width:100%;height:300px;object-fit:cover;border-radius:20px;display:block}
.why{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:22px}
.why div{background:#fff;border-radius:20px;padding:22px}.why b{display:block;font-size:18px;color:var(--navy)}.why span{color:var(--muted);font-size:15px}
.areas{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}
.areas span,.areas a{background:#fff;border:1px solid var(--line);border-radius:980px;padding:9px 16px;font-size:15px;color:var(--navy);text-decoration:none}
.areas a{border-color:var(--red);color:var(--red);font-weight:600}
.faqs{max-width:900px;margin-top:18px;border-top:1px solid var(--line)}
.faqs details{border-bottom:1px solid var(--line)}
.faqs summary{cursor:pointer;list-style:none;padding:20px 0;font-weight:600;font-size:18px;display:flex;justify-content:space-between;gap:16px}
.faqs summary::-webkit-details-marker{display:none}
.faqs summary::after{content:"+";font-size:24px;line-height:1;color:var(--red);transition:transform .3s}
.faqs details[open] summary::after{transform:rotate(45deg)}
.faqs p{margin:0 0 20px;color:var(--muted);font-size:16px;line-height:1.7}
.rel{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:18px}
.rel a{background:#fff;border-radius:16px;padding:18px 20px;text-decoration:none;color:var(--navy);font-weight:600;border:1px solid var(--line);transition:border-color .2s,transform .2s}
.rel a:hover{border-color:var(--red);transform:translateY(-2px)}
.sv-cta{background:var(--navy);color:#fff;border-radius:24px;padding:40px clamp(20px,4vw,48px);display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap}
.sv-cta h2{color:#fff;margin:0}.sv-cta p{margin:6px 0 0;color:#c9ced5}
@media(max-width:900px){.inc{grid-template-columns:1fr 1fr}.rel{grid-template-columns:1fr 1fr}.ph3{grid-template-columns:1fr 1fr}.ph3 img:first-child{grid-column:1/-1}.ph3 img{height:220px}}
@media(max-width:600px){.inc,.why,.rel{grid-template-columns:1fr}}
"""

UI_AR = dict(home="الرئيسية", wa="اطلب على واتساب", call="اتصل الآن", quote="اطلب عرض سعر", whyT="ليه إلكتروميلسا؟", faqT="أسئلة شائعة", relT="صفحات تهمك",
             ctaT="جاهزين نساعدك", ctaP="ابعتلنا نوع المبنى وعدد الأدوار، ونرد عليك بسرعة.", areaMore="صفحتنا لـ")
UI_EN = dict(home="Home", wa="Message us on WhatsApp", call="Call now", quote="Request a quote", whyT="Why Melsa Elevators?", faqT="Frequently asked questions", relT="Related pages",
             ctaT="Ready to help", ctaP="Send us the building type and number of floors and we'll get back to you quickly.", areaMore="Our page for")
GROUP = {"maint": ("الصيانة", "Maintenance", "maintenance.html"), "elev": ("المصاعد", "Elevators", "villa-elevators.html")}
NAME = {p["key"]: (p["ar"]["h1"], p["en"]["h1"], p["slug"] + ".html") for p in PAGES}
AREA_LINK = {"مدينة نصر": ("Nasr City", "elevator-maintenance-nasr-city.html"), "التجمع الخامس": ("Fifth Settlement", "elevator-maintenance-new-cairo.html"),
             "القاهرة الجديدة": ("New Cairo", "elevator-installation-new-cairo.html")}


def build(p):
    A, E, k = p["ar"], p["en"], {}
    def kv(name, ar, en):
        k[name] = (ar, en); return name
    ui = {n: kv("ui_" + n, UI_AR[n], UI_EN[n]) for n in UI_AR}
    g_ar, g_en, g_url = GROUP[p["group"]]
    others = [q for q in PAGES if q["slug"] != p["slug"]]
    same = [q for q in others if q["group"] == p["group"]][:3] + [q for q in others if q["group"] != p["group"]][:3]
    url = SITE + p["slug"] + ".html"
    wa_ar = "https://wa.me/%s?text=%s" % (WA, re.sub(" ", "%20", p["wa_ar"]))
    faq_ld = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in A["faq"]]}
    svc_ld = {"@context": "https://schema.org", "@type": "Service", "name": A["h1"], "alternateName": E["h1"], "description": A["desc"], "url": url,
              "provider": {"@type": "LocalBusiness", "name": "Melsa Elevators", "alternateName": "إلكتروميلسا", "telephone": TEL, "url": SITE,
                           "address": {"@type": "PostalAddress", "streetAddress": "2 Ayoub Buildings, Hassan Aflaton St., Ard El-Golf", "addressLocality": "Nasr City", "addressRegion": "Cairo", "addressCountry": "EG"}},
              "areaServed": [{"@type": "Place", "name": n} for n in ["التجمع الخامس", "القاهرة الجديدة", "مدينة نصر", "القاهرة"]]}
    crumbs_ld = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "الرئيسية", "item": SITE}, {"@type": "ListItem", "position": 2, "name": g_ar, "item": SITE + g_url},
        {"@type": "ListItem", "position": 3, "name": A["h1"], "item": url}]}

    inc = "".join('<div class="card"><span class="n">0%d</span><h3 data-i18n="%s">%s</h3><p data-i18n="%s">%s</p></div>' % (
        i + 1, kv("inc%dh" % i, a[0], b[0]), e(a[0]), kv("inc%dp" % i, a[1], b[1]), e(a[1])) for i, (a, b) in enumerate(zip(A["inc"], E["inc"])))
    why = "".join('<div><b data-i18n="%s">%s</b><span data-i18n="%s">%s</span></div>' % (
        kv("why%dh" % i, a[0], b[0]), e(a[0]), kv("why%dp" % i, a[1], b[1]), e(a[1])) for i, (a, b) in enumerate(zip(WHY_AR, WHY_EN)))
    areas = "".join('<span data-i18n="%s">%s</span>' % (kv("ar%d" % i, a, b), e(a)) for i, (a, b) in enumerate(zip(AREAS_AR, AREAS_EN)))
    areas += "".join('<a href="%s" data-i18n="%s">%s</a>' % (u, kv("al%d" % i, "%s %s" % (UI_AR["areaMore"], a), "%s %s" % (UI_EN["areaMore"], b)), e("%s %s" % (UI_AR["areaMore"], a)))
                     for i, (a, (b, u)) in enumerate(AREA_LINK.items()) if u != p["slug"] + ".html")
    faq = "".join('<details><summary data-i18n="%s">%s</summary><p data-i18n="%s">%s</p></details>' % (
        kv("fq%dq" % i, a[0], b[0]), e(a[0]), kv("fq%da" % i, a[1], b[1]), e(a[1])) for i, (a, b) in enumerate(zip(A["faq"], E["faq"])))
    rel = "".join('<a href="%s" data-i18n="%s">%s</a>' % (q["slug"] + ".html", kv("rel_" + q["key"], NAME[q["key"]][0], NAME[q["key"]][1]), e(NAME[q["key"]][0])) for q in same)
    imgs = "".join('<img src="assets/%s" alt="%s" loading="lazy">' % (src, e(A["h1"])) for src in p["img"])
    for f in ["title", "desc", "eyebrow", "h1", "lead", "incT", "areaT"]:
        kv(f, A[f], E[f])
    kv("grp", g_ar, g_en)
    kv("waText", p["wa_ar"], p["wa_en"])
    T = {"en": {n: v[1] for n, v in k.items()}, "ar": {n: v[0] for n, v in k.items()}}
    T["en"]["title"] = E["title"]; T["ar"]["title"] = A["title"]

    return f"""<!doctype html>
<html lang="ar" dir="rtl">
<head>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-18534844415"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments);}}gtag('js',new Date());gtag('config','AW-18534844415');</script>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(A["title"])}</title>
<meta name="description" content="{e(A["desc"])}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website"><meta property="og:site_name" content="Melsa Elevators"><meta property="og:locale" content="ar_EG"><meta property="og:title" content="{e(A["title"])}"><meta property="og:description" content="{e(A["desc"])}"><meta property="og:url" content="{url}"><meta property="og:image" content="{SITE}assets/{p["img"][0]}"><meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" href="assets/logo-mark.png"><link rel="apple-touch-icon" href="icons/apple-touch-icon.png"><link rel="manifest" href="manifest.webmanifest"><meta name="theme-color" content="#0b1d35">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/site.css">
<script type="application/ld+json">{js(svc_ld)}</script>
<script type="application/ld+json">{js(faq_ld)}</script>
<script type="application/ld+json">{js(crumbs_ld)}</script>
<style>{CSS}</style>
<script>window.PAGE_T={js(T)};</script>
</head>
<body data-page="{p["group"]}" data-lang="ar">
<main>
 <section class="sv-hero"><img class="bgimg" src="assets/{p["img"][0]}" alt="">
  <div class="wrap">
   <div class="crumbs"><a href="./" data-i18n="{ui["home"]}">{UI_AR["home"]}</a> › <a href="{g_url}" data-i18n="grp">{e(g_ar)}</a></div>
   <div class="eyebrow" data-i18n="eyebrow">{e(A["eyebrow"])}</div>
   <h1 data-i18n="h1">{e(A["h1"])}</h1>
   <p class="lead" data-i18n="lead">{e(A["lead"])}</p>
   <div class="btns"><a class="btn red" id="waBtn" href="{wa_ar}" target="_blank" rel="noopener" data-i18n="{ui["wa"]}">{UI_AR["wa"]}</a><a class="btn ghost" href="tel:{TEL}" data-i18n="{ui["call"]}">{UI_AR["call"]}</a><a class="btn ghost" href="quote.html" data-i18n="{ui["quote"]}">{UI_AR["quote"]}</a></div>
  </div>
 </section>

 <section><div class="wrap"><h2 data-i18n="incT">{e(A["incT"])}</h2><div class="inc">{inc}</div></div></section>

 <section style="padding-top:0"><div class="wrap"><div class="ph3">{imgs}</div></div></section>

 <section style="background:var(--tint)"><div class="wrap"><h2 data-i18n="{ui["whyT"]}">{UI_AR["whyT"]}</h2><div class="why">{why}</div></div></section>

 <section><div class="wrap"><h2 data-i18n="areaT">{e(A["areaT"])}</h2><div class="areas">{areas}</div></div></section>

 <section style="background:#fff;border-top:1px solid var(--line)"><div class="wrap"><h2 data-i18n="{ui["faqT"]}">{UI_AR["faqT"]}</h2><div class="faqs">{faq}</div></div></section>

 <section><div class="wrap"><h2 data-i18n="{ui["relT"]}">{UI_AR["relT"]}</h2><div class="rel">{rel}</div></div></section>

 <section style="padding-top:0"><div class="wrap"><div class="sv-cta"><div><h2 data-i18n="{ui["ctaT"]}">{UI_AR["ctaT"]}</h2><p data-i18n="{ui["ctaP"]}">{UI_AR["ctaP"]}</p></div>
  <div class="btns" style="margin:0"><a class="btn red" id="waBtn2" href="{wa_ar}" target="_blank" rel="noopener" data-i18n="{ui["wa"]}">{UI_AR["wa"]}</a><a class="btn ghost" style="color:#fff;border-color:#ffffff88" href="tel:{TEL}" data-i18n="{ui["call"]}">{UI_AR["call"]}</a></div></div></div></section>
</main>
<script src="assets/site-data.js"></script>
<script src="assets/site.js"></script>
<script>
(function(){{const set=()=>{{const u="https://wa.me/{WA}?text="+encodeURIComponent(Melsa.t("waText"));["waBtn","waBtn2"].forEach(i=>{{const a=document.getElementById(i);if(a)a.href=u;}});}};set();window.addEventListener("melsa:lang",set);}})();
</script>
</body>
</html>
"""


def main():
    for p in PAGES:
        with open(os.path.join(ROOT, p["slug"] + ".html"), "w") as f:
            f.write(build(p))
    # sitemap: keep existing entries, add/refresh these pages
    sm = os.path.join(ROOT, "sitemap.xml"); s = open(sm).read(); today = datetime.date.today().isoformat()
    for p in PAGES:
        loc = SITE + p["slug"] + ".html"
        s = re.sub(r"<url><loc>%s</loc><lastmod>[^<]*</lastmod></url>\n?" % re.escape(loc), "", s)
        s = s.replace("</urlset>", "<url><loc>%s</loc><lastmod>%s</lastmod></url>\n</urlset>" % (loc, today))
    open(sm, "w").write(s)
    print("built", len(PAGES), "pages")


if __name__ == "__main__":
    main()
