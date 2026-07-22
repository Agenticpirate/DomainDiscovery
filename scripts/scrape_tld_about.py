#!/usr/bin/env python3
"""Scrape official TLD about / registry data from IANA Root Zone Database
and optionally enrich with Wikipedia summaries.

GoDaddy help pages are blocked for automated access; IANA is the authoritative
public source for registry sponsor, WHOIS/RDAP, contacts, and nameservers.

Outputs:
  src/data/tld-about/index.json   — catalog
  src/data/tld-about/{slug}.json  — per-TLD detail pages

Examples:
  python3 scripts/scrape_tld_about.py --priority-only
  python3 scripts/scrape_tld_about.py --all --delay 0.35
  python3 scripts/scrape_tld_about.py --limit 50 --resume
"""
from __future__ import annotations

import argparse
import json
import re
import time
from pathlib import Path
from typing import Any
from urllib.parse import urljoin

import cloudscraper
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "src" / "data" / "tld-about"
INDEX_PATH = OUT_DIR / "index.json"
IANA_DB = "https://www.iana.org/domains/root/db"
IANA_PAGE = "https://www.iana.org/domains/root/db/{slug}.html"

# High-traffic extensions first (also match price-compare popular set)
PRIORITY = [
    "com", "net", "org", "io", "ai", "co", "app", "dev", "xyz", "in", "us",
    "info", "biz", "me", "tv", "shop", "store", "online", "site", "tech",
    "blog", "page", "cloud", "software", "live", "world", "today", "one",
    "link", "website", "space", "digital", "email", "tools", "support",
    "click", "club", "news", "fun", "cc", "uk", "ca", "de", "au", "eu",
    "nl", "fr", "it", "es", "so", "gg", "to", "fm", "ly", "sh", "pw",
    "pro", "mobi", "asia", "top", "vip", "icu", "wiki", "chat", "video",
    "agency", "studio", "design", "media", "group", "company", "solutions",
    "services", "network", "systems", "domains", "finance", "health",
    "education", "law", "realestate", "games", "music", "art", "photo",
    "travel", "hotel", "food", "coffee", "fashion", "beauty", "sports",
    "green", "eco", "energy", "pet", "dog", "cat", "family", "kids",
    "love", "life", "work", "jobs", "careers", "security", "hosting",
]


def make_scraper() -> cloudscraper.CloudScraper:
    return cloudscraper.create_scraper(
        browser={"browser": "chrome", "platform": "darwin", "mobile": False}
    )


def discover_slugs(scraper: cloudscraper.CloudScraper) -> list[str]:
    html = scraper.get(IANA_DB, timeout=60).text
    found = re.findall(r'href="/domains/root/db/([a-z0-9-]+)\.html"', html)
    available = list(dict.fromkeys(found))
    ordered: list[str] = []
    seen: set[str] = set()
    for s in PRIORITY:
        if s in available and s not in seen:
            ordered.append(s)
            seen.add(s)
    for s in available:
        if s not in seen:
            ordered.append(s)
            seen.add(s)
    return ordered


def section_blocks(soup: BeautifulSoup) -> dict[str, str]:
    blocks: dict[str, str] = {}
    for h2 in soup.find_all("h2"):
        title = h2.get_text(" ", strip=True)
        parts: list[str] = []
        for sib in h2.next_siblings:
            name = getattr(sib, "name", None)
            if name == "h2":
                break
            if hasattr(sib, "get_text"):
                text = sib.get_text("\n", strip=True)
                if text:
                    parts.append(text)
        if parts:
            blocks[title] = "\n".join(parts)
    return blocks


