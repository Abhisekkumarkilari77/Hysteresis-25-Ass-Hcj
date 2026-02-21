from ..storage.database import Database
from .. import config
import logging

logger = logging.getLogger(__name__)

class PageRank:
    def __init__(self):
        self.db = Database()

    def calculate_pagerank(self):
        logger.info("Calculating PageRank...")
        
        pages = self.db.get_all_pages() # list of {id, url}
        page_ids = [p['id'] for p in pages]
        num_pages = len(page_ids)
        if num_pages == 0:
            return
        pr = {pid: 1.0 / num_pages for pid in page_ids}
        outlinks = {pid: [] for pid in page_ids}
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT source_id, target_id FROM links')
            for row in cursor.fetchall():
                if row['source_id'] in outlinks and row['target_id'] in pr:
                     outlinks[row['source_id']].append(row['target_id'])
        dangling_pages = [pid for pid in page_ids if not outlinks[pid]]
        for i in range(config.PAGERANK_ITERATIONS):
            new_pr = {}
            dangling_sum = sum(pr[pid] for pid in dangling_pages)
            
            for pid in page_ids:
                pass 
            check_pr = {pid: 0.0 for pid in page_ids}
            
            for pid in page_ids:
                if outlinks[pid]:
                    share = pr[pid] / len(outlinks[pid])
                    for target in outlinks[pid]:
                        check_pr[target] += share
                else:
                    pass
            
            base_val = (1.0 - config.DAMPING_FACTOR) / num_pages
            dangling_val = (config.DAMPING_FACTOR * dangling_sum) / num_pages
            
            for pid in page_ids:
                new_pr[pid] = base_val + dangling_val + (config.DAMPING_FACTOR * check_pr[pid])
            
            pr = new_pr
        logger.info("Saving PageRank scores...")
        for pid, score in pr.items():
            self.db.update_pagerank(pid, score)
