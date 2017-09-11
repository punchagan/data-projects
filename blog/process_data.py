from collections import Counter
from html.parser import HTMLParser
import json
import os
import re
from string import punctuation

import maya
from nltk.corpus import stopwords
import yaml

CUSTOM = [
    'https', 'http', 'www', 'com'
]
STOP_WORDS = list(stopwords.words('english')) + list(punctuation) + CUSTOM


class MLStripper(HTMLParser):

    def __init__(self):
        super(MLStripper, self).__init__()
        self.reset()
        self.strict = False
        self.convert_charrefs = True
        self.fed = []

    def handle_data(self, d):
        self.fed.append(d)

    def get_data(self):
        return ''.join(self.fed)


def strip_tags(html):
    s = MLStripper()
    s.feed(html)
    return s.get_data()


def parse_post(post):
    with open(post) as f:
        lines = []
        for line in f:
            line = line.strip()
            if line == '---':
                if len(lines) > 0:
                    break
            else:
                lines.append(line)
        post_content = f.read()
        metadata = yaml.load('\n'.join(lines))

    date = metadata['date']
    if isinstance(date, str):
        metadata['date'] = maya.parse(date).datetime()
    else:
        metadata['date'] = maya.to_utc_offset_aware(date)

    metadata.setdefault('tags', [])
    metadata.setdefault('content', post_content)
    metadata.setdefault('word_counts',
                        non_stop_words(strip_tags(post_content)))
    return metadata


def non_stop_words(text):
    text = re.sub("[^a-z0-9_'\"-]", " ", strip_tags(text).lower())
    text = re.sub("['\"]", "", text)
    counts = Counter(text.split())
    for token in STOP_WORDS:
        counts.pop(token, None)
    for key in list(counts.keys()):
        if len(key) < 3:
            counts.pop(key)

    return counts


def word_counts_by_year(posts, filter_=None):
    posts_by_year = {}
    for post in posts:
        posts_by_year.setdefault(post['date'].year, []).append(post)

    counts = {}
    for year, year_posts in posts_by_year.items():
        counter = Counter()
        for post in year_posts:
            if filter_ in {'TFIDF'}:
                counter.update(set(post['word_counts'].keys()))
            else:
                counter.update(post['word_counts'])

        if filter_ == 'TOP':
            items = counter.most_common(50)
        else:
            items = counter.items()

        words = [
            {"text": word, "count": count}
            for word, count in items
        ]

        counts[year] = words

    if filter_ == 'TFIDF':
        counts = tf_idf(counts)

    return counts


def tf(word, wordlist):
    return word['count'] / len(wordlist)


def n_containing(word, word_counts):
    return sum(1 for wcount in word_counts if word in wcount)


def idf(word, counts):
    return len(counts) / (1 + n_containing(word, counts.values()))


def tf_idf(counts):
    tf_idf_counts = {}
    for year, wordlist in counts.items():
        wordlist_ = [dict(word) for word in wordlist]
        for word in wordlist_:
            word['count'] = int(tf(word, wordlist) * idf(word, counts) * 1000)

        tf_idf_counts[year] = wordlist_
    return tf_idf_counts


def create_word_count_json(posts):
    counts = word_counts_by_year(posts)
    with open('data/counts.json', 'w') as f:
        json.dump(counts, f, indent=2)

    counts = word_counts_by_year(posts, 'TOP')
    with open('data/counts-top.json', 'w') as f:
        json.dump(counts, f, indent=2)

    counts = word_counts_by_year(posts, 'TFIDF')
    with open('data/counts-tfidf.json', 'w') as f:
        json.dump(counts, f, indent=2)


if __name__ == '__main__':
    BLOG_DIR = "/home/punchagan/software/my-repos/muse-amuse.in/content/blog"
    posts = [
        parse_post('{}/{}'.format(BLOG_DIR, filename))
        for filename in os.listdir(BLOG_DIR)
    ]
    SKIP_TITLES = ('Bookmarks [', 'What I liked')
    posts = [p for p in posts if not str(p['title']).startswith(SKIP_TITLES)]
    create_word_count_json(posts)
