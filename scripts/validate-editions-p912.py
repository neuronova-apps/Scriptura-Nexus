"""P9.1.2: verify fixed source snapshots and technical admission; never persist corpus."""
import hashlib,importlib.util,json,pathlib,re,sys,urllib.parse,xml.etree.ElementTree as ET
ROOT=pathlib.Path(__file__).resolve().parents[1]
ADMISSION=ROOT/'docs/P9/admisiones-ediciones-p912.json'
CANDIDATES=ROOT/'docs/P9/candidatos-ediciones-p91.json'
spec=importlib.util.spec_from_file_location('p91',ROOT/'scripts/audit-editions-p91.py')
p91=importlib.util.module_from_spec(spec);spec.loader.exec_module(p91)
def require(ok,reason):
    if not ok:raise ValueError(reason)
def sha(b):return hashlib.sha256(b).hexdigest()
def validate_manifest(m,c):
    p91.validate(c)
    require(m['schemaVersion']==1 and m['phase']=='P9.1.2' and m['baselineMain']=='949a5610729308c85a48aa66ea7aa4954a1fd408','phase')
    require(m['audit']=={'pr':55,'mergeCommit':'949a5610729308c85a48aa66ea7aa4954a1fd408','deployRun':45888740669,'sourceAuditRun':45888340290,'sourceAuditConclusion':'success','sourceAuditTests':10},'audit evidence')
    require(m['decision']=='admission_technical_scope_limited_to_P9.1.3_in_memory_projection','decision scope')
    require(m['publication']=={'authorized':False,'gate':'P11.4','publicCorpusPersisted':False,'publicRegistriesRemainEmpty':True},'publication gate')
    require(m['controls']=={'canon':'no asignado','versification':'no asignada','alignment':'no generada','noAutomaticEquivalence':True,'sourceTextStoredInRepository':False,'publicRegistryChanged':False,'pgpSignatureVerification':'no realizada para los ficheros auxiliares de RV1909'},'controls')
    require(len(m['decisions'])==2 and [x['id'] for x in m['decisions']]==['ED-C01','ED-C02'],'decision count')
    rv,g=m['decisions']
    require(rv['sourceId']=='F05' and rv['admissionStatus']=='admitido' and rv['edition']=='spaRV1909' and rv['editionYear']==1909,'RV admission')
    require(rv['license']['type']=='Public Domain' and rv['license']['status']=='declaracion_de_dominio_publico_del_distribuidor' and rv['license']['territorialLegalOpinion'] is False,'RV rights')
    require(rv['sourceArchive']['url']=='https://ebible.org/Scriptures/spaRV1909_usfm.zip' and rv['sourceArchive']['bytes']==2384901 and rv['sourceArchive']['sha256']=='56937c2be9ad278aed91370d6a15a98fe976f275d0cbaa6e26910291d949c7a5','RV archive')
    require(rv['sourceArchive']['bookFileCount']==66 and len(rv['sourceArchive']['files'])==66 and [x['book'] for x in rv['sourceArchive']['files']]==c['candidates'][0]['expectedBookCodes'],'RV inventory')
    require(all(re.fullmatch(r'[0-9a-f]{64}',x['sha256'] or '') and x['bytes']>0 for x in rv['sourceArchive']['files']),'RV fingerprints')
    require(rv['sourceArchive']['totals']=={'books':66,'chapters':1189,'verseMarkers':31102},'RV totals')
    require(len(rv['sourceArchive']['ancillaryFiles'])==4 and all(x['path'] not in [f['path'] for f in rv['sourceArchive']['files']] for x in rv['sourceArchive']['ancillaryFiles']),'RV ancillary')
    require(rv['scope']['canonId'] is None and rv['scope']['versificationId'] is None and rv['scope']['alignmentAllowed'] is False,'RV alignment')
    require(rv['projectPublication']=={'approved':False,'gate':'P11.4','licenseBasedEligibility':'según declaración de dominio público del distribuidor; revisión territorial pendiente'},'RV publication')
    require(g['sourceId']=='F03' and g['admissionStatus']=='admitido' and g['version']=='v1.2' and g['releaseDate']=='2023-07-10','Greek admission')
    require(g['sourceCommit']=='736fdc76158950c3d04b949b7e013ca14305145a' and g['sourceCommitDate']=='2023-07-11T00:28:38Z' and g['sourceCommitSignatureVerified'] is False,'Greek commit')
    require(g['license']['type']=='CC BY 4.0' and g['license']['licenseFile']['sha256']=='7e7170e3cebf88a9f60c7b8421418323c09304da1af4d5e90f4da1dc1c8a2661','Greek license')
    require(g['versionEvidence']=={'repository':'Faithlife/SBLGNT','commit':'d7f35adca9ec410e1d1499c63b4dd989d76c8d4d','path':'README.md','gitBlobSha1':'949c3358b814fee23f58714217f03a0c24685e98','version':'v1.2','releaseDate':'2023-07-10','description':'Add Jn 7:53-8:11 (Pericope Adulterae)'},'Greek version evidence')
    require(len(g['sourceFiles'])==27 and [x['book'] for x in g['sourceFiles']]==[x[0] for x in p91.GREEK_FILES],'Greek inventory')
    require(all(re.fullmatch(r'[0-9a-f]{64}',x['sha256'] or '') and x['bytes']>0 for x in g['sourceFiles']),'Greek fingerprints')
    require([[x['book'],x['path'],x['bytes'],x['gitBlobSha1']] for x in g['sourceFiles']]==[[x[0],x[1],x[2],x[3]] for x in p91.GREEK_FILES],'Greek git identity')
    require(g['totals']=={'books':27,'chapters':260,'verseMarkers':7939,'wordElements':137741},'Greek totals')
    require(g['scope']['canonId'] is None and g['scope']['versificationId'] is None and g['scope']['alignmentAllowed'] is False,'Greek alignment')
    require(g['scope']['pericopeAdulterae']=={'present':True,'markers':['John 7:53','John 8:11'],'treatment':'conservar como parte del contenido de esta edición; no inferir consenso canónico ni evidencia manuscrita a partir de su inclusión'},'pericope')
    require(g['projectPublication']=={'approved':False,'gate':'P11.4','licenseBasedEligibility':'redistribución y adaptación permitidas bajo CC BY 4.0, cumpliendo atribución y señalamiento de cambios'},'Greek publication')
    require(m['deferred'][0]['sourceId']=='F19' and m['deferred'][0]['status']=='sin_ampliacion','F19 scope')
    require(all(x['sourceId'] in ['F16','F17','F18','F22'] and x['status']=='pendiente_de_edicion_y_distribucion_concretas' for x in m['deferred'][1:5]),'deferred sources')
    require(all(x['status'] in ['consulta_externa_sin_admision_de_corpus','consulta_comercial_sin_admision'] for x in m['deferred'][5:]),'restricted sources')
    require(all(x['admissionStatus']=='admitido' and x['projectPublication']['approved'] is False and x['scope']['alignmentAllowed'] is False for x in (rv,g)),'admission boundary')
