"""Loopback-only reader integration harness. Source text stays in process memory."""
import gzip, importlib.util, json, pathlib, ssl, sys, urllib.parse, urllib.error
from http.server import HTTPServer, BaseHTTPRequestHandler
ROOT=pathlib.Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('p11422_integration',ROOT/'scripts/project-reader-fragments-p11422.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
def build(*, use_rv_alternative=False):
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
    actual=m.p.build(on_fragment=consume,use_rv_alternative=use_rv_alternative)
    m.require(actual==expected and len(data)==1449 and sum(x['unitCount'] for x in index)==39041,'projection')
    m.require(m.p.sha(m.p.canonical(index))=='fc883fb3b99c47ba17fca2b1def24b2b80fe0c52263eef86e8c875709334568c','index continuity')
    if use_rv_alternative:editions[0]['source']=m.p.RV_ALTERNATIVE_URL
    return m.p.canonical({'schemaVersion':1,'mode':'isolated_validation','publicationAuthorized':False,'editions':editions}),data
def serve(*, use_rv_alternative=False):
    catalog,data=build(use_rv_alternative=use_rv_alternative)
    catalog_gzip=gzip.compress(catalog,compresslevel=6,mtime=0)
    m.require(len(catalog_gzip)<=m.MAX_GZIP,'catalog gzip budget')
    class Handler(BaseHTTPRequestHandler):
        def log_message(self,*args):pass
        def do_GET(self):
            try:
                path=urllib.parse.urlsplit(self.path).path
                if path=='/catalog':
                    compressed='gzip' in self.headers.get('Accept-Encoding','');body=catalog_gzip if compressed else catalog
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
        print(json.dumps({'port':server.server_port,'fragments':len(data),'catalogJsonBytes':len(catalog),'catalogGzipBytes':len(catalog_gzip),'publicationAuthorized':False}),flush=True)
        server.serve_forever()
def safe_error(exc):
    if isinstance(exc,urllib.error.URLError):
        return 'TLS_CERTIFICATE' if isinstance(exc.reason,ssl.SSLCertVerificationError) else 'SOURCE_CONNECTION'
    if isinstance(exc,ValueError) and str(exc) in {'rights provenance','projection provenance','RV archive fingerprint','RV source inventory','projection','index continuity','catalog gzip budget','source projection mismatch','git identity','sha256 identity','fragment mismatch','redirect'}:
        return str(exc)
    return type(exc).__name__
if __name__=='__main__':
    try:
        m.require(sys.argv[1:] in ([],['--rv-alternative']),'invalid argument')
        serve(use_rv_alternative=sys.argv[1:]==['--rv-alternative'])
    except Exception as e:
        print('P11.4.2.3 private harness failed ('+safe_error(e)+')',file=sys.stderr);sys.exit(1)
