import requests
import time
from urllib.robotparser import RobotFileParser
from urllib.parse import urlparse
from .. import config
import logging

logger = logging.getLogger(__name__)

class Fetcher:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({'User-Agent': config.USER_AGENT})
        self.robot_parsers = {}

    def can_fetch(self, url):
        parsed_url = urlparse(url)
        base_url = f"{parsed_url.scheme}://{parsed_url.netloc}"
        
        if base_url not in self.robot_parsers:
            rp = RobotFileParser()
            rp.set_url(f"{base_url}/robots.txt")
            try:
                rp.read()
                self.robot_parsers[base_url] = rp
            except Exception:
                logger.warning(f"Could not read robots.txt for {base_url}")
                return True
        
        return self.robot_parsers[base_url].can_fetch(config.USER_AGENT, url)

    def fetch(self, url):
        if not self.can_fetch(url):
            logger.info(f"Blocked by robots.txt: {url}")
            return None

        for attempt in range(config.RETRY_COUNT):
            try:
                response = self.session.get(url, timeout=config.REQUEST_TIMEOUT)
                if response.status_code == 200:
                    return response.text
                else:
                    logger.warning(f"Failed to fetch {url}: Status {response.status_code}")
            except requests.RequestException as e:
                logger.warning(f"Error fetching {url} (Attempt {attempt+1}): {e}")
                time.sleep(1) # Backoff
        
        return None
