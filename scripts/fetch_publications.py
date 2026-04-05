#!/usr/bin/env python3
"""Fetch publication metrics from Semantic Scholar API and merge with curated seed data."""

import json
import time
import urllib.request
import urllib.parse
import urllib.error
from datetime import date

SEED_FILE = "publications-seed.json"
OUTPUT_FILE = "publications.json"
API_BASE = "https://api.semanticscholar.org/graph/v1"


def search_paper(title):
    """Search for a paper by title on Semantic Scholar."""
    query = urllib.parse.quote(title)
    url = f"{API_BASE}/paper/search?query={query}&limit=3&fields=citationCount,externalIds,url,title"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "AcademicWebsite/1.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read())
            if data.get("data"):
                # Find best match by title similarity
                for paper in data["data"]:
                    if paper.get("title", "").lower().strip() == title.lower().strip():
                        return paper
                # Fallback to first result
                return data["data"][0]
    except Exception as e:
        print(f"  Warning: Could not fetch '{title[:50]}...': {e}")
    return None


def calculate_h_index(citation_counts):
    """Calculate h-index from a list of citation counts."""
    sorted_counts = sorted(citation_counts, reverse=True)
    h = 0
    for i, c in enumerate(sorted_counts):
        if c >= i + 1:
            h = i + 1
        else:
            break
    return h


def main():
    print("Loading seed publications...")
    try:
        with open(SEED_FILE) as f:
            seed = json.load(f)
    except FileNotFoundError:
        print(f"Error: {SEED_FILE} not found. Create it first.")
        exit(1)

    # Load existing output for validation comparison
    try:
        with open(OUTPUT_FILE) as f:
            existing = json.load(f)
        old_total = existing.get("total_citations", 0)
    except (FileNotFoundError, json.JSONDecodeError):
        old_total = 0

    publications = seed.get("publications", [])
    total_citations = 0
    citation_counts = []

    for pub in publications:
        title = pub.get("title", "")
        print(f"  Searching: {title[:60]}...")

        result = search_paper(title)
        if result and result.get("citationCount") is not None:
            pub["citations"] = result["citationCount"]
            print(f"    Found: {pub['citations']} citations")
        else:
            print(f"    Not found, keeping seed value: {pub.get('citations', 0)}")

        total_citations += pub.get("citations", 0)
        citation_counts.append(pub.get("citations", 0))
        time.sleep(1)  # Rate limit

    h_index = calculate_h_index(citation_counts)

    # Validation gate
    if old_total > 0 and total_citations < old_total * 0.85:
        print(f"VALIDATION FAILED: Citations dropped from {old_total} to {total_citations} (>15% drop)")
        print("Keeping existing publications.json")
        exit(1)

    # Sort by year desc, then citations desc
    publications.sort(key=lambda x: (-(int(x.get("year", 0)) if x.get("year") else 0), -x.get("citations", 0)))

    output = {
        "total_citations": total_citations,
        "h_index": h_index,
        "publications": publications,
        "source": "Semantic Scholar API + manual curation",
        "last_updated": date.today().isoformat()
    }

    with open(OUTPUT_FILE, "w") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"\nSaved {len(publications)} publications")
    print(f"Total citations: {total_citations}, h-index: {h_index}")


if __name__ == "__main__":
    main()
