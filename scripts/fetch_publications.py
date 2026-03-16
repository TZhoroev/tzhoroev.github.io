#!/usr/bin/env python3
"""
Fetch publications from Google Scholar and save to JSON.
Uses the scholarly library to scrape Google Scholar data.
"""

import json
from scholarly import scholarly

SCHOLAR_ID = "ShuoePgAAAAJ"  # Your Google Scholar ID

def fetch_publications():
    """Fetch all publications for the author."""
    try:
        # Search for author by ID
        author = scholarly.search_author_id(SCHOLAR_ID)
        author = scholarly.fill(author, sections=['publications'])
        
        publications = []
        for pub in author.get('publications', []):
            # Fill in publication details
            try:
                pub_filled = scholarly.fill(pub)
            except:
                pub_filled = pub
            
            pub_data = {
                'title': pub_filled.get('bib', {}).get('title', ''),
                'authors': pub_filled.get('bib', {}).get('author', ''),
                'venue': pub_filled.get('bib', {}).get('journal', '') or pub_filled.get('bib', {}).get('venue', '') or pub_filled.get('bib', {}).get('conference', ''),
                'year': pub_filled.get('bib', {}).get('pub_year', ''),
                'citations': pub_filled.get('num_citations', 0),
                'url': pub_filled.get('pub_url', ''),
            }
            
            # Only add if we have a title
            if pub_data['title']:
                publications.append(pub_data)
        
        # Sort by year (newest first), then by citations
        publications.sort(key=lambda x: (-(int(x['year']) if x['year'] else 0), -x['citations']))
        
        # Get total citations
        total_citations = author.get('citedby', 0)
        h_index = author.get('hindex', 0)
        
        result = {
            'total_citations': total_citations,
            'h_index': h_index,
            'publications': publications,
            'last_updated': None  # Will be set with current date
        }
        
        # Set last_updated to today
        from datetime import date
        result['last_updated'] = date.today().isoformat()
        
        return result
        
    except Exception as e:
        print(f"Error fetching publications: {e}")
        return None

def main():
    print("Fetching publications from Google Scholar...")
    data = fetch_publications()
    
    if data:
        with open('publications.json', 'w') as f:
            json.dump(data, f, indent=2)
        print(f"Successfully saved {len(data['publications'])} publications")
        print(f"Total citations: {data['total_citations']}, h-index: {data['h_index']}")
    else:
        print("Failed to fetch publications")
        exit(1)

if __name__ == "__main__":
    main()
