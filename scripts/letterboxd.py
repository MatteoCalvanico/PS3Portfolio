"""Refresh the static Cinema snapshot from Letterboxd's public diary RSS."""

import json
from pathlib import Path
import sys
from datetime import date, datetime, timezone
from email.utils import parsedate_to_datetime
from html.parser import HTMLParser
from urllib.parse import urlparse
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public/cinema/last-watched.json"
PROFILE = "https://letterboxd.com/matteocalvanico/"
PUBLISHED = "https://matteocalvanico.github.io/PS3Portfolio/cinema/last-watched.json"
NS = {"lb": "https://letterboxd.com"}


def safe_url(value, hosts):
    url = urlparse(value or "")
    return value if url.scheme == "https" and url.hostname in hosts else None


def parse_feed(xml):
    candidates = []
    for item in ET.fromstring(xml).findall("./channel/item"):
        title = item.findtext("lb:filmTitle", namespaces=NS)
        watched = item.findtext("lb:watchedDate", namespaces=NS)
        link = safe_url(item.findtext("link"), {"letterboxd.com"})
        if not title or not watched or not link:
            continue  # Lists and undated reviews are not diary entries.
        try:
            date.fromisoformat(watched)
        except ValueError:
            continue
        try:
            published = parsedate_to_datetime(item.findtext("pubDate", "")).timestamp()
        except (ValueError, TypeError, OverflowError):
            published = 0
        raw_rating = item.findtext("lb:memberRating", namespaces=NS)
        try:
            rating = float(raw_rating)
            if not (0.5 <= rating <= 5 and rating * 2 == int(rating * 2)):
                rating = None
        except (TypeError, ValueError):
            rating = None
        # Parse only the poster from the description; never render review HTML.
        poster = None
        class PosterParser(HTMLParser):
            def handle_starttag(self, tag, attrs):
                nonlocal poster
                if tag == "img" and poster is None:
                    poster = safe_url(dict(attrs).get("src"), {"a.ltrbxd.com"})

        PosterParser().feed(item.findtext("description", ""))
        movie = {
            "title": title,
            "year": item.findtext("lb:filmYear", namespaces=NS),
            "watchedDate": watched,
            "rating": rating,
            "poster": poster,
            "url": link,
        }
        candidates.append((watched, published, movie))
    if not candidates:
        raise ValueError("No dated diary entries found in Letterboxd RSS")
    return max(candidates, key=lambda entry: entry[:2])[2]


def download(url):
    request = Request(url, headers={"User-Agent": "MatteoPortfolio/1.0 (Letterboxd diary RSS)"})
    with urlopen(request, timeout=25) as response:
        return response.read()


def save(snapshot):
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    temporary = OUTPUT.with_suffix(".tmp")
    temporary.write_text(json.dumps(snapshot, indent=2, ensure_ascii=False) + "\n")
    temporary.replace(OUTPUT)


def valid_snapshot(snapshot):
    if not isinstance(snapshot, dict):
        return False
    film = snapshot.get("film")
    if not isinstance(film, dict) or not isinstance(snapshot.get("updatedAt"), str):
        return False
    try:
        datetime.fromisoformat(snapshot["updatedAt"])
        date.fromisoformat(film["watchedDate"])
        rating = film.get("rating")
        return (isinstance(film["title"], str) and bool(film["title"])
                and (film.get("year") is None or isinstance(film["year"], str))
                and (rating is None or isinstance(rating, (int, float))
                     and 0.5 <= rating <= 5 and rating * 2 == int(rating * 2))
                and safe_url(film["url"], {"letterboxd.com"}) is not None
                and (film.get("poster") is None or
                     safe_url(film["poster"], {"a.ltrbxd.com"}) is not None))
    except (KeyError, ValueError, TypeError):
        return False


def main():
    try:
        # An optional local feed supports reproducible/offline verification.
        xml = Path(sys.argv[1]).read_bytes() if len(sys.argv) > 1 else download(PROFILE + "rss/")
        movie = parse_feed(xml)
        save({"updatedAt": datetime.now(timezone.utc).isoformat(), "film": movie})
        print(f"Last watched: {movie['title']} ({movie['watchedDate']})")
    except Exception as error:
        print(f"Letterboxd refresh failed: {error}", file=sys.stderr)
        # A fresh Actions checkout may have an older snapshot than the live site.
        try:
            previous = json.loads(download(PUBLISHED))
            current = json.loads(OUTPUT.read_text()) if OUTPUT.exists() else {}
            if (valid_snapshot(previous) and
                    previous.get("updatedAt", "") > current.get("updatedAt", "")):
                save(previous)
        except Exception:
            pass
        if not OUTPUT.exists():
            save({"updatedAt": None, "film": None})
        print("Keeping the last available Cinema snapshot.")


if __name__ == "__main__":
    main()
