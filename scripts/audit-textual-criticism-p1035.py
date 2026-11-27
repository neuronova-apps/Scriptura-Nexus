"""P10.3.5: independent source-native anchor and comparator negative controls."""
import importlib.util,json,pathlib,sys
ROOT=pathlib.Path(__file__).resolve().parents[1]
def load(name,path):
    spec=importlib.util.spec_from_file_location(name,ROOT/path)
    m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
    return m
def main():
    try:
        r=json.loads((ROOT/'docs/P10/registro-validacion-critica-textual-p1035.json').read_text(encoding='utf-8'))
        m=load('application_p1023','scripts/audit-pilot-application-p1023.py')
        c=load('comparison_p932','scripts/comparison-engine-p932.py')
        e=c.build_engine();case=r['case'];n=0
        for v in range(int(case['contextStart']),int(case['contextEnd'])+1):
            m.check_reference(e.nav,m.RV,case,v);n+=1
        m.check_reference(e.nav,m.GREEK,case,case['focus'])
        ref={'bookId':case['bookId'],'chapter':case['chapter'],'verse':case['focus']}
        tr=e.compare(m.GREEK,ref,r['comparisonControls']['unavailableTargetTestId'])
        other=e.compare(m.RV,ref,m.GREEK,ref)
        if n!=5 or tr['status']!='edition_unavailable' or tr['source'] is not None or tr['target'] is not None:
            raise ValueError('TR coverage')
        if other['status']!='not_aligned' or other['literalLabelProbe']['isAlignment'] is not False:
            raise ValueError('alignment')
        for x in [tr,other]:
            if x['alignment'] is not None or x['comparison'] is not None or x['publicationAuthorized'] is not False:
                raise ValueError('unauthorized comparison')
        print(json.dumps({'phase':'P10.3.5','verifiedContextUnits':n,'independentGreekAnchors':1,'trComparisonStatus':tr['status'],'rvSblComparisonStatus':other['status'],'verifiedAlignments':0,'originalReadingDetermined':False,'textPersisted':False,'publicationAuthorized':False},sort_keys=True))
        return 0
    except Exception as exc:
        print('P10.3.5 audit failed ('+type(exc).__name__+'); text omitted',file=sys.stderr)
        return 1
if __name__=='__main__':sys.exit(main())
