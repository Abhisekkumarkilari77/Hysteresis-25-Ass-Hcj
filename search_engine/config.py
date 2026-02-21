import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_PATH = os.path.join(BASE_DIR, 'search_engine.db')
SEED_URLS = [
    "https://www.python.org",
    "https://en.wikipedia.org/wiki/Web_crawler",
    "https://fastapi.tiangolo.com/",
    "https://docs.docker.com/"
]

MAX_DEPTH = 2
MAX_PAGES_TO_CRAWL = 100
USER_AGENT = "MiniGoogleBot/1.0"
REQUEST_TIMEOUT = 10  # seconds
RETRY_COUNT = 3
DELAY_BETWEEN_REQUESTS = 1.0  # seconds
STOPWORDS_FILE = os.path.join(BASE_DIR, 'indexer', 'stopwords.txt') # If we use a file
USE_STEMMING = True
DAMPING_FACTOR = 0.85
PAGERANK_ITERATIONS = 20
PAGERANK_WEIGHT = 10.0  # Weight for PageRank in final score
TFIDF_WEIGHT = 1.0     # Weight for TF-IDF in final score
