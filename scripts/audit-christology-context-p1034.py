"""P10.3.4: verify source-native windows without doctrinal inference."""
import importlib.util,json,pathlib,sys
ROOT=pathlib.Path(__file__).resolve().parents[1]
def load(name,path):
    spec=importlib.util.spec_from_file_location(name,ROOT/path)
    m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
    return m
def main():
    try:
        r=json.loads((ROOT/'docs/P10/registro-validacion-cristologia-p1034.json').read_text(encoding='utf-8'))
        m=load('application_p1023','scripts/audit-pilot-application-p1023.py')
        c=load('comparison_p932','scripts/comparison-engine-p932.py')
        e=c.build_engine()
        n=g=0
        for case in r['cases']:
            for v in range(int(case['contextStart']),int(case['contextEnd'])+1):
                m.check_reference(e.nav,m.RV,case,v);n+=1
            if case['greekIndependentCheck']:
                m.check_reference(e.nav,m.GREEK,case,case['focus']);g+=1
        if (n,g)!=(20,2):raise ValueError('coverage')
        print(json.dumps({'phase':'P10.3.4','verifiedContextUnits':n,'independentGreekAnchors':g,'verifiedIntertextualRelations':0,'doctrinalInference':False,'textPersisted':False,'publicationAuthorized':False},sort_keys=True))
        return 0
    except Exception as exc:
        print('P10.3.4 audit failed ('+type(exc).__name__+'); text omitted',file=sys.stderr)
        return 1
if __name__=='__main__':sys.exit(main())
