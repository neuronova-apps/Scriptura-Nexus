"""P11.1: audit static HTML internal link targets without external requests."""
import json
import pathlib
from html.parser import HTMLParser
from urllib.parse import urljoin, urlsplit, unquote

PREFIX = '/Scriptura-Nexus/'
ORIGIN = 'https://neuronova-apps.github.io'
class Page(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.ids=set()
        self.links=[]
        self.feed(html)
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if a.get('id'): self.ids.add(a['id'])
        if tag in ('a','area') and a.get('href') is not None:
            self.links.append(a['href'])
        if tag=='script' and a.get('src'): self.links.append(a['src'])
        if tag=='link' and a.get('href') and set((a.get('rel') or '').split()) & {'stylesheet','icon','preload','modulepreload'}:
            self.links.append(a['href'])
        if tag=='img' and a.get('src'): self.links.append(a['src'])

def page_url(relative):
    return ORIGIN + PREFIX + (relative[:-len('index.html')] if relative.endswith('index.html') else relative)

def target_for(source_url, href, files):
    if not href.strip(): return None
    u=urlsplit(urljoin(source_url,href))
    if u.scheme not in ('https','http') or u.netloc!=urlsplit(ORIGIN).netloc: return None
    if not u.path.startswith(PREFIX): raise ValueError('outside Pages base: '+u.path)
    rel=unquote(u.path[len(PREFIX):])
    if '\\' in rel or any(p in ('.','..') for p in rel.split('/')): raise ValueError('invalid path')
    target=rel+'index.html' if not rel or rel.endswith('/') else rel
    if target not in files and not target.endswith('/'): target=target+'/index.html'
    if target not in files: raise ValueError('missing target: '+rel)
    return target,unquote(u.fragment)

def audit(root):
    files={p.relative_to(root).as_posix():p for p in root.rglob('*') if p.is_file()}
    pages={name:Page(p.read_text(encoding='utf-8')) for name,p in files.items() if name.endswith('.html')}
    if not pages or 'index.html' not in pages or '404.html' not in pages: raise ValueError('incomplete build')
    checked=anchors=external=0
    failures=set()
    for name,p in pages.items():
        for href in p.links:
            try:
                result=target_for(page_url(name),href,files)
                if result is None:
                    external+=1
                    continue
                target,fragment=result
                checked+=1
                if fragment and target in pages:
                    anchors+=1
                    if fragment not in pages[target].ids: raise ValueError('missing anchor: '+target+'#'+fragment)
            except (ValueError,UnicodeError) as e:
                failures.add(name+': '+str(e))
    if failures: raise ValueError('\n'.join(sorted(failures)[:50]))
    return {'phase':'P11.1','staticPages':len(pages),'localTargetsChecked':checked,'htmlAnchorsChecked':anchors,'externalOrNonHttpSkipped':external,'brokenInternalTargets':0}

if __name__=='__main__':
    print(json.dumps(audit(pathlib.Path('dist')),sort_keys=True))
