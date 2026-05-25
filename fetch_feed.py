import urllib.request
import xml.etree.ElementTree as ET
import json
import re

FEED_URL = 'https://outpostmedia.substack.com/feed'

print(f"Fetching {FEED_URL}...")
with urllib.request.urlopen(FEED_URL) as response:
    xml_content = response.read()

root = ET.fromstring(xml_content)
ns = {'content': 'http://purl.org/rss/1.0/modules/content/'}

items = []
for item in root.findall('.//item'):
    title       = item.findtext('title', '').strip()
    link        = item.findtext('link',  '').strip()
    pub_date    = item.findtext('pubDate', '').strip()
    description = item.findtext('description', '').strip()
    content_el  = item.find('content:encoded', ns)
    content     = content_el.text.strip() if content_el is not None and content_el.text else description

    # Thumbnail: try enclosure first, then first image in content
    enclosure = item.find('enclosure')
    thumbnail = enclosure.get('url', '') if enclosure is not None else ''
    if not thumbnail:
        match = re.search(r'src="(https://substackcdn[^"]+)"', content)
        if match:
            thumbnail = match.group(1)

    items.append({
        'title':       title,
        'link':        link,
        'pubDate':     pub_date,
        'description': description,
        'content':     content,
        'thumbnail':   thumbnail,
    })

with open('feed.json', 'w', encoding='utf-8') as f:
    json.dump(items, f, ensure_ascii=False, indent=2)

print(f"Saved {len(items)} articles to feed.json")
