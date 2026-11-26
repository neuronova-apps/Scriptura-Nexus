import importlib.util,json,pathlib,unittest
ROOT=pathlib.Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('p922',ROOT/'scripts/reader-navigation-p922.py')
n=importlib.util.module_from_spec(spec);spec.loader.exec_module(n)
p=n.p
RV='TXT-RV1909';BOOK='LIB-GEN';RES='REC-ED-C01-GEN'

def sample():
    units,_=p.parse_usfm_units(b'\\id GEN\n\\c 1\n\\v 1a A\n\\v 2-3 B\n\\v 4 \n\\c 3\n\\v 1 C\n','GEN',RV,BOOK,RES)
    # The historical report is used to initialize the structure, then a tiny
    # isolated fixture exercises the navigation mechanics without network.
    report=json.loads(n.EXPECTED.read_text(encoding='utf-8'))
    nav=n.ReaderNavigation(report)
    nav._editions={RV:(BOOK,),'TXT-SBLGNT-V1-2':()}
    nav._fragments={(RV,BOOK):{'resourceId':RES,'unitCount':len(units),'chapters':2,'emptyUnitCount':1,
                              'emptyUnitLocators':['GEN.1.4'],'rangeMarkers':1,'projectionSha256':p.digest_units(units)}}
    return nav,units

class Navigation(unittest.TestCase):
    def ready(self):
        nav,units=sample();nav.add_fragment(RV,BOOK,units);nav.finalize();return nav
    def test_exact_labels_and_source_order(self):
        nav=self.ready()
        self.assertEqual(nav.books(RV)['books'],[BOOK])
        self.assertEqual(nav.chapters(RV,BOOK)['chapters'],['1','3'])
        self.assertEqual(nav.verses(RV,BOOK,'1')['verses'],['1a','2-3','4'])
        self.assertEqual(nav.locate(RV,BOOK,'1','2-3')['status'],'verified_fragment')
        for v in ['1','2','3','2–3']:
            self.assertEqual(nav.locate(RV,BOOK,'1',v)['status'],'reference_not_found')
    def test_absence_and_empty_are_distinct(self):
        nav=self.ready()
        self.assertEqual(nav.locate('unknown',BOOK,'1','1')['status'],'edition_unavailable')
        self.assertEqual(nav.locate('TXT-SBLGNT-V1-2',BOOK,'1','1')['status'],'book_outside_coverage')
        self.assertEqual(nav.locate(RV,BOOK,'2','1')['status'],'chapter_not_found')
        self.assertEqual(nav.locate(RV,BOOK,'1','4')['status'],'empty_marker')
        self.assertEqual(nav.locate(RV,BOOK,1,'4')['status'],'chapter_not_found')
    def test_neighbors_cross_chapter_but_do_not_invent_labels(self):
        nav=self.ready();row=nav.locate(RV,BOOK,'1','4')
        self.assertEqual(row['previous']['verse'],'2-3')
        self.assertEqual(row['next']['chapter'],'3')
        self.assertIsNone(nav.locate(RV,BOOK,'1','1a')['previous'])
        self.assertIsNone(nav.locate(RV,BOOK,'3','1')['next'])
    def test_rejects_tampered_text_and_wrong_identity(self):
        nav,units=sample();units[0]['text']='altered'
        with self.assertRaisesRegex(ValueError,'fingerprint'):nav.add_fragment(RV,BOOK,units)
        nav,units=sample()
        with self.assertRaisesRegex(ValueError,'identity'):nav.add_fragment(RV,'LIB-EXO',units)
    def test_rejects_duplicate_reference_even_with_matching_digest(self):
        nav,units=sample()
        units[1].update(chapter=units[0]['chapter'],verse=units[0]['verse'])
        nav._fragments[(RV,BOOK)]['projectionSha256']=p.digest_units(units)
        with self.assertRaisesRegex(ValueError,'duplicate reference'):nav.add_fragment(RV,BOOK,units)
    def test_requires_complete_finalization(self):
        nav,units=sample()
        with self.assertRaisesRegex(ValueError,'not finalized'):nav.chapters(RV,BOOK)
        with self.assertRaisesRegex(ValueError,'incomplete'):nav.finalize()
        nav.add_fragment(RV,BOOK,units)
        with self.assertRaisesRegex(ValueError,'identity'):nav.add_fragment(RV,BOOK,units)
        nav.finalize()
    def test_returns_detached_metadata_without_text(self):
        nav=self.ready();row=nav.locate(RV,BOOK,'1','1a')
        self.assertNotIn('text',row['reference'])
        self.assertFalse(row['publicationEnabled'])
        row['reference']['verse']='changed'
        self.assertEqual(nav.locate(RV,BOOK,'1','1a')['reference']['verse'],'1a')
        self.assertEqual(nav.audit()['roundTrips'],4)
        self.assertEqual(nav.audit()['emptyMarkers'],1)

if __name__=='__main__':unittest.main()
