from .. import config

class SeedManager:
    @staticmethod
    def get_seed_urls():
        # In a real system, this might load from a file or API
        return config.SEED_URLS
