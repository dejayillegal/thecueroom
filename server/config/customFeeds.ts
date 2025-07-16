import fs from 'fs';
import path from 'path';

export interface CustomFeed {
  url: string;
  name: string;
  website: string;
  category: 'music' | 'guides' | 'industry' | 'gigs';
  description: string;
}

const filePath = path.join(process.cwd(), 'custom-feeds.json');
let feeds: CustomFeed[] = [];

export function loadCustomFeeds() {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    feeds = JSON.parse(data);
  } catch {
    feeds = [];
  }
}

export function getCustomFeeds(): CustomFeed[] {
  return feeds;
}

export function addCustomFeed(feed: CustomFeed): boolean {
  if (feeds.find(f => f.url === feed.url)) {
    return false;
  }
  feeds.push(feed);
  save();
  return true;
}

function save() {
  fs.writeFileSync(filePath, JSON.stringify(feeds, null, 2));
}

// Load feeds immediately on import
loadCustomFeeds();
