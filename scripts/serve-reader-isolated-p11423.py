"""Loopback-only reader integration harness. Source text stays in process memory."""
import importlib.util, json, pathlib, sys, urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler
ROOT=pathlib.Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('p11422_integration',ROOT/'scripts/project-reader-fragments-p11422.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
def build():
    expected=m.check_plan();fragments={(x['editionId'],f['bookId']):f for x in expected['corpusManifests'] for f in x['fragments']}
    names={x['id']:x['names']['es'] for x in expected['books']}
    rights=json.loads((ROOT/'docs/P11/registro-permisos-lector-p11421.json').read_bytes())
    editions=[];bookmap={};data={};index=[]
    for e,r in zip(expected['editions'],rights['editions']):
        books=[{'id':b,'name':names[b],'chapters':[]} for b in e['coverageBookIds']]
        editions.append({**{k:e[k] for k in ('id','name','version','language','attribution')},'source':r['source'],'license':r['license'],'books':books})
        bookmap.update({(e['id'],b['id']):b for b in books})
    def consume(edition,book,units):
        checked=m.project_book(edition,book,units,fragments[(edition,book)])
        groups={}
        for u in units:groups.setdefault(u['chapter'],[]).append(u)
        for d,rows in zip(checked,groups.values()):
            verified,raw,gz=m.make_fragment(edition,book,d['chapter'],rows)
            m.require(verified==d,'fragment mismatch')
            key=(edition,book,d['chapter']);m.require(key not in data,'duplicate')
            data[key]=(raw,gz);index.append(d);bookmap[(edition,book)]['chapters'].append(d)
    actual=m.p.build(on_fragment=consume)
    m.require(actual==expected and len(data)==1449 and sum(x['unitCount'] for x in index)==39041,'projection')
    m.require(m.p.sha(m.p.canonical(index))=='fc883fb3b99c47ba17fca2b1def24b2b80fe0c52263eef86e8c875709334568c','index continuity')
    return m.p.canonical({'schemaVersion':1,'mode':'isolated_validation','publicationAuthorized':False,'editions':editions}),data
def serve():
    catalog,data=build()
    class Handler(BaseHTTPRequestHandler):
        def log_message(self,*args):pass
        def do_GET(self):
            try:
                path=urllib.parse.urlsplit(self.path).path
                if path=='/catalog':body=catalog;compressed=False
                elif path.startswith('/chapter/'):
                    key=tuple(urllib.parse.unquote(x) for x in path[len('/chapter/'):].split('/'))
                    raw,gz=data[key];compressed='gzip' in self.headers.get('Accept-Encoding','');body=gz if compressed else raw
                else:raise KeyError()
                self.send_response(200);self.send_header('Content-Type','application/json; charset=utf-8');self.send_header('Cache-Control','no-store');self.send_header('Content-Length',str(len(body)))
                if compressed:self.send_header('Content-Encoding','gzip')
                self.end_headers();self.wfile.write(body)
            except KeyError:self.send_error(404)
            except (BrokenPipeError,ConnectionResetError):pass
    with HTTPServer(('127.0.0.1',0),Handler) as server:
        print(json.dumps({'port':server.server_port,'fragments':len(data),'publicationAuthorized':False}),flush=True)
        server.serve_forever()
if __name__=='__main__':
    try:serve()
    except Exception as e:print('P11.4.2.3 private harness failed ('+type(e).__name__+')',file=sys.stderr);sys.exit(1)
