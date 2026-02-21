from math import log
from collections import defaultdict
from ..storage.database import Database
from .text_processor import TextProcessor
from .. import config

class Ranker:
    def __init__(self):
        self.db = Database()
        self.processor = TextProcessor()

    def search(self, query, metadata_only=True):
        tokens = self.processor.process_text(query)
        if not tokens:
            return []
        N = self.db.get_document_count()
        if N == 0:
            return []

        doc_scores = defaultdict(float)
        candidates = {} # doc_id -> basic info

        for term in tokens:
            df = self.db.get_doc_frequency(term)
            if df == 0:
                continue
            
            idf = log(N / df)
            docs = self.db.get_documents_with_word(term)
            
            for doc in docs:
                doc_id = doc['doc_id']
                tf = doc['term_frequency']
                tf_idf = tf * idf
                
                doc_scores[doc_id] += (tf_idf * config.TFIDF_WEIGHT)
                
                if doc_id not in candidates:
                    candidates[doc_id] = {
                        'url': doc['url'],
                        'title': doc['title'],
                        'pagerank': doc['pagerank'],
                        'text': doc['cleaned_text'] # Needed for snippet?
                    }
        results = []
        for doc_id, score in doc_scores.items():
            final_score = score + (candidates[doc_id]['pagerank'] * config.PAGERANK_WEIGHT)
            
            snippet = self._generate_snippet(candidates[doc_id]['text'], tokens)
            
            results.append({
                'url': candidates[doc_id]['url'],
                'title': candidates[doc_id]['title'],
                'snippet': snippet,
                'score': final_score,
                'pagerank': candidates[doc_id]['pagerank']
            })
        results.sort(key=lambda x: x['score'], reverse=True)
        return results[:10] # Top 10

    def _generate_snippet(self, text, keywords, length=150):
        if not text:
            return ""
        lower_text = text.lower()
        start_idx = -1
        
        for k in keywords:
            idx = lower_text.find(k)
            if idx != -1:
                start_idx = idx
                break
        
        if start_idx == -1:
            return text[:length] + "..."
            
        start = max(0, start_idx - 60)
        end = min(len(text), start_idx + 60)
        
        snippet = text[start:end]
        if start > 0:
            snippet = "..." + snippet
        if end < len(text):
            snippet = snippet + "..."
            
        return snippet
