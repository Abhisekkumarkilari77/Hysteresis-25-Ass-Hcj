import threading
import time
import logging
from ..storage.database import Database
from .. import config

logger = logging.getLogger(__name__)

class CrawlerWorker(threading.Thread):
    def __init__(self, queue, fetcher, parser):
        super().__init__()
        self.queue = queue
        self.fetcher = fetcher
        self.parser = parser
        self.db = Database()
        self.daemon = True # Daemon thread exits when main program exits

    def run(self):
        while True:
            url = self.queue.get_url()
            if not url:
                break # Or wait? For this assignment, if empty, we might be done or waiting. 
                      # But for multi-threaded, empty might be temporary.
                      # We'll use a sentinel or check if all work is done controller wise.
                      # For simplicity here: if queue is empty and active workers is 0 -> done.
                      # Ideally, we sleep and retry a few times.
                time.sleep(1)
                continue

            try:
                # Politeness delay
                time.sleep(config.DELAY_BETWEEN_REQUESTS)
                
                logger.info(f"Crawling: {url}")
                html = self.fetcher.fetch(url)
                
                if html:
                    data = self.parser.parse(html, url)
                    
                    # Store page
                    page_id = self.db.add_page(url, data['title'], data['content'], data['text'])
                    
                    if page_id:
                        # Process links
                        for link in data['links']:
                            # Enqueue if not visited
                            if self.queue.add_url(link):
                                logger.debug(f"Queued: {link}")
                            
                            # Add link to graph (even if already visited, the link exists)
                            # We need target_id, but target might not be in DB yet.
                            # Standard practice: we add links later or handle it.
                            # Here, we can't easily add link if target doesn't exist in DB.
                            # Strategy: We only add link if we actually crawled the target? 
                            # Or we insert target with null content?
                            # For PageRank, we need the graph.
                            # Let's insert target as a strict placeholder or just wait.
                            # BETTER APPROACH:
                            
                            # We just store the link if the target is ALREADY in pages? 
                            # No, that misses future pages.
                            # We should insert the target page with just URL if not exists?
                            pass
                            
                        # To properly build the graph for PageRank, we need to resolve links after crawling
                        # OR we insert "placeholder" pages.
                        # For this simple project, let's just create a list of outlinks for the page,
                        # and in a separate process (or end of crawl) resolving them might be expensive.
                        # Simple approach: When we crawl A and see link to B.
                        # We try to get ID of B. If not exists, we insert B with just URL.
                        for link in data['links']:
                             # Ensure target page exists (at least as a placeholder)
                             # We can use add_page with minimal info
                             target_id = self.db.get_page_id(link)
                             if not target_id:
                                 target_id = self.db.add_page(link, None, None, None)
                             
                             self.db.add_link(page_id, target_id)

            except Exception as e:
                logger.error(f"Error processing {url}: {e}")
            finally:
                self.queue.task_done()
