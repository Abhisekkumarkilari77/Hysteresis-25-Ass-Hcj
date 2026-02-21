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
                time.sleep(1)
                continue

            try:
                time.sleep(config.DELAY_BETWEEN_REQUESTS)
                
                logger.info(f"Crawling: {url}")
                html = self.fetcher.fetch(url)
                
                if html:
                    data = self.parser.parse(html, url)
                    page_id = self.db.add_page(url, data['title'], data['content'], data['text'])
                    
                    if page_id:
                        for link in data['links']:
                            if self.queue.add_url(link):
                                logger.debug(f"Queued: {link}")
                            pass
                        for link in data['links']:
                             target_id = self.db.get_page_id(link)
                             if not target_id:
                                 target_id = self.db.add_page(link, None, None, None)
                             
                             self.db.add_link(page_id, target_id)

            except Exception as e:
                logger.error(f"Error processing {url}: {e}")
            finally:
                self.queue.task_done()
