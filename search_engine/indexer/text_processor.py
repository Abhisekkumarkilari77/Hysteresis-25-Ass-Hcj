import re
import string
from .. import config

class TextProcessor:
    def __init__(self):
        self.stopwords = {
            "a", "an", "the", "and", "or", "but", "is", "are", "was", "were",
            "in", "on", "at", "to", "for", "with", "by", "from", "of", "that",
            "this", "it", "as", "be", "not", "have", "has", "had", "do", "does",
            "did", "will", "would", "shall", "should", "can", "could", "may",
            "might", "must"
        }

    def process_text(self, text):
        if not text:
            return []
        text = text.lower()
        text = text.translate(str.maketrans("", "", string.punctuation))
        tokens = text.split()
        tokens = [t for t in tokens if t not in self.stopwords and len(t) > 1]
        if config.USE_STEMMING:
            tokens = [self._simple_stem(t) for t in tokens]
            
        return tokens

    def _simple_stem(self, word):
        if word.endswith("ing"): return word[:-3]
        if word.endswith("ed"): return word[:-2]
        if word.endswith("s") and not word.endswith("ss"): return word[:-1]
        return word
