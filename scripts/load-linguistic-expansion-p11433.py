"""Internal pipe protocol. Never invoked by the public build; never log text."""
import importlib.util,json,os,pathlib,sys
ROOT=pathlib.Path(__file__).resolve().parents[1]
def load():
    spec=importlib.util.spec_from_file_location('prep',ROOT/'scripts/prepare-linguistic-expansion-p11432.py')
    p=importlib.util.module_from_spec(spec);spec.loader.exec_module(p);return p
def main():
    if os.environ.get('SN_P11433_PRIVATE_PIPE')!='1' or sys.stdout.isatty():raise ValueError('private pipe only')
    p=load()
    r=json.loads(p.MANIFEST.read_bytes())
    record=json.loads((ROOT/'docs/P11/registro-admision-integracion-linguistica-p11433.json').read_bytes())
    raw=p.MANIFEST.read_bytes().replace(b'\r\n',b'\n')
    if p.a.p91.blob(raw)!=record['proposalBlob'] or record['publicationAuthorized'] is not False or record['newTechnicalAdmissions']!=6:raise ValueError('approval boundary')
    books={}
    def collect(book,payload):
        if book in books:raise ValueError('duplicate book')
        books[book]=payload
    result=p.prepare(r,on_book=collect)
    if result!=record['verifiedProjection'] or set(books)!={'Lev','Deut','Acts','1Cor'}:raise ValueError('projection continuity')
    sys.stdout.buffer.write(p.canonical({'books':books,'summary':result}))
if __name__=='__main__':
    try:main()
    except Exception as e:
        print('P11.4.3.3 private projection failed ('+type(e).__name__+')',file=sys.stderr);sys.exit(1)
