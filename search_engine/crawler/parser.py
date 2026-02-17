from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import re

class Parser:
    @staticmethod
    def parse(html, base_url):
        soup = BeautifulSoup(html, 'html.parser')
        
        # Extract title
        title = soup.title.string if soup.title else "No Title"
        
        # Extract text (simple approach)
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.extract()
            
        text = soup.get_text()
        
        # Clean text
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        cleaned_text = '\n'.join(chunk for chunk in chunks if chunk)
        
        # Extract links
        links = set()
        for link in soup.find_all('a', href=True):
            href = link['href']
            full_url = urljoin(base_url, href)
            
            # Normalize (remove fragment)
            parsed = urlparse(full_url)
            clean_url = parsed._replace(fragment="").geturl()
            
            # Filter (only http/https)
            if clean_url.startswith('http'):
                links.add(clean_url)
                
        return {
            'title': title,
            'text': cleaned_text,
            'links': list(links),
            'content': str(soup) # Store full HTML if needed
        }
