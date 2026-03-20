#!/usr/bin/env python3
from __future__ import annotations

import json
import math
import re
import statistics
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import cloudscraper
from bs4 import BeautifulSoup


ROOT = Path(__file__).resolve().parents[1]
DATASET_PATH = ROOT / "src/data/tld-price-comparison.json"

TOP_REGISTRARS = [
    "Spaceship",
    "GoDaddy",
    "Namecheap",
    "Porkbun",
    "Dynadot",
    "NameSilo",
    "Sav",
    "Cloudflare",
    "Hostinger",
    "Unstoppable Domains",
]

PRICE_HEADERS = ["Registrar", "Registration", "Renew", "Transfer", "WHOIS Privacy"]
MONEY_RE = re.compile(r"\$([0-9]+(?:\.[0-9]+)?)")
REGULAR_PRICE_RE = re.compile(r"Regular price\s*\$([0-9]+(?:\.[0-9]+)?)", re.I)
REVIEW_RE = re.compile(r"\((\d+)\)")
RATING_RE = re.compile(r"([0-9]+(?:\.[0-9]+)?) out of 5 stars", re.I)


@dataclass
class PriceCell:
    value: float | None
    display: str | None

    def as_json(self) -> dict[str, Any]:
        return {"value": self.value, "display": self.display, "hasPromo": False}


def load_existing() -> dict[str, Any]:
    return json.loads(DATASET_PATH.read_text())


def make_scraper() -> cloudscraper.CloudScraper:
    return cloudscraper.create_scraper(browser={"browser": "chrome", "platform": "darwin", "mobile": False})


def normalize_space(value: str) -> str:
    return " ".join(value.replace("\xa0", " ").split())


def money_from_text(value: str) -> tuple[float | None, str | None]:
    regular = REGULAR_PRICE_RE.search(value)
    if regular:
        numeric = float(regular.group(1))
        return numeric, f"${numeric:.2f}"

    matches = MONEY_RE.findall(value)
    if matches:
        numeric = float(matches[0])
        return numeric, f"${numeric:.2f}"

    return None, None


def parse_price_cell(td) -> PriceCell:
    text = normalize_space(td.get_text(" ", strip=True))
    if not text:
        return PriceCell(None, None)
    if "Unsupported" in text:
        return PriceCell(None, "Unsupported")

    numeric, display = money_from_text(text)
    return PriceCell(numeric, display)


def parse_registrar_name(td) -> str:
    anchor = td.find("a", title=True)
    if anchor and anchor.get("title"):
        return normalize_space(anchor["title"])

    itemprop_name = td.select_one('[itemprop="name"]')
    if itemprop_name:
        return normalize_space(itemprop_name.get_text(" ", strip=True))

    text = normalize_space(td.get_text(" ", strip=True))
    for registrar in TOP_REGISTRARS:
        if text.lower().startswith(registrar.lower()):
            return registrar
    return text


def parse_rating(td) -> tuple[float | None, int | None]:
    title = ""
    rating_el = td.find(title=True)
    if rating_el and rating_el.get("title"):
        title = normalize_space(rating_el["title"])

    rating = None
    if title:
        match = RATING_RE.search(title)
        if match:
            rating = float(match.group(1))

    review_count = None
    review_el = td.select_one(".review-count")
    if review_el:
        match = REVIEW_RE.search(review_el.get_text(" ", strip=True))
        if match:
            review_count = int(match.group(1))

    return rating, review_count


def parse_list_items(td) -> list[str]:
    items = [normalize_space(li.get_text(" ", strip=True)) for li in td.find_all("li")]
    return [item for item in items if item]


def find_pricing_table(soup: BeautifulSoup):
    for table in soup.find_all("table"):
        headers = [normalize_space(th.get_text(" ", strip=True)) for th in table.find_all("th")]
        if headers[:5] == PRICE_HEADERS:
            return table
    raise RuntimeError("Could not find registrar pricing table")


def parse_score(td) -> float | None:
    text = normalize_space(td.get_text(" ", strip=True))
    if not text:
        return None
    match = re.search(r"([0-9]+(?:\.[0-9]+)?)$", text)
    return float(match.group(1)) if match else None


def safe_mean(values: list[float]) -> float | None:
    return round(sum(values) / len(values), 2) if values else None


def safe_median(values: list[float]) -> float | None:
    return round(float(statistics.median(values)), 2) if values else None


def summarize_prices(offers: list[dict[str, Any]], key: str) -> dict[str, Any]:
    valid = [offer for offer in offers if offer[key]["value"] is not None]
    if not valid:
        return {"registrar": None, "price": None, "value": None}
    best = min(valid, key=lambda offer: offer[key]["value"])
    return {
        "registrar": best["registrar"],
        "price": best[key]["display"],
        "value": best[key]["value"],
    }


