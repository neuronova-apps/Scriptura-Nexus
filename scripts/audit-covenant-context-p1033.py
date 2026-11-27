"""P10.3.3: audit five context windows without outputting text or doctrine."""
import importlib.util,json,pathlib,sys
ROOT=pathlib.Path(__file__).resolve().parents[1]
def main():
    try:
        r=json.loads((ROOT/'docs/P10/registro-validacion-pactos-p1033.json').read_text(encoding='utf-8'))
        spec=importlib.util.spec_from_file_location('application_p1023',ROOT/'scripts/audit-pilot-application-p1023.py')
        m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
        spec=importlib.util.spec_from_file_location('comparison_p932',ROOT/'scripts/comparison-engine-p932.py')
        c=importlib.util.module_from_spec(spec);spec.loader.exec_module(c)
        e=c.build_engine()
        n=g=0
        for case in r['cases']:
            for v in range(int(case['contextStart']),int(case['contextEnd'])+1):
                m.check_reference(e.nav,m.RV,case,v);n+=1
            if case['greekIndependentCheck']:
                m.check_reference(e.nav,m.GREEK,case,case['focus']);g+=1
        if (n,g)!=(26,2):raise ValueError('coverage count')
        print(json.dumps({'phase':'P10.3.3','verifiedContextUnits':n,'independentGreekAnchors':g,'normativeInference':False,'textPersisted':False,'publicationAuthorized':False},sort_keys=True))
        return 0
    except Exception as exc:
        print('P10.3.3 audit failed ('+type(exc).__name__+'); text omitted',file=sys.stderr)
        return 1
if __name__=='__main__':sys.exit(main())
