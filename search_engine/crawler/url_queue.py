import queue
import threading
from urllib.parse import urlparse

class URLQueue:
    def __init__(self):
        self.queue = queue.Queue()
        self.visited_urls = set()
        self.lock = threading.Lock()

    def add_url(self, url):
        with self.lock:
            if url not in self.visited_urls:
                self.visited_urls.add(url)
                self.queue.put(url)
                return True
        return False

    def get_url(self):
        try:
            return self.queue.get(timeout=1) # Non-blocking with timeout
        except queue.Empty:
            return None

    def task_done(self):
        self.queue.task_done()

    def size(self):
        return self.queue.qsize()

    def empty(self):
        return self.queue.empty()

    def is_visited(self, url):
        with self.lock:
            return url in self.visited_urls
