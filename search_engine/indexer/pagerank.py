from ..storage.database import Database
from .. import config
import logging

logger = logging.getLogger(__name__)

class PageRank:
    def __init__(self):
        self.db = Database()

    def calculate_pagerank(self):
        logger.info("Calculating PageRank...")
        
        # 1. Load Graph
        # We need outgoing links for each page.
        # Memory efficient: Load adjacency list.
        
        pages = self.db.get_all_pages() # list of {id, url}
        page_ids = [p['id'] for p in pages]
        num_pages = len(page_ids)
        if num_pages == 0:
            return

        # Initialize PR
        pr = {pid: 1.0 / num_pages for pid in page_ids}
        
        # Build adjacency (outgoing links)
        # SELECT source_id, target_id FROM links
        outlinks = {pid: [] for pid in page_ids}
        with self.db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT source_id, target_id FROM links')
            for row in cursor.fetchall():
                if row['source_id'] in outlinks and row['target_id'] in pr:
                     outlinks[row['source_id']].append(row['target_id'])

        # Identify dangling pages (no outlinks)
        dangling_pages = [pid for pid in page_ids if not outlinks[pid]]

        # Iteration
        for i in range(config.PAGERANK_ITERATIONS):
            new_pr = {}
            dangling_sum = sum(pr[pid] for pid in dangling_pages)
            
            for pid in page_ids:
                # Calculate sum of PR(inlink) / num_outlinks(inlink)
                # This requires inlinks.
                # To avoid storing inlinks, we can push flow from source to targets.
                pass 
                
            # Better approach: "Push" contribution
            check_pr = {pid: 0.0 for pid in page_ids}
            
            for pid in page_ids:
                if outlinks[pid]:
                    share = pr[pid] / len(outlinks[pid])
                    for target in outlinks[pid]:
                        check_pr[target] += share
                else:
                    # Dangling page mass is distributed evenly to all (or dampened)
                    # Usually added to base component
                    pass
            
            # Apply damping factor
            # Formula: PR(A) = (1-d)/N + d * (sum(PR(in)/C(in)))
            # Dangling mass handling: add dangling_sum / N to everyone
            
            base_val = (1.0 - config.DAMPING_FACTOR) / num_pages
            dangling_val = (config.DAMPING_FACTOR * dangling_sum) / num_pages
            
            for pid in page_ids:
                new_pr[pid] = base_val + dangling_val + (config.DAMPING_FACTOR * check_pr[pid])
            
            pr = new_pr
            
            # Optional: Check convergence
        
        # Save to DB
        logger.info("Saving PageRank scores...")
        for pid, score in pr.items():
            self.db.update_pagerank(pid, score)
