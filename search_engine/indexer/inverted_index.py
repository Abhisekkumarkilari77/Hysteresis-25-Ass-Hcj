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
            
    def _index_page(self, page_id, url):
        
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
