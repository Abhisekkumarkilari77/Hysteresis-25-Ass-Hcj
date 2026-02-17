import sqlite3
import threading
from contextlib import contextmanager
from . import config
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class Database:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super(Database, cls).__new__(cls)
                    cls._instance.init_db()
        return cls._instance

    def __init__(self):
        # Already handled in __new__, but kept for safety if instantiated differently
        pass

    @contextmanager
    def get_connection(self):
        conn = sqlite3.connect(config.DATABASE_PATH, check_same_thread=False)
        conn.row_factory = sqlite3.Row  # Access columns by name
        try:
            yield conn
            conn.commit()
        except Exception as e:
            conn.rollback()
            logger.error(f"Database error: {e}")
            raise
        finally:
            conn.close()

    def init_db(self):
        """Initialize the database schema."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Pages table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS pages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    url TEXT UNIQUE NOT NULL,
                    title TEXT,
                    content TEXT,
                    cleaned_text TEXT,
                    pagerank REAL DEFAULT 0.0,
                    crawled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')

            # Links table (Graph structure)
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS links (
                    source_id INTEGER,
                    target_id INTEGER,
                    PRIMARY KEY (source_id, target_id),
                    FOREIGN KEY(source_id) REFERENCES pages(id),
                    FOREIGN KEY(target_id) REFERENCES pages(id)
                )
            ''')

            # Inverted Index table (Word -> Doc mapping)
            # We store term frequency here directly for simplicity in this schema
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS keywords (
                    word TEXT,
                    doc_id INTEGER,
                    term_frequency INTEGER,
                    PRIMARY KEY (word, doc_id),
                    FOREIGN KEY(doc_id) REFERENCES pages(id)
                )
            ''')
            
            # Index for faster search
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_keywords_word ON keywords(word)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_pages_url ON pages(url)')

            logger.info("Database initialized successfully.")

    def add_page(self, url, title, content, cleaned_text):
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO pages (url, title, content, cleaned_text) 
                    VALUES (?, ?, ?, ?)
                    ON CONFLICT(url) DO UPDATE SET
                        title=excluded.title,
                        content=excluded.content,
                        cleaned_text=excluded.cleaned_text,
                        crawled_at=CURRENT_TIMESTAMP
                ''', (url, title, content, cleaned_text))
                return cursor.lastrowid
        except Exception as e:
            logger.error(f"Error adding page {url}: {e}")
            return None

    def get_page_id(self, url):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT id FROM pages WHERE url = ?', (url,))
            row = cursor.fetchone()
            return row['id'] if row else None

    def add_link(self, source_id, target_id):
        if source_id is None or target_id is None:
            return
        
        # Avoid self-loops
        if source_id == target_id:
            return

        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT OR IGNORE INTO links (source_id, target_id) 
                VALUES (?, ?)
            ''', (source_id, target_id))

    def get_all_pages(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT id, url FROM pages')
            return cursor.fetchall()
            
    def get_links_count(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT COUNT(*) FROM links')
            return cursor.fetchone()[0]

    def update_pagerank(self, page_id, rank):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('UPDATE pages SET pagerank = ? WHERE id = ?', (rank, page_id))

    def save_keywords(self, doc_id, word_freqs):
        """
        word_freqs: dict of word -> frequency
        """
        if not word_freqs:
            return
            
        data = [(word, doc_id, freq) for word, freq in word_freqs.items()]
        
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.executemany('''
                INSERT OR REPLACE INTO keywords (word, doc_id, term_frequency)
                VALUES (?, ?, ?)
            ''', data)

    def get_document_count(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT COUNT(*) FROM pages')
            return cursor.fetchone()[0]

    def get_doc_frequency(self, word):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT COUNT(DISTINCT doc_id) FROM keywords WHERE word = ?', (word,))
            return cursor.fetchone()[0]

    def get_documents_with_word(self, word):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT k.doc_id, k.term_frequency, p.url, p.title, p.pagerank, p.cleaned_text
                FROM keywords k
                JOIN pages p ON k.doc_id = p.id
                WHERE k.word = ?
            ''', (word,))
            return cursor.fetchall()
