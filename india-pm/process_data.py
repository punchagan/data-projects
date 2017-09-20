import csv
import datetime
import json
from os.path import abspath, dirname, join
import time

HERE = dirname(abspath(__file__))
PM_CSV = join(HERE, 'data', 'prime-ministers.csv')
EVENTS_JSON = join(HERE, 'data', 'events.json')
TIME_FMT = '%Y-%m-%d'


def get_event_json(pm_info):
    event = {
        'label': pm_info['Name'],
        'times': [
            {'starting_time': get_time_since_epoch(pm_info['Term Start']),
             'ending_time': get_time_since_epoch(pm_info['Term End'])}
        ],
        'icon': pm_info['Portrait']
    }
    return event


def get_time_since_epoch(time_str):
    try:
        date = datetime.datetime.strptime(time_str, TIME_FMT)
    except ValueError:
        return time.time()
    else:
        return time.mktime(date.timetuple())


def create_events_json():
    with open(PM_CSV) as f:
        reader = csv.DictReader(f)
        events = [get_event_json(line) for line in reader]
    with open(EVENTS_JSON, 'w') as f:
        json.dump(events, f, indent=2)


if __name__ == '__main__':
    create_events_json()