def summarize_best_value(offers: list[dict[str, Any]]) -> dict[str, Any]:
    valid = [offer for offer in offers if offer["score"] is not None]
    if not valid:
        return {"registrar": None, "score": None, "registration": None}
    best = max(valid, key=lambda offer: offer["score"])
    return {
        "registrar": best["registrar"],
        "score": best["score"],
        "registration": best["registration"]["display"],
    }


def parse_tld_page(scraper: cloudscraper.CloudScraper, source_url: str) -> tuple[list[dict[str, Any]], int]:
    html = scraper.get(source_url, timeout=45).text
    soup = BeautifulSoup(html, "lxml")
    pricing_table = find_pricing_table(soup)

    offers_by_registrar: dict[str, dict[str, Any]] = {}
    full_row_count = 0

    for tr in pricing_table.find_all("tr")[1:]:
        tds = tr.find_all("td")
        if len(tds) < 10:
            continue
        full_row_count += 1
        registrar = parse_registrar_name(tds[0])
        if registrar not in TOP_REGISTRARS:
            continue

        rating, review_count = parse_rating(tds[7])
        offers_by_registrar[registrar] = {
            "registrar": registrar,
            "url": None,
            "registration": parse_price_cell(tds[1]).as_json(),
            "renewal": parse_price_cell(tds[2]).as_json(),
            "transfer": parse_price_cell(tds[3]).as_json(),
            "whoisPrivacy": parse_price_cell(tds[4]).as_json(),
            "taxAndFees": normalize_space(tds[5].get_text(" ", strip=True)) or None,
            "features": parse_list_items(tds[6]),
            "rating": rating,
            "reviewCount": review_count,
            "payments": parse_list_items(tds[8]),
            "score": parse_score(tds[9]),
        }

    ordered_offers = [offers_by_registrar[registrar] for registrar in TOP_REGISTRARS if registrar in offers_by_registrar]
    return ordered_offers, full_row_count


def build_entry(existing_entry: dict[str, Any], offers: list[dict[str, Any]], full_row_count: int) -> dict[str, Any]:
    reg_values = [offer["registration"]["value"] for offer in offers if offer["registration"]["value"] is not None]
    renew_values = [offer["renewal"]["value"] for offer in offers if offer["renewal"]["value"] is not None]
    transfer_values = [offer["transfer"]["value"] for offer in offers if offer["transfer"]["value"] is not None]

    return {
        "tld": existing_entry["tld"],
        "sourceUrl": existing_entry["sourceUrl"],
        "registrarCount": full_row_count,
        "pricingSummary": {
            "Wholesale Prices": {
                "registration": None,
                "renewal": None,
                "transfer": None,
            },
            "Average Registrar Prices": {
                "registration": safe_mean(reg_values),
                "renewal": safe_mean(renew_values),
                "transfer": safe_mean(transfer_values),
            },
            "Median Registrar Prices": {
                "registration": safe_median(reg_values),
                "renewal": safe_median(renew_values),
                "transfer": safe_median(transfer_values),
            },
        },
        "cheapestRegistration": summarize_prices(offers, "registration"),
        "cheapestRenewal": summarize_prices(offers, "renewal"),
        "cheapestTransfer": summarize_prices(offers, "transfer"),
        "bestValue": summarize_best_value(offers),
        "registrars": offers,
    }


def main() -> None:
    raw = load_existing()
    scraper = make_scraper()

    refreshed: list[dict[str, Any]] = []
    failed: list[str] = []

    for index, entry in enumerate(raw["extensions"], start=1):
        tld = entry["tld"]
        try:
            offers, full_row_count = parse_tld_page(scraper, entry["sourceUrl"])
            refreshed.append(build_entry(entry, offers, full_row_count))
            print(f"[{index:03d}/{len(raw['extensions'])}] {tld}: {len(offers)} top-10 matches / {full_row_count} listed registrars")
            time.sleep(0.2)
        except Exception as exc:  # noqa: BLE001
            failed.append(tld.lstrip("."))
            refreshed.append(entry)
            print(f"[{index:03d}/{len(raw['extensions'])}] {tld}: FAILED ({exc})")

    output = {
        "generatedAt": time.strftime("%Y-%m-%d"),
        "sourceName": raw["sourceName"],
        "sourceUrl": raw["sourceUrl"],
        "extensionCount": len(refreshed),
        "extensions": refreshed,
        "failedExtensions": failed,
    }

    DATASET_PATH.write_text(json.dumps(output, ensure_ascii=True, separators=(",", ":")))
    print(f"Updated {DATASET_PATH}")
    print(f"Failed extensions: {failed}")


if __name__ == "__main__":
    main()
