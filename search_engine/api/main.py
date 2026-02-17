from fastapi import FastAPI, BackgroundTasks, HTTPException
from ..indexer.ranker import Ranker
from ..indexer.inverted_index import InvertedIndex
from ..indexer.pagerank import PageRank
from ..crawler.crawler_worker import CrawlerWorker
from ..crawler.url_queue import URLQueue
from ..crawler.seed_manager import SeedManager
from ..crawler.fetcher import Fetcher
from ..crawler.parser import Parser
from .. import config
import uvicorn
import threading
import logging

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("SearchEngineAPI")

app = FastAPI(title="Mini Google Search Engine")

# Components
ranker = Ranker()
inverted_index = InvertedIndex()
pagerank = PageRank()

# Global Crawler State (for demo purposes)
crawler_running = False
crawler_thread = None

@app.get("/")
def read_root():
    return {"message": "Welcome to Mini Google API. Use /search?q=query to search."}

@app.get("/search")
def search(q: str):
    if not q:
        raise HTTPException(status_code=400, detail="Query parameter 'q' is required")
    
    results = ranker.search(q)
    return {
        "query": q,
        "count": len(results),
        "results": results
    }

def run_crawler_task():
    global crawler_running
    logger.info("Starting crawler task...")
    
    queue = URLQueue()
    fetcher = Fetcher()
    parser = Parser()
    
    # Load seeds
    for url in SeedManager.get_seed_urls():
        queue.add_url(url)
        
    workers = []
    # Start workers
    for _ in range(5): # 5 threads
        worker = CrawlerWorker(queue, fetcher, parser)
        worker.start()
        workers.append(worker)
        
    # Monitor queue (simple blocking for demo)
    # In a real app, this would be more robust.
    # We just let them run for a bit or until empty?
    # Since workers are daemons, they die when we exit? 
    # But this is a background task in FastAPI, so "we exit" is ambiguous.
    # We'll just let them run.
    pass

@app.post("/admin/crawl")
def trigger_crawl(background_tasks: BackgroundTasks):
    global crawler_running
    if crawler_running:
         return {"message": "Crawler already running"}
    
    background_tasks.add_task(run_crawler_task)
    crawler_running = True # This state mgmt is simplistic
    return {"message": "Crawler started in background"}

@app.post("/admin/index")
def trigger_indexing(background_tasks: BackgroundTasks):
    def index_task():
        inverted_index.build_index()
        pagerank.calculate_pagerank()
        logger.info("Indexing and PageRank complete.")
        
    background_tasks.add_task(index_task)
    return {"message": "Indexing started in background"}

if __name__ == "__main__":
    uvicorn.run("search_engine.api.main:app", host="0.0.0.0", port=8000, reload=True)