def parse_registry_info(text: str) -> dict[str, str | None]:
    url = None
    whois = None
    rdap = None
    updated = None
    registered = None
    m = re.search(r"URL for registration services:\s*(\S+)", text, re.I)
    if m:
        url = m.group(1).rstrip(".")
    m = re.search(r"WHOIS Server:\s*(\S+)", text, re.I)
    if m:
        whois = m.group(1).rstrip(".")
    m = re.search(r"RDAP Server:\s*(\S+)", text, re.I)
    if m:
        rdap = m.group(1).rstrip(".")
    m = re.search(r"Record last updated\s*([0-9-]+)", text, re.I)
    if m:
        updated = m.group(1)
    m = re.search(r"Registration date\s*([0-9-]+)", text, re.I)
    if m:
        registered = m.group(1)
    return {
        "registryUrl": url,
        "whoisServer": whois,
        "rdapServer": rdap,
        "recordUpdated": updated,
        "registrationDate": registered,
    }


def parse_nameservers(soup: BeautifulSoup) -> list[dict[str, Any]]:
    servers: list[dict[str, Any]] = []
    # Find the Name Servers heading then the following table
    for h2 in soup.find_all("h2"):
        if "name server" not in h2.get_text(" ", strip=True).lower():
            continue
        table = h2.find_next("table")
        if not table:
            continue
        rows = table.find_all("tr")
        for tr in rows[1:]:
            cells = [c.get_text(" ", strip=True) for c in tr.find_all(["td", "th"])]
            if len(cells) >= 2 and cells[0] and cells[0].lower() != "host name":
                host = cells[0].rstrip(".")
                ips = [ip for ip in re.split(r"\s+", cells[1]) if ip]
                servers.append({"host": host, "addresses": ips})
    return servers


def parse_contacts(blocks: dict[str, str]) -> dict[str, str]:
    contacts: dict[str, str] = {}
    manager_keys = (
        "ccTLD Manager",
        "gTLD Manager",
        "Sponsoring Organization",
        "Sponsoring Organisation",  # IANA British spelling
    )
    for key in (
        *manager_keys,
        "Administrative Contact",
        "Technical Contact",
    ):
        # case-insensitive match on block titles
        match_key = next((k for k in blocks if k.lower() == key.lower()), None)
        if not match_key:
            continue
        contacts[key] = blocks[match_key].split("\n")[0][:200]
        if key in manager_keys and "manager" not in contacts:
            contacts["manager"] = blocks[match_key][:500]
    return contacts


def classify_type(type_line: str) -> str:
    t = type_line.lower()
    if "country-code" in t or "cctld" in t:
        return "ccTLD"
    if "generic" in t or "gtld" in t:
        return "gTLD"
    if "sponsored" in t:
        return "sTLD"
    if "infrastructure" in t:
        return "infrastructure"
    return "other"


def default_restrictions(tld_type: str) -> dict[str, Any]:
    """Registry-level LDH norms (not registrar-specific policies)."""
    return {
        "minLength": 1 if tld_type == "gTLD" else 2,
        "maxLength": 63,
        "canUse": "Letters (a–z), numbers (0–9), and hyphens (not first/last or consecutive in restricted cases)",
        "cannotUse": "Special characters (e.g. & # @) in standard LDH labels",
        "idns": "Varies by registry — check IDN support with the registry or your registrar",
        "note": "Character rules below follow common ICANN LDH conventions. Individual registries and registrars may impose extra eligibility, length, or residency rules.",
    }


def default_features() -> dict[str, str]:
    return {
        "registrationLength": "Typically 1–10 years (registry policy varies)",
        "renewalLength": "Typically 1–10 years (registry policy varies)",
        "autoRenew": "Depends on registrar settings",
        "backorders": "Registrar-dependent",
        "transfersIn": "Supported for most ICANN gTLDs via Auth/EPP code; ccTLDs vary",
        "transfersOut": "Supported when the registry allows EPP transfers",
        "transferLock": "Supported on most gTLDs (clientTransferProhibited)",
        "domainPrivacy": "Registrar WHOIS/RDAP privacy — not set by IANA",
        "domainProtection": "Registrar add-on",
        "contactUpdates": "Supported via registrar",
        "note": "Operational features (privacy, parking, protection) are registrar-level, not defined by the IANA root zone record.",
    }


