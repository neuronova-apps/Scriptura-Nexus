"""P10.3.2: verify the six Greek text anchors separately from annotations."""
import importlib.util,json,pathlib,sys
ROOT=pathlib.Path(__file__).resolve().parents[1]
def load(name,path):
    spec=importlib.util.spec_from_file_location(name,ROOT/path)
    m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
    return m
def main():
    try:
        r=json.loads((ROOT/'docs/P10/registro-validacion-griego-p1032.json').read_text(encoding='utf-8'))
        m=load('comparison_p932','scripts/comparison-engine-p932.py')
        e=m.build_engine()
        anchors=0
        for c in r['cases']:
            ref={'bookId':c['textualBookId'],'chapter':c['chapter'],'verse':c['verse']}
            s=e.nav.locate(r['textEdition']['id'],ref['bookId'],ref['chapter'],ref['verse'])
            if s['status']!='verified_fragment' or s.get('publicationEnabled') is not False:
                raise ValueError('text anchor unavailable')
            row=s['reference']
            if row['editionId']!=r['textEdition']['id'] or any(row[k]!=v for k,v in ref.items()):
                raise ValueError('reference drift')
            anchors+=1
        if anchors!=6:raise ValueError('anchor count')
        print(json.dumps({'phase':'P10.3.2','verifiedGreekTextAnchors':anchors,'linguisticInference':False,'textPersisted':False,'publicationAuthorized':False},sort_keys=True))
        return 0
    except Exception as exc:
        print('P10.3.2 textual audit failed ('+type(exc).__name__+'); corpus omitted',file=sys.stderr)
        return 1
if __name__=='__main__':sys.exit(main())
