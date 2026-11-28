"""Close the bounded linguistic review without asserting unverified equivalence."""
import json
from pathlib import Path
from collections import Counter
D=Path('docs/investigaciones')
pre=json.loads((D/'SN-001-pre-registro-editorial-531.json').read_text())
audit=json.loads(Path('sn001-cotejo.json').read_text())
assert audit['publicationAuthorized'] is False
assert len(audit['files'])==7 and len(audit['terms'])==12
rows=[]
for i,(t,a) in enumerate(zip(pre['terms'],audit['terms']),1):
    assert (t['passageId'],t['form'])==(a['passageId'],a['reportedForm'])
    state=a['status']
    resolution={'matched':'whole_token_normalized','unresolved':'unresolved_retained','outside_admitted_hebrew_coverage':'outside_coverage_retained'}[state]
    if state=='unresolved' and a.get('segmentationStatus')=='explicit_final_segment':
        resolution='explicit_segment_normalized'
    rows.append({'termId':'T%02d'%i,'passageId':t['passageId'],'reportedForm':t['form'],'reportedStrong':t['strong'],'reportedMorphology':t['morphology'],'reportedCode':t['reportedCode'],'reportedCandidates':t.get('strongCandidates',[]),'resolution':resolution,'source':a.get('source'),'reference':a.get('reference'),'wholeTokenMatches':a.get('matches',[]),'segmentedCandidates':a.get('segmentedCandidates',[]),'diagnostics':a.get('verseTokenDiagnostics',[]),'strongOccurrenceEquivalence':'not_certified','morphologyEquivalence':'not_certified','publicationPermission':'pending'})
assert sum(x['resolution']=='outside_coverage_retained' for x in rows)==5
assert all(not x['wholeTokenMatches'] and not x['segmentedCandidates'] for x in rows if x['resolution']=='outside_coverage_retained')
report={'phase':'5.5.1','studyId':'SN-001','publicationAuthorized':False,'sources':audit['files'],'counts':dict(Counter(x['resolution'] for x in rows)),'terms':rows,'lexicalEntryChecks':audit['lexical'],'limits':['A form match is not a Strong or morphology equivalence.','The entire raw token annotation is retained for segmented matches, not assigned to the segment.','No new corpus and no inferred frequencies.','H1417/H1418 retained as divergent reported identifiers; no equivalence inferred.','Greek comparison is preliminary and excluded from admitted evidence.'],'next':'5.5.2: editorial permissions and specific evidence; exact content approval remains required.'}
out=Path('sn001-validation-output');out.mkdir(exist_ok=True)
(out/'linguistic-551-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(json.dumps({'phase':report['phase'],'counts':report['counts'],'publicationAuthorized':False},ensure_ascii=False))