def build_about(tld: str, tld_type: str, manager: str | None, country_hint: str | None) -> str:
    label = tld.upper()
    if tld_type == "ccTLD":
        place = country_hint or "its designated country or territory"
        mgr = manager or "the national registry operator"
        return (
            f"{label} is a country-code top-level domain (ccTLD) in the DNS root zone. "
            f"It is designated for {place}. The IANA root zone lists the registry manager as "
            f"{mgr}. Registration policies (who may register, local presence, pricing) are set by "
            f"the registry and its accredited registrars — not by IANA."
        )
    if tld_type == "gTLD":
        mgr = manager or "the contracted registry operator"
        return (
            f"{label} is a generic top-level domain (gTLD) delegated in the DNS root zone. "
            f"The registry operator responsible for {label} is listed by IANA as {mgr}. "
            f"Anyone can typically register a {label} name through an accredited registrar, "
            f"subject to the registry’s registration policy and ICANN consensus policies."
        )
    return (
        f"{label} is a top-level domain delegated in the IANA root zone. "
        f"See the official IANA delegation record for manager and technical contacts."
    )


def _wiki_extract_ok(extract: str) -> bool:
    e = extract.strip()
    if len(e) < 40:
        return False
    low = e.lower()
    if "may refer to" in low or "disambiguation" in low:
        return False
    return True


# Shared throttle for Wikipedia REST (they rate-limit aggressively).
_WIKI_MIN_INTERVAL = 0.85
_wiki_last_call = 0.0


def _wiki_throttle() -> None:
    global _wiki_last_call
    now = time.time()
    wait = _WIKI_MIN_INTERVAL - (now - _wiki_last_call)
    if wait > 0:
        time.sleep(wait)
    _wiki_last_call = time.time()


def wikipedia_summary(scraper: cloudscraper.CloudScraper, slug: str) -> str | None:
    """Fetch a Wikipedia extract for a TLD, trying a few high-hit titles with rate limits."""
    headers = {
        "Accept": "application/json",
        # Identify the bot clearly — Wikipedia requires a descriptive UA.
        "User-Agent": "DomainDiscoveryTldBot/1.0 (educational TLD encyclopedia; contact: local-dev)",
    }
    # One primary title first (fewest API hits). Optional second title only for short
    # apex codes where disambiguation is common.
    candidates = [f".{slug}"]
    if len(slug) <= 3 and slug.count(".") == 0:
        candidates.append(f".{slug} (top-level domain)")

    def fetch_summary(title: str) -> str | None:
        for attempt in range(3):
            try:
                _wiki_throttle()
                url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{title.replace(' ', '_')}"
                r = scraper.get(url, timeout=20, headers=headers)
                if r.status_code == 429:
                    time.sleep(4.0 * (attempt + 1))
                    continue
                if r.status_code == 404:
                    return None
                if r.status_code != 200:
                    return None
                data = r.json()
                if data.get("type") == "standard" and data.get("extract"):
                    extract = data["extract"].strip()
                    if not _wiki_extract_ok(extract):
                        return None
                    low = extract.lower()
                    if any(
                        k in low
                        for k in (
                            "top-level",
                            "tld",
                            "domain",
                            "dns",
                            "internet",
                            "registry",
                            "icann",
                            "country code",
                            "cctld",
                            "gtld",
                        )
                    ):
                        return extract
                    if title.startswith("."):
                        return extract
                return None
            except Exception:
                time.sleep(1.0)
                continue
        return None

    for title in candidates:
        extract = fetch_summary(title)
        if extract:
            return extract
    return None


