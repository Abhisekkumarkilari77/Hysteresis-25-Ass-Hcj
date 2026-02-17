from ..storage.database import Database
from .text_processor import TextProcessor
from collections import Counter
import logging

logger = logging.getLogger(__name__)

class InvertedIndex:
    def __init__(self):
        self.db = Database()
        self.processor = TextProcessor()

    def build_index(self):
        logger.info("Building inverted index...")
        pages = self.db.get_all_pages()
        for page in pages:
            self._index_page(page['id'], page['url']) # pass url if needed to fetch content again?
                                                      # Actually we need content.
                                                      # Let's fetch full page content in `_index_page` 
                                                      # OR modify query in `get_all_pages`?
                                                      # `get_all_pages` only returns id, url in my current DB impl.
                                                      # I need to fetch content.
            
    def _index_page(self, page_id, url):
        # Fetch content
        # We need a method to get page content by ID.
        # Let's add it to Database class locally or here.
        # Ideally Database class should have `get_page_content(id)`.
        # I'll modify Database class later or just use direct query here?
        # Direct query is risky if DB impl changes.
        # I'll update Database class in next step if needed, but for now
        # let's just do it via a quick query here or rely on the `get_page` by url.
        
        # Wait, I implemented `get_page_id` and `add_page`.
        # I didn't implement `get_page_content`.
        # I'll use a direct query for now since I'm in the same package context essentially.
        
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT cleaned_text FROM pages WHERE id = ?', (page_id,))
            row = cursor.fetchone()
            if row and row['cleaned_text']:
                tokens = self.processor.process_text(row['cleaned_text'])
                word_freqs = Counter(tokens)
                self.db.save_keywords(page_id, word_freqs)
            else:
                 logger.warning(f"No content for page {page_id}")
