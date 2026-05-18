"""
QRServe Restaurant Scraper
Scrapes a restaurant website and outputs a client JSON file
ready to import into the QRServe Onboarding Tracker.

Usage:
  python scrape_client.py https://restaurantwebsite.com
  python scrape_client.py https://restaurantwebsite.com --out my_client.json

Output:
  client.json  (import this into the onboarding tracker via Import JSON)
"""

import sys
import json
import re
import time
import os
import argparse
from datetime import datetime
from urllib.parse import urljoin, urlparse

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    os.system("pip install requests beautifulsoup4 --break-system-packages -q")
    import requests
    from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}

def fetch(url):
    try:
        r = requests.get(url, headers=HEADERS, timeout=15)
        r.raise_for_status()
        return BeautifulSoup(r.text, "html.parser")
    except Exception as e:
        print(f"  Could not fetch {url}: {e}")
        return None

def clean(text):
    return re.sub(r"\s+", " ", text or "").strip()

def extract_phone(text):
    match = re.search(r"(\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4})", text)
    return match.group(1) if match else ""

def extract_email(text):
    match = re.search(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}", text)
    return match.group(0) if match else ""

def extract_address(soup):
    # Look for schema.org address
    addr = soup.find(attrs={"itemprop": "streetAddress"})
    if addr:
        return clean(addr.get_text())
    # Look for common address patterns
    text = soup.get_text()
    match = re.search(r"\d+\s+[\w\s]+(?:St|Ave|Blvd|Dr|Rd|Way|Ln|Ct|Pl|Pkwy)[^\n,]*,\s*[\w\s]+,\s*[A-Z]{2}\s*\d{5}", text)
    if match:
        return clean(match.group(0))
    return ""

def extract_name(soup, url):
    # Try og:site_name first
    og = soup.find("meta", property="og:site_name")
    if og and og.get("content"):
        return clean(og["content"])
    # Try title
    title = soup.find("title")
    if title:
        t = clean(title.get_text())
        # Remove common suffixes
        for suffix in [" | Home", " - Home", " | Restaurant", " | Menu", " | Order Online"]:
            t = t.replace(suffix, "")
        return t
    # Fall back to domain name
    domain = urlparse(url).netloc.replace("www.", "")
    return domain.split(".")[0].title()

def extract_cuisine(soup, url):
    text = (soup.get_text() + " " + url).lower()
    cuisines = {
        "eritrean": "Eritrean",
        "ethiopian": "Ethiopian",
        "italian": "Italian",
        "mexican": "Mexican",
        "chinese": "Chinese",
        "japanese": "Japanese",
        "thai": "Thai",
        "indian": "Indian",
        "american": "American",
        "mediterranean": "Mediterranean",
        "french": "French",
        "greek": "Greek",
        "vietnamese": "Vietnamese",
        "korean": "Korean",
        "cafe": "Cafe",
        "pizza": "Pizza",
        "burger": "Burgers",
        "sushi": "Sushi",
        "seafood": "Seafood",
        "bbq": "BBQ",
    }
    found = [v for k, v in cuisines.items() if k in text]
    return " / ".join(found[:3]) if found else ""

def extract_rating(soup):
    # Schema.org rating
    rating = soup.find(attrs={"itemprop": "ratingValue"})
    count  = soup.find(attrs={"itemprop": "reviewCount"})
    if rating:
        r = clean(rating.get_text())
        c = f" ({clean(count.get_text())} reviews)" if count else ""
        return f"{r}⭐{c}"
    # Look for patterns like 4.4/5 or 4.4 stars
    text = soup.get_text()
    match = re.search(r"(\d\.\d)\s*(?:out of 5|stars?|/5)", text, re.IGNORECASE)
    if match:
        return f"{match.group(1)} ⭐"
    return ""

def extract_menu_count(soup):
    # Count price occurrences as proxy for menu items
    text = soup.get_text()
    prices = re.findall(r"\$\s*\d+\.?\d{0,2}", text)
    count = len(set(prices))  # rough unique count
    return str(count) if count > 3 else ""