def verify():
    m=json.loads(ADMISSION.read_text(encoding='utf-8'));c=json.loads(CANDIDATES.read_text(encoding='utf-8'));validate_manifest(m,c)
    rv,g=m['decisions'];stage='RV-license'
    lic=p91.fetch(rv['license']['url'],512*1024);txt=lic.decode('utf-8',errors='strict').lower()
    require(sha(lic)==rv['license']['pageSha256'] and 'public domain' in txt and 'dominio público' in txt and '1909' in txt,'RV license page')
    stage='RV-details';details=p91.fetch(rv['license']['detailsUrl'],512*1024).decode('utf-8',errors='strict').lower()
    require('sparv1909' in details and 'public domain' in details and 'dominio público' in details,'RV details')
    stage='RV-archive';archive=p91.fetch(rv['sourceArchive']['url'],16*1024*1024)
    require(len(archive)==rv['sourceArchive']['bytes'] and sha(archive)==rv['sourceArchive']['sha256'],'RV archive fingerprint')
    actual=p91.audit_zip(archive)
    require(actual['files']==rv['sourceArchive']['files'] and actual['ancillary']==rv['sourceArchive']['ancillaryFiles'] and actual['books']==66 and actual['chapters']==1189 and actual['verseMarkers']==31102,'RV member fingerprints')
    stage='SBL-license';license=p91.fixed({'path':'LICENSE','bytes':18650,'gitBlobSha1':'2f244ac814036ecd9ba9f69782e89ce6b1dca9eb','sha256':g['license']['licenseFile']['sha256']})
    require(b'Attribution 4.0 International' in license,'SBL license')
    stage='SBL-readme';readme=p91.fixed(g['license']['readmeAtCorpusCommit'])
    require(b'CC BY 4.0' in readme and b'Copyright 2010' in readme,'SBL attribution')
    stage='SBL-about';about=p91.fixed(g['sourceMetadata']['about'])
    require(b'Michael W. Holmes' in about,'SBL editor')
    stage='SBL-version';version=p91.fetch('https://raw.githubusercontent.com/Faithlife/SBLGNT/d7f35adca9ec410e1d1499c63b4dd989d76c8d4d/README.md',64*1024)
    require(p91.blob(version)==g['versionEvidence']['gitBlobSha1'] and all(x in version for x in (b'v1.2',b'2023-07-10',b'Jn 7:53-8:11',b'Pericope Adulterae')),'SBL version')
    metadata=p91.fetch('https://raw.githubusercontent.com/Faithlife/SBLGNT/736fdc76158950c3d04b949b7e013ca14305145a/data/sblgnt/xml/sblgnt.xml',4096)
    require(p91.blob(metadata)==g['sourceMetadata']['sblgntXml']['gitBlobSha1'] and b'Michael W. Holmes' in metadata,'SBL metadata')
    stage='SBL-books';actual_g=[]
    for f in g['sourceFiles']:
        stage='SBL-'+f['book'];b=p91.fixed(f);metrics=p91.greek(b);actual_g.append({'book':f['book'],'order':f['order'],'path':f['path'],'bytes':len(b),'gitBlobSha1':f['gitBlobSha1'],'sha256':sha(b),**metrics})
        if f['book']=='John':
            refs={x.get('id') for x in ET.fromstring(b).iter('verse-number')}
            require('John 7:53' in refs and 'John 8:11' in refs,'SBL pericope markers')
    require(actual_g==g['sourceFiles'],'SBL metrics and fingerprints')
    stage='public-registries'
    registry=json.loads((ROOT/'src/data/linguistica/registro.json').read_text(encoding='utf-8'))
    publications=json.loads((ROOT/'src/data/publicaciones/registro.json').read_text(encoding='utf-8'))
    require(registry=={'schemaVersion':1,**{k:[] for k in ('editions','units','tokens','lemmas','identifiers','analyses','morphCodes')}},'linguistic registry')
    require(publications=={'schemaVersion':1,'snapshots':[]},'publication registry')
    print(json.dumps({'phase':'P9.1.2','admittedEditions':2,'rv1909':{'books':actual['books'],'chapters':actual['chapters'],'verseMarkers':actual['verseMarkers'],'archiveBytes':len(archive),'archiveSha256':sha(archive),'fileChecksums':len(actual['files'])},'sblgnt':{'version':'v1.2','books':len(actual_g),'chapters':sum(x['chapters'] for x in actual_g),'verseMarkers':sum(x['verseMarkers'] for x in actual_g),'wordElements':sum(x['wordElements'] for x in actual_g),'fileChecksums':len(actual_g),'pericopeAdulteraePresent':True},'newAdmissions':2,'corpusPersisted':False,'publicRegistriesEmpty':True,'alignmentCreated':0,'publicationAuthorized':False},ensure_ascii=True,indent=2))
def main():
    stage='manifest'
    try:verify()
    except Exception as e:
        safe={'phase','audit evidence','decision scope','publication gate','controls','decision count','RV admission','RV rights','RV archive','RV inventory','RV fingerprints','RV totals','RV ancillary','RV alignment','RV publication','Greek admission','Greek commit','Greek license','Greek version evidence','Greek inventory','Greek fingerprints','Greek git identity','Greek totals','Greek alignment','pericope','Greek publication','F19 scope','deferred sources','restricted sources','admission boundary','download bound','redirect','RV license page','RV details','RV archive fingerprint','RV member fingerprints','SBL license','SBL attribution','SBL editor','SBL version','SBL metadata','SBL pericope markers','SBL metrics and fingerprints','linguistic registry','publication registry'}
        print('P9.1.2 failed ('+(str(e) if str(e) in safe else type(e).__name__)+'); no corpus persisted',file=sys.stderr);return 1
    return 0
if __name__=='__main__':sys.exit(main())