def scrape_one(scraper: cloudscraper.CloudScraper, slug: str, with_wiki: bool) -> dict[str, Any]:
    url = IANA_PAGE.format(slug=slug)
    html = scraper.get(url, timeout=40).text
    soup = BeautifulSoup(html, "lxml")

    h1 = soup.find("h1")
    title = h1.get_text(" ", strip=True) if h1 else f"Delegation Record for .{slug.upper()}"
    type_line = ""
    if h1:
        p = h1.find_next("p")
        if p:
            type_line = p.get_text(" ", strip=True)

    # HTML comment sometimes has designation text
    comment_match = re.search(r"<!--\s*\(([^)]+)\)\s*-->", html)
    designation = comment_match.group(1).strip() if comment_match else type_line.strip("()")

    blocks = section_blocks(soup)
    registry = parse_registry_info(blocks.get("Registry Information", ""))
    contacts = parse_contacts(blocks)
    nameservers = parse_nameservers(soup)
    tld_type = classify_type(type_line or designation)

    manager = contacts.get("manager") or contacts.get("ccTLD Manager") or contacts.get("Sponsoring Organization")
    manager_short = None
    if manager:
        manager_short = manager.split("\n")[0].strip()

    country_hint = None
    if designation and "for " in designation.lower():
        country_hint = designation.split("for ", 1)[-1].strip()

    wiki = wikipedia_summary(scraper, slug) if with_wiki else None

    about = build_about(f".{slug}", tld_type, manager_short, country_hint)
    if wiki:
        about = f"{about}\n\n{wiki}"

    tld = f".{slug}"
    return {
        "tld": tld,
        "slug": slug,
        "title": f"About {tld} domains",
        "delegationTitle": title,
        "type": tld_type,
        "typeLabel": type_line.strip("()") or tld_type,
        "designation": designation,
        "sponsor": manager_short,
        "sponsorDetail": manager,
        "administrativeContact": contacts.get("Administrative Contact"),
        "technicalContact": contacts.get("Technical Contact"),
        "registryUrl": registry.get("registryUrl"),
        "whoisServer": registry.get("whoisServer"),
        "rdapServer": registry.get("rdapServer"),
        "registrationDate": registry.get("registrationDate"),
        "recordUpdated": registry.get("recordUpdated"),
        "nameServers": nameservers,
        "about": about,
        "whoCanRegister": (
            "Eligibility is defined by the registry operator and its registrars. "
            "Most gTLDs are open to anyone worldwide. Many ccTLDs are also open globally; "
            "some require local presence, citizenship, or trademark rights. Always confirm "
            "current policy with the registry or your registrar."
        ),
        "registrationRestrictions": default_restrictions(tld_type),
        "features": default_features(),
        "source": "IANA Root Zone Database",
        "sourceUrl": url,
        "wikipedia": wiki,
        "scrapedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }


def write_index(entries: list[dict[str, Any]]) -> None:
    catalog = []
    for e in entries:
        catalog.append(
            {
                "tld": e["tld"],
                "slug": e["slug"],
                "type": e["type"],
                "typeLabel": e.get("typeLabel"),
                "sponsor": e.get("sponsor"),
                "title": e.get("title"),
            }
        )
    INDEX_PATH.write_text(
        json.dumps(
            {
                "generatedAt": time.strftime("%Y-%m-%d"),
                "count": len(catalog),
                "source": IANA_DB,
                "extensions": catalog,
            },
            ensure_ascii=True,
            indent=2,
        )
    )


def _wiki_batch_extracts(
    scraper: cloudscraper.CloudScraper,
    titles: list[str],
) -> dict[str, str]:
    """Fetch plain-text intro extracts for many titles in one MediaWiki call.

    Uses urllib (not cloudscraper) so connect/read timeouts are reliably enforced.
    """
    import urllib.error
    import urllib.request
    from urllib.parse import quote

    joined = "|".join(titles)
    url = (
        "https://en.wikipedia.org/w/api.php"
        f"?action=query&prop=extracts&exintro=1&explaintext=1&redirects=1"
        f"&format=json&titles={quote(joined, safe='|')}"
    )
    headers = {
        "User-Agent": "DomainDiscoveryTldBot/1.0 (educational TLD encyclopedia; local-dev)",
        "Accept": "application/json",
    }

    import socket

    # Hard global socket timeout (macOS urllib can ignore per-call timeout on DNS).
    prev_timeout = socket.getdefaulttimeout()
    socket.setdefaulttimeout(18)
    try:
        for attempt in range(3):
            try:
                req = urllib.request.Request(url, headers=headers)
                with urllib.request.urlopen(req, timeout=18) as resp:
                    raw = resp.read().decode("utf-8", errors="replace")
                data = json.loads(raw)
                pages = (data.get("query") or {}).get("pages") or {}
                redirects = {
                    item["from"]: item["to"]
                    for item in (data.get("query") or {}).get("redirects") or []
                }
                normalized = {
                    item["from"]: item["to"]
                    for item in (data.get("query") or {}).get("normalized") or []
                }
                by_title: dict[str, str] = {}
                for page in pages.values():
                    if "missing" in page:
                        continue
                    title = page.get("title") or ""
                    extract = (page.get("extract") or "").strip()
                    if not _wiki_extract_ok(extract):
                        continue
                    if title.lower().startswith("list of") and "top-level" in title.lower():
                        continue
                    low = extract.lower()
                    if not any(
                        k in low
                        for k in (
                            "top-level",
                            "tld",
                            "domain",
                            "dns",
                            "internet",
                            "registry",
                            "icann",
                            "country code",
                            "cctld",
                            "gtld",
                        )
                    ):
                        continue
                    by_title[title] = extract

                out: dict[str, str] = {}
                for req_title in titles:
                    cur = req_title
                    for _ in range(4):
                        if cur in normalized:
                            cur = normalized[cur]
                            continue
                        if cur in redirects:
                            cur = redirects[cur]
                            continue
                        break
                    if cur in by_title:
                        out[req_title] = by_title[cur]
                    elif req_title in by_title:
                        out[req_title] = by_title[req_title]
                return out
            except urllib.error.HTTPError as exc:
                if exc.code == 429:
                    time.sleep(8 * (attempt + 1))
                else:
                    print(f"  (wiki HTTP {exc.code})", flush=True)
                    time.sleep(1.5)
            except Exception as exc:  # noqa: BLE001
                print(f"  (wiki batch request error: {exc})", flush=True)
                time.sleep(2 * (attempt + 1))
        return {}
    finally:
        socket.setdefaulttimeout(prev_timeout)


def enrich_missing_wikipedia(delay: float = 0.25, limit: int = 0, priority_first: bool = True) -> None:
    """Fill Wikipedia extracts on existing about pages that lack them (no IANA re-fetch).

    Uses the MediaWiki Action API in batches (much fewer requests than REST summary).
    """
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    scraper = make_scraper()
    files = sorted(OUT_DIR.glob("*.json"))
    files = [p for p in files if p.name != "index.json"]

    def sort_key(path: Path) -> tuple[int, str]:
        slug = path.stem
        if priority_first and slug in PRIORITY:
            return (0, PRIORITY.index(slug) if slug in PRIORITY else 0)
        return (1, slug)

    files.sort(key=sort_key)

    # Build work list of (path, slug) needing wiki
    work: list[tuple[Path, str, dict[str, Any]]] = []
    skipped = 0
    for path in files:
        try:
            data = json.loads(path.read_text())
        except Exception:
            continue
        existing = data.get("wikipedia")
        if isinstance(existing, str) and len(existing.strip()) > 40:
            skipped += 1
            continue
        if isinstance(existing, dict) and (existing.get("summary") or existing.get("extract")):
            skipped += 1
            continue
        if data.get("wikiCheckedAt") and not existing:
            skipped += 1
            continue
        slug = data.get("slug") or path.stem
        work.append((path, slug, data))

    if limit > 0:
        work = work[:limit]

    print(f"Wiki enrich (batch): {len(work)} to check · {skipped} already done…", flush=True)
    updated = 0
    missed = 0
    batch_size = 12
    now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    for start in range(0, len(work), batch_size):
        batch = work[start : start + batch_size]
        titles = [f".{slug}" for _, slug, _ in batch]
        batch_num = start // batch_size + 1
        print(f"  … fetching batch {batch_num} ({len(titles)} titles)", flush=True)
        extracts = _wiki_batch_extracts(scraper, titles)

        for path, slug, data in batch:
            title = f".{slug}"
            wiki = extracts.get(title)
            data["wikiCheckedAt"] = now
            if not wiki:
                data["wikipedia"] = None
                path.write_text(json.dumps(data, ensure_ascii=True, indent=2))
                missed += 1
                print(f"  .{slug}: no wiki", flush=True)
                continue
            data["wikipedia"] = wiki
            about = data.get("about") or ""
            if wiki not in about:
                data["about"] = f"{about}\n\n{wiki}".strip() if about else wiki
            data["wikiEnrichedAt"] = now
            path.write_text(json.dumps(data, ensure_ascii=True, indent=2))
            updated += 1
            print(f"  .{slug}: wiki OK ({len(wiki)} chars)", flush=True)

        print(
            f"  ↳ batch {batch_num}: "
            f"updated={updated} missed={missed} of {len(work)}",
            flush=True,
        )
        # Cool down more often to avoid Wikipedia stalling mid-run
        pause = max(delay, 0.5)
        if batch_num % 5 == 0:
            pause = max(pause, 2.5)
        time.sleep(pause)

    entries = []
    for p in OUT_DIR.glob("*.json"):
        if p.name == "index.json":
            continue
        try:
            entries.append(json.loads(p.read_text()))
        except Exception:
            pass
    write_index(entries)
    print(
        f"Wiki enrich done. updated={updated} missed={missed} skipped={skipped} total_pages={len(entries)}",
        flush=True,
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Scrape IANA TLD about data")
    parser.add_argument("--all", action="store_true", help="Scrape entire IANA root DB")
    parser.add_argument("--priority-only", action="store_true", help="Only PRIORITY list")
    parser.add_argument("--limit", type=int, default=0, help="Max TLDs (0 = no extra cap beyond mode)")
    parser.add_argument("--delay", type=float, default=0.4)
    parser.add_argument("--resume", action="store_true")
    parser.add_argument("--wiki", action="store_true", help="Enrich with Wikipedia summaries (slower)")
    parser.add_argument(
        "--wiki-only",
        action="store_true",
        help="Only fill missing Wikipedia on existing about JSON files (no IANA re-scrape)",
    )
    args = parser.parse_args()

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    if args.wiki_only:
        enrich_missing_wikipedia(delay=args.delay, limit=args.limit)
        return

    scraper = make_scraper()

    if args.priority_only:
        slugs = list(PRIORITY)
    else:
        print("Discovering IANA root zone TLDs…")
        slugs = discover_slugs(scraper)
        print(f"  {len(slugs)} TLDs in IANA DB")
        if not args.all and args.limit <= 0:
            # default: priority + first 200 others
            extras = [s for s in slugs if s not in PRIORITY][:200]
            slugs = list(dict.fromkeys(PRIORITY + extras))
        elif args.limit > 0:
            slugs = slugs[: args.limit]

    print(f"Scraping {len(slugs)} TLD about pages (wiki={args.wiki})…")
    entries: list[dict[str, Any]] = []
    failed: list[str] = []

    for i, slug in enumerate(slugs, start=1):
        out_path = OUT_DIR / f"{slug}.json"
        if args.resume and out_path.exists():
            try:
                entries.append(json.loads(out_path.read_text()))
                print(f"[{i:04d}/{len(slugs)}] .{slug}: resume")
                continue
            except Exception:
                pass
        try:
            data = scrape_one(scraper, slug, with_wiki=args.wiki)
            out_path.write_text(json.dumps(data, ensure_ascii=True, indent=2))
            entries.append(data)
            print(
                f"[{i:04d}/{len(slugs)}] .{slug}: {data['type']} · {data.get('sponsor') or '—'}",
                flush=True,
            )
        except Exception as exc:  # noqa: BLE001
            failed.append(slug)
            print(f"[{i:04d}/{len(slugs)}] .{slug}: FAILED ({exc})", flush=True)
        time.sleep(args.delay)

        if i % 50 == 0:
            write_index(entries)
            print(f"  ↳ index checkpoint ({len(entries)} entries)", flush=True)

    write_index(entries)
    print(f"Done. {len(entries)} about pages · failed {len(failed)}")
    print(f"Index → {INDEX_PATH}")
    if failed[:20]:
        print("Failed sample:", failed[:20])


if __name__ == "__main__":
    main()