def extract_hours(soup):
    text = soup.get_text()
    # Look for day patterns
    match = re.search(
        r"(Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*[\s\-–]+\d{1,2}(?::\d{2})?\s*(?:am|pm)[^\n]*",
        text, re.IGNORECASE
    )
    return clean(match.group(0)) if match else ""

def find_contact_page(base_url, soup):
    for a in soup.find_all("a", href=True):
        href = a["href"].lower()
        text = clean(a.get_text()).lower()
        if any(k in href or k in text for k in ["contact", "about", "reach"]):
            full = urljoin(base_url, a["href"])
            if urlparse(full).netloc == urlparse(base_url).netloc:
                return full
    return None

def scrape_client(url):
    if not url.startswith("http"):
        url = "https://" + url

    print(f"\nScraping: {url}")
    soup = fetch(url)
    if not soup:
        return None

    full_text = soup.get_text()

    name    = extract_name(soup, url)
    phone   = extract_phone(full_text)
    email   = extract_email(full_text)
    address = extract_address(soup)
    cuisine = extract_cuisine(soup, url)
    rating  = extract_rating(soup)

    # Try contact page for more info
    if not phone or not email:
        contact_url = find_contact_page(url, soup)
        if contact_url and contact_url != url:
            print(f"  Checking contact page: {contact_url}")
            contact_soup = fetch(contact_url)
            if contact_soup:
                ct = contact_soup.get_text()
                if not phone:   phone   = extract_phone(ct)
                if not email:   email   = extract_email(ct)
                if not address: address = extract_address(contact_soup)
            time.sleep(0.5)

    # City from address
    city = ""
    if address:
        parts = address.split(",")
        if len(parts) >= 2:
            city = parts[-2].strip() + "," + parts[-1].strip()
            city = city.strip()

    domain = urlparse(url).netloc.replace("www.", "")

    client = {
        "name":             name,
        "city":             city,
        "owner":            "",
        "email":            email,
        "phone":            phone,
        "website":          domain,
        "plan":             "starter",
        "source":           "cold",
        "language":         "",
        "cuisine":          cuisine,
        "rating":           rating,
        "address":          address,
        "business_id":      "",
        "owner_id":         "",
        "staff_pin":        "",
        "sub_status":       "",
        "trial_end":        "",
        "stripe_url":       "",
        "date_registered":  "",
        "date_live":        "",
        "menu_categories":  "",
        "menu_items":       "",
        "csv_file":         "",
        "menu_updated":     "",
        "followup":         "",
        "drive_folder":     "",
        "resource_notes":   "",
        "resources":        [
            {"type": "other", "url": url, "label": "Restaurant website"}
        ],
        "notes":            f"Scraped from {url} on {datetime.now().strftime('%Y-%m-%d')}. Review and fill in missing fields.",
        "steps":            {},
        "step_dates":       {},
        "tables":           [],
        "created":          datetime.now().isoformat() + "Z",
        "_open":            True,
        "_tab":             "checklist",
    }

    return client

def main():
    parser = argparse.ArgumentParser(description="QRServe Restaurant Scraper")
    parser.add_argument("url", help="Restaurant website URL")
    parser.add_argument("--out", default="client.json", help="Output JSON filename (default: client.json)")
    args = parser.parse_args()

    client = scrape_client(args.url)
    if not client:
        print("\n✗ Could not scrape the website.")
        print("  The site may use Cloudflare or JavaScript rendering.")
        print("  Fill in the client manually using the onboarding tracker.")
        sys.exit(1)

    # Wrap in array for direct import into tracker
    output = [client]
    output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), args.out)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"\n✓ Client saved to: {output_path}")
    print("\nExtracted:")
    print(f"  Name:    {client['name']}")
    print(f"  Phone:   {client['phone'] or '—'}")
    print(f"  Email:   {client['email'] or '—'}")
    print(f"  Address: {client['address'] or '—'}")
    print(f"  Cuisine: {client['cuisine'] or '—'}")
    print(f"  Rating:  {client['rating'] or '—'}")
    print(f"\nNext: Open the onboarding tracker → click Import JSON → select {args.out}")

if __name__ == "__main__":
    main()
