const projectsData = [
  {
    projectName: "1,000 Bat Genomes (Bat1K)",
    continent: "Europe",
    type: "Headquarters",
    address: "Pfotenhauerstraße 108, 01307 Dresden",
    website: "https://bat1k.com/",
    latitude: 51.0565960135475,
    longitude: 13.7767650686559
  },
  {
    projectName: "1,000 Chilean Genomes",
    continent: "South America",
    type: "Headquarters",
    address: "Av Alameda Libertador Bernardo O'Higgins 340, Santiago, Chile",
    website: "https://1000genomas.cl/",
    latitude: -33.4413779252253,
    longitude: -70.6405703032793
  },
  {
    projectName: "10,000 bird genomes (B10k)",
    continent: "Asia",
    type: "Headquarters",
    address: "Building 11, Beishan Industrial Zone, Yantian District, Shenzhen 518083, China",
    website: "https://b10k.genomics.cn/",
    latitude: 22.5918312795627,
    longitude: 114.261089081046
  },
  {
    projectName: "10,000 Plant Genomes (10KP)",
    continent: "Asia",
    type: "Headquarters",
    address: "BGI Research, Shenzhen 518083, China",
    website: "https://academic.oup.com/gigascience/article/7/3/giy013/4880447",
    latitude: 22.7512392723508,
    longitude: 114.396686696391
  },
  {
    projectName: "5,000 Insect Genomes (i5k)",
    continent: "North America",
    type: "Headquarters",
    address: "10301 Baltimore Avenue, Beltsville, MD 20705, United States",
    website: "http://i5k.github.io/",
    latitude: 39.045753,
    longitude: -76.847318
  },
  {
    projectName: "African BioGenome Project (AfricaBP)",
    continent: "Africa",
    type: "Headquarters",
    address: "Jomo Kenyatta University of Agriculture and Technology, Juja Kwale, Rd, Juja, Kenya",
    website: "http://africanbiogenome.org/",
    latitude: -1.09100401486439,
    longitude: 37.0118027267846
  },
  {
    projectName: "Ag100Pest",
    continent: "North America",
    type: "Headquarters",
    address: "1400 Independence Ave. SW Washington, DC 20250, United States",
    website: "https://www.ars.usda.gov/news-events/news/research-news/2018/earth-biogenome-project-could-hold-solutions-for-agricultures-future/",
    latitude: 38.886960590551,
    longitude: -77.0294015895757
  },
  {
    projectName: "Amphibian Genomics Consortium (AGC)",
    continent: "Australia",
    type: "Headquarters",
    address: "The University of Melbourne Grattan Street, Parkville Victoria, 3010, Australia",
    website: "https://mvs.unimelb.edu.au/amphibian-genomics-consortium",
    latitude: -37.7982102296058,
    longitude: 144.961006183392
  },
  {
    projectName: "Aquatic Symbiosis Genomics Project (ASG)",
    continent: "Europe",
    type: "Headquarters",
    address: "Wellcome Trust Genome Campus, Hinxton, Saffron Walden CB10 1RQ, United Kingdom",
    website: "https://www.sanger.ac.uk/collaboration/aquatic-symbiosis-genomics-project/",
    latitude: 52.0796451238228,
    longitude: 0.184780873972139
  },
  {
    projectName: "An Atlas of Eukaryotic Marine Genomes (ATLASea)",
    continent: "North America",
    type: "Headquarters",
    address: "École normale supérieure 46, Rue d'Ulm 75005 Paris",
    website: "http://www.atlasea.fr/en/",
    latitude: 48.842107,
    longitude: 2.34399
  },
  {
    projectName: "Australian Amphibian and Reptile Genomics Initiative Collaboration (AusARG)",
    continent: "Australia",
    type: "Headquarters",
    address: "University of Canberra, Bruce ACT 2617 Australia",
    website: "https://www.canberra.edu.au/research/research-centres/research-centres-and-institutes/research-institute-for-ecology-and-evolution",
    latitude: -35.2386,
    longitude: 149.0631
  },
  {
    projectName: "Beenome100 Project (BEENOME100)",
    continent: "North America",
    type: "Headquarters",
    address: "306 Center Road Beltsville, MD 20705, United States",
    website: "https://www.beenome100.org/",
    latitude: 39.0258,
    longitude: -76.9269
  },
  {
    projectName: "BRIDGE Colombia",
    continent: "South America",
    type: "Headquarters",
    address: "La Candelaria, Bogota, Cundinamarca, Colombia",
    website: "https://www.bridgecolombia.org/",
    latitude: 4.6097305,
    longitude: -74.081749
  },
  {
    projectName: "Butterfly Genome Project",
    continent: "Asia",
    type: "Headquarters",
    address: "E Jiaochang Rd, Wuhua District, Kunming, Yunnan, 650023, China",
    website: "http://butterflygenome.org/",
    latitude: 25.0742046150302,
    longitude: 102.710641454124
  },
  {
    projectName: "California Conservation Genomes Project (CCGP)",
    continent: "North America",
    type: "Headquarters",
    address: "610 Charles E Young Drive South, Los Angeles, CA 90095, United States",
    website: "https://www.ccgproject.org/",
    latitude: 34.0972216681351,
    longitude: -118.815749345584
  },
  {
    projectName: "Canadian BioGenome Project (CanBP)",
    continent: "North America",
    type: "Headquarters",
    address: "675 W 10th Ave, Vancouver, BC V5Z 0B4, Canada",
    website: "https://earthbiogenome.ca/",
    latitude: 49.260125680538,
    longitude: -123.242998256668
  },
  {
    projectName: "Canada 150 Sequencing Initiative (CanSeq150)",
    continent: "North America",
    type: "Headquarters",
    address: "170 Elizabeth St, Toronto, ON M5G 1E8, Canada",
    website: "http://www.cgen.ca/canseq150",
    latitude: 43.65107,
    longitude: -79.347019
  },
  {
    projectName: "Cartilaginous Fish Genome Project (CFGP)",
    continent: "Asia",
    type: "Headquarters",
    address: "127 West Youyi Road, Beilin District, Xi'an Shaanxi, 710072, China",
    website: null,
    latitude: 34.2412052735955,
    longitude: 108.928872912091
  },
  {
    projectName: "Catalan Initiative for the Earth BioGenome Project (CBP)",
    continent: "Europe",
    type: "Headquarters",
    address: "Departament de Genètica, Microbiologia i Estadística. Avinguda Diagonal, 643. 08028 Barcelona, Spain",
    website: "https://www.scb.cat/biogenoma/en/home/",
    latitude: 41.3808991236495,
    longitude: 2.17014177004785
  },
  {
    projectName: "Cetaceans Genomes Project (CGP)",
    continent: "North America",
    type: "Headquarters",
    address: "8901 La Jolla Shores Dr., La Jolla, CA, 92037, United States",
    website: null,
    latitude: 32.8661,
    longitude: -117.2508738
  },
  {
    projectName: "Crab Genome Project",
    continent: "Asia",
    type: "Headquarters",
    address: "Yancheng, 224051, China",
    website: null,
    latitude: 39.2865459316367,
    longitude: -76.6058867760655
  },
  {
    projectName: "Darwin Tree of Life (DToL)",
    continent: "Europe",
    type: "Headquarters",
    address: "Wellcome Trust Genome Campus, Hinxton, Saffron Walden CB10 1RQ, United Kingdom",
    website: "https://www.darwintreeoflife.org/",
    latitude: 52.0795000649971,
    longitude: 0.184695043288939
  },
  {
    projectName: "Deep-Ocean Genomes Project (DOG)",
    continent: "North America",
    type: "Headquarters",
    address: "86 Water St, Falmouth, MA 02543, United States",
    website: null,
    latitude: 41.5244675626808,
    longitude: -70.6709633452875
  },
  {
    projectName: "Diversity Initiative for the Southern California Ocean (DISCO)",
    continent: "North America",
    type: "Headquarters",
    address: "900 Exposition Blvd, Los Angeles, CA 90007, United States",
    website: "https://research.nhm.org/disco/",
    latitude: 34.01740738578,
    longitude: -118.288689532093
  },
  {
    projectName: "Dresden HQ Genomes Project",
    continent: "Europe",
    type: "Headquarters",
    address: "CRTD, TU Dresden, Fetscherstr. 105, 01307 Dresden, Germany",
    website: null,
    latitude: 51.0565960135475,
    longitude: 13.7767650686559
  },
  {
    projectName: "EBP Secretariat",
    continent: "North America",
    type: "Center",
    address: "777E. University Dr. Tempe, AZ 85287, United States",
    website: "https://www.earthbiogenome.org/",
    latitude: 33.4214,
    longitude: -111.9281
  },
  {
    projectName: "EBP-Norway",
    continent: "Europe",
    type: "Headquarters",
    address: "Problemveien 11, 0313 Oslo, Norway",
    website: null,
    latitude: 59.9406157780805,
    longitude: 10.7215439556399
  },
  {
    projectName: "Hong Kong EBP (EBPHK)",
    continent: "Asia",
    type: "Headquarters",
    address: "Ma Liu Shui, Hong Kong",
    website: "http://biodiversity.sls.cuhk.edu.hk/ebphk/",
    latitude: 22.419783665852,
    longitude: 114.206728409877
  },
  {
    projectName: "Italian Endemics (ENDEMIXIT)",
    continent: "Europe",
    type: "Headquarters",
    address: "Via Savonarola, 9, 44121 Ferrara FE, Italy",
    website: "https://endemixit.com/",
    latitude: 44.8335754398815,
    longitude: 11.6263254702019
  },
  {
    projectName: "Epizoic Diatom Genomes Project",
    continent: "Europe",
    type: "Headquarters",
    address: "Building F1 11 Hoffman Street Potchefstroom 2531, Norway",
    website: null,
    latitude: 67.290362,
    longitude: 14.564075
  },
  {
    projectName: "Euglena International Network (EIN)",
    continent: "Europe",
    type: "Headquarters",
    address: "Nottingham NG7 2RD, United Kingdom",
    website: "https://euglenanetwork.wordpress.com/",
    latitude: 52.9388840823385,
    longitude: -1.19553812098056
  },
  {
    projectName: "European Reference Genome Atlas (ERGA)",
    continent: "Europe",
    type: "Node",
    address: "2 Rue Gaston Crémieux, 91057 Évry, France",
    website: "https://www.erga-biodiversity.eu/",
    latitude: 48.623917,
    longitude: 2.439806
  },
  {
    projectName: "ERGA-25GP",
    continent: "Europe",
    type: "Headquarters",
    address: "Wellcome Trust Genome Campus, Hinxton, Saffron Walden CB10 1RQ, United Kingdom",
    website: "https://www.sanger.ac.uk/collaboration/25-genomes-for-25-years/",
    latitude: 52.506110140837,
    longitude: 13.5214660552365
  },
  {
    projectName: "ERGA-BGE",
    continent: "Europe",
    type: "Headquarters",
    address: "Naturalis Biodiversity Center, Darwinweg 2, 2333 CR Leiden, The Netherlands",
    website: "https://biodiversitygenomics.eu/",
    latitude: 52.1591666666667,
    longitude: 5.75222222222222
  },
  {
    projectName: "ERGA-CH",
    continent: "Europe",
    type: "Headquarters",
    address: "Elisabethenstrasse 43, 4051 Basel, Switzerland",
    website: "https://www.sib.swiss/news/scaling-up-biodiversity-genomics-across-europe",
    latitude: 47.5537,
    longitude: 7.5891
  },
  {
    projectName: "ERGA-COM",
    continent: "Europe",
    type: "Headquarters",
    address: "Alfred-Kowalke-Straße 17, 10315 Berlin, Germany",
    website: "https://www.erga-biodiversity.eu/",
    latitude: 52.506110140837,
    longitude: 13.5214660552365
  },
  {
    projectName: "ERGA-FR",
    continent: "Europe",
    type: "Headquarters",
    address: "CNRGH Genoscope2, rue Gaston Crémieux CP5706 91 057 Evry Cedex",
    website: "https://www.france-genomique.org/projet/erga-pilot/?lang=en",
    latitude: 48.623917,
    longitude: 2.439806
  },
  {
    projectName: "ERGA-PIL",
    continent: "Europe",
    type: "Headquarters",
    address: "Alfred-Kowalke-Straße 17, 10315 Berlin, Germany",
    website: "https://www.erga-biodiversity.eu/",
    latitude: 52.506110140837,
    longitude: 13.5214660552365
  },
  {
    projectName: "Fish 10,000 Genomes (Fish10K)",
    continent: "Asia",
    type: "Headquarters",
    address: "Guangdong Province, Shenzhen, Pingshan, 200m west of Jinsha Rd, Postal code: 518122, China",
    website: "http://english.cas.cn/newsroom/research_news/life/201910/t20191008_219736.shtml",
    latitude: 22.7503462738405,
    longitude: 114.396477284745
  },
  {
    projectName: "Genome 10K(G10K)",
    continent: "North America",
    type: "Headquarters",
    address: "1230 York Avenue, New York, NY, 10065",
    website: "https://genome10k.soe.ucsc.edu/",
    latitude: 40.762546086418,
    longitude: -73.9561296183326
  },
  {
    projectName: "Genomics of the Brazilian Biodiversity (GBB)",
    continent: "South America",
    type: "Headquarters",
    address: "Praia de Botafogo, Rio de Janeiro/RJ, Brazil, CEP: 22250-145",
    website: "https://www.itv.org/en/genomics-of-the-brazilian-biodiversity-gbb/",
    latitude: -1.4466457631436,
    longitude: -48.4822375192399
  },
  {
    projectName: "Global Genome Biodiversity Network (GGBN)",
    continent: "North America",
    type: "Headquarters",
    address: "10th and Constitution Ave. NW Washington DC 20013, USA",
    website: "http://data.ggbn.org/ggbn_portal/",
    latitude: 38.8866350911631,
    longitude: -77.0250830895758
  },
  {
    projectName: "Global Ant Genome Alliance (GAGA)",
    continent: "Asia",
    type: "Headquarters",
    address: "China National GeneBank. Address: Shenzhen 518120, China",
    website: "http://antgenomics.dk/",
    latitude: 22.5929743330096,
    longitude: 114.475597809881
  },
  {
    projectName: "Global Invertebrates Genome Alliance (GIGA)",
    continent: "North America",
    type: "Headquarters",
    address: "8000 North Ocean Drive Dania Beach, FL 33004, United States",
    website: "http://giga-cos.org/",
    latitude: 26.090731,
    longitude: -80.111549
  },
  {
    projectName: "Illinois EBP Pilot (ILEBP)",
    continent: "North America",
    type: "Headquarters",
    address: "1206 West Gregory Drive | MC-195 Urbana, IL 61801, United States",
    website: null,
    latitude: 40.1053111327455,
    longitude: -88.2247621732453
  },
  {
    projectName: "Lilioid Monocots Core Group Genome Project (LMGP)",
    continent: "Asia",
    type: "Headquarters",
    address: "Shaanxi, Xi'An, Beilin, 127 Youyi West Rd, Postal code: 710060, China",
    website: null,
    latitude: 34.2416950960594,
    longitude: 108.91149145442
  },
  {
    projectName: "Senckenberg Translational Biodiversity Genomics (SGN-TBG)",
    continent: "Europe",
    type: "Headquarters",
    address: "Am Jakobskirchhof 4, 99423 Weimar, Germany",
    website: "https://tbg.senckenberg.de/",
    latitude: 50.9835203315002,
    longitude: 11.3273833839938
  },
  {
    projectName: "Ocean Genomes (OG)",
    continent: "Australia",
    type: "Headquarters",
    address: "171-173 Mounts Bay Rd, Perth WA 6000 Australia",
    website: null,
    latitude: -31.9805340353065,
    longitude: 115.819773580779
  },
  {
    projectName: "Open Green Genomes (OGG)",
    continent: "North America",
    type: "Headquarters",
    address: "Department of Plant Biology, University of Georgia, Athens GA 30605, United States",
    website: "https://jgi.doe.gov/csp-2018-leebens-mack-open-green-genomes-initiative/",
    latitude: 33.9519346,
    longitude: -77.0250830895758
  },
  {
    projectName: "PhyloAlps",
    continent: "Europe",
    type: "Headquarters",
    address: "LECA, BP 53 Domaine Universitaire de Grenoble 2233 Rue de la Piscine 38041 Grenoble Cedex 9, France",
    website: "http://phyloalps.org/",
    latitude: 45.1937931440174,
    longitude: 5.77716508556027
  },
  {
    projectName: "Plant and Fungi Trees of Life (PAFTOL)",
    continent: "Europe",
    type: "Headquarters",
    address: "Kew, Richmond, London, TW9 3AE, United Kingdom",
    website: null,
    latitude: 51.4855110552546,
    longitude: -0.290697322579766
  },
  {
    projectName: "Plant GARDEN",
    continent: "Asia",
    type: "Headquarters",
    address: "2-6-8 Kazusa Kamatari, Kisarazu, Chiba, 2920818",
    website: "https://plantgarden.jp/en/index",
    latitude: 35.3299043082877,
    longitude: 139.990672369802
  },
  {
    projectName: "Polar Genomes Project (PGP)",
    continent: "Asia",
    type: "Headquarters",
    address: "26 Songdomirae-ro, Yeonsu-gu, Incheon, South Korea",
    website: null,
    latitude: 37.3680463005293,
    longitude: 126.646222252692
  },
  {
    projectName: "Primate Genome Project (PRGP)",
    continent: "Asia",
    type: "Headquarters",
    address: "866 Yuhangtang Rd, Xihu, Hangzhou, Zhejiang, 310027, China",
    website: null,
    latitude: 30.3131165469954,
    longitude: 120.08672252437
  },
  {
    projectName: "Project Psyche",
    continent: "Europe",
    type: "Headquarters",
    address: "Wellcome Trust Genome Campus, Hinxton, Saffron Walden CB10 1RQ, United Kingdom",
    website: "https://www.projectpsyche.org/",
    latitude: 52.0811879930689,
    longitude: 0.183890380633945
  },
  {
    projectName: "Soil Invertebrate Genome Initiative (METAINVERT)",
    continent: "Europe",
    type: "Headquarters",
    address: "Georg-Voigt-Str. 14-16, 60388 Frankfurt am Main, Germany",
    website: null,
    latitude: 50.1171516011758,
    longitude: 8.65149548210233
  },
  {
    projectName: "Genome Sequencing and Assembly of Chondrichthyans (SQUALOMIX)",
    continent: "Asia",
    type: "Headquarters",
    address: "1111 Yata, Mishima, Shizuoka 411-8540, JAPAN",
    website: "https://github.com/Squalomix/info/",
    latitude: 35.1178210867781,
    longitude: 138.938615112123
  },
  {
    projectName: "Taiwan BioGenomes Project",
    continent: "Asia",
    type: "Headquarters",
    address: "No. 128, Section 2, Academia Rd, Nangang District, Taipei City, Taiwan",
    website: null,
    latitude: 25.0423165399513,
    longitude: 121.616195611794
  },
  {
    projectName: "Threatened Species Initiative (TSI)",
    continent: "Australia",
    type: "Headquarters",
    address: "Camperdown NSW 2050, Australia",
    website: "https://threatenedspeciesinitiative.com/",
    latitude: -33.8893520146476,
    longitude: 151.176609459036
  },
  {
    projectName: "Ungulates Genome Project",
    continent: "Asia",
    type: "Headquarters",
    address: "Shaanxi, Xi'An, Beilin, 127 Youyi West Rd, Postal code: 710060, China",
    website: null,
    latitude: 34.2415797961091,
    longitude: 108.911469996749
  },
  {
    projectName: "University of California Consortium (CAL-EBP)",
    continent: "North America",
    type: "Headquarters",
    address: "1115 11th St, Sacramento, CA 95814, United States",
    website: null,
    latitude: 38.5785614673696,
    longitude: -121.492643403082
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    continent: "North America",
    type: "Headquarters",
    address: "1230 York Ave, New York, NY 10065, United States",
    website: "https://vertebrategenomesproject.org/",
    latitude: 40.762546086418,
    longitude: -73.9561296183326
  },
  {
    projectName: "Wise Ancestors (WA)",
    continent: "North America",
    type: "Headquarters",
    address: "241 Kings Village Rd, Scotts Valley, CA 95066",
    website: "http://www.wiseancestors.org",
    latitude: 36.955401,
    longitude: -122.058069
  },
  {
    projectName: "Yggdrasil(YGG)",
    continent: "Europe",
    type: "Headquarters",
    address: "Øster Voldgade 7, 1350 København, Denmark",
    website: null,
    latitude: 55.6760968,
    longitude: 12.5683371
  },
  {
    projectName: "200 Mammals Project (ZOONOMIA)",
    continent: "North America",
    type: "Headquarters",
    address: "Merkin Building 415 Main St. Cambridge, MA 02142, United States",
    website: "https://www.broadinstitute.org/200-mammals-variant-data",
    latitude: 42.3629661377069,
    longitude: -71.0887906164154
  },
  {
    projectName: "Canadian BioGenome Project (CanBP)",
    institution: "SickKids Hospital",
    type: "Site",
    activities: "DNA Sequencing (long reads), DNA Sequencing (short reads), Bioinformatics (assembly), Bioinformatics (annotation)",
    address: "170 Elizabeth St, Toronto, ON M5G 1E8, Canada",
    latitude: 43.6576007,
    longitude: -79.38650109999999
  },
  {
    projectName: "Canadian BioGenome Project (CanBP)",
    institution: "McGill University",
    type: "Site",
    activities: "DNA Sequencing (long reads), DNA Sequencing (short reads), Bioinformatics (assembly), Bioinformatics (annotation)",
    address: "845 Rue Sherbrooke O, Montréal, QC H3A 0G4, Canada",
    latitude: 45.5063178,
    longitude: -73.5767035
  },
  {
    projectName: "Canadian BioGenome Project (CanBP)",
    institution: "Canadian Mountain Network",
    type: "Site",
    activities: "DNA Sequencing (long reads), DNA Sequencing (short reads), Bioinformatics (assembly), Bioinformatics (annotation)",
    address: "CCIS 3-170. University of Alberta Edmonton, AB, Canada T6G 2E9",
    latitude: 53.5281589,
    longitude: -113.5257417
  },
  {
    projectName: "Canadian BioGenome Project (CanBP)",
    institution: "CanSeq150",
    type: "Site",
    activities: "DNA Sequencing (long reads), DNA Sequencing (short reads), Bioinformatics (assembly), Bioinformatics (annotation)",
    address: "170 Elizabeth St, Toronto, ON M5G 1E8, Canada",
    latitude: 43.6576007,
    longitude: -79.38650109999999
  },
  {
    projectName: "Canada 150 Sequencing Initiative (CanSeq150)",
    institution: "BC Cancer",
    type: "Site",
    activities: "DNA Sequencing (long reads), DNA Sequencing (short reads), Bioinformatics (assembly), Bioinformatics (annotation)",
    address: "675 W 10th Ave, Vancouver, BC V5Z 0B4, Canada",
    latitude: 49.2626787,
    longitude: -123.1194676
  },
  {
    projectName: "Canada 150 Sequencing Initiative (CanSeq150)",
    institution: "SickKids Hospital",
    type: "Site",
    activities: "DNA Sequencing (long reads), DNA Sequencing (short reads), Bioinformatics (assembly), Bioinformatics (annotation)",
    address: "170 Elizabeth St, Toronto, ON M5G 1E8, Canada",
    latitude: 43.6576007,
    longitude: -79.38650109999999
  },
  {
    projectName: "Canada 150 Sequencing Initiative (CanSeq150)",
    institution: "McGill University",
    type: "Site",
    activities: "DNA Sequencing (long reads), DNA Sequencing (short reads), Bioinformatics (assembly), Bioinformatics (annotation)",
    address: "845 Rue Sherbrooke O, Montréal, QC H3A 0G4, Canada",
    latitude: 45.5063178,
    longitude: -73.5767035
  },
  {
    projectName: "Yggdrasil (YGG)",
    institution: "Center for Evolutionary Hologenomics",
    type: "Site",
    activities: "Processing",
    address: "Øster Voldgade 7, 1350 København, Denmark",
    latitude: 55.6874319,
    longitude: 12.5775307
  },
  {
    projectName: "Yggdrasil (YGG)",
    institution: "Section for Microbiology",
    type: "Site",
    activities: "DNA Sequencing (long reads)",
    address: "Ole Maaløes Vej 5, 2200 København, Denmark",
    latitude: 55.7018849,
    longitude: 12.5580107
  },
  {
    projectName: "Yggdrasil (YGG)",
    institution: "Novogene",
    type: "Site",
    activities: "DNA Sequencing (long reads)",
    address: "Am Klopferspitz 19a, 82152 Martinsried, Munich, Germany",
    latitude: 48.1076651,
    longitude: 11.4593902
  },
  {
    projectName: "Yggdrasil (YGG)",
    institution: "Novogene",
    type: "Site",
    activities: "DNA Sequencing (short reads)",
    address: "Am Klopferspitz 19a, 82152 Martinsried, Munich, Germany",
    latitude: 48.1076651,
    longitude: 11.4593902
  },
  {
    projectName: "Yggdrasil (YGG)",
    institution: "Novogene",
    type: "Site",
    activities: "RNA Sequencing",
    address: "Am Klopferspitz 19a, 82152 Martinsried, Munich, Germany",
    latitude: 48.1076651,
    longitude: 11.4593902
  },
  {
    projectName: "Yggdrasil (YGG)",
    institution: "Center for Evolutionary Hologenomics",
    type: "Site",
    activities: "Bioinformatics (assembly and annotation), Biobanking",
    address: "Øster Voldgade 7, 1350 København, Denmark",
    latitude: 55.6874319,
    longitude: 12.5775307
  },
  {
    projectName: "Yggdrasil (YGG)",
    institution: "Center for Evolutionary Hologenomics",
    type: "Site",
    activities: "Biobanking",
    address: "Øster Voldgade 7, 1350 København, Denmark",
    latitude: 55.6874319,
    longitude: 12.5775307
  },
  {
    projectName: "Yggdrasil (YGG)",
    institution: "Center for Evolutionary Hologenomics",
    type: "Site",
    activities: "Bioinformatics (genome analysis)",
    address: "Øster Voldgade 7, 1350 København, Denmark",
    latitude: 55.6874319,
    longitude: 12.5775307
  },
  {
    projectName: "Yggdrasil (YGG)",
    institution: "Center for Evolutionary Hologenomics",
    type: "Site",
    activities: "Bioinformatics (databases and informatics support), Processing",
    address: "Øster Voldgade 7, 1350 København, Denmark",
    latitude: 55.6874319,
    longitude: 12.5775307
  },
  {
    projectName: "Wise Ancestors (WA)",
    institution: "ALEXANDER VON HUMBOLDT BIOLOGICAL RESOURCES RESEARCH INSTITUTE",
    type: "Site",
    activities: "Collecting, Bioinformatics (genome analysis)",
    address: "Calle 72 - 65 Piso 7, Chapinero, Bogotá, Cundinamarca, Colombia",
    latitude: 4.6535353,
    longitude: -74.05484229999999
  },
  {
    projectName: "Wise Ancestors (WA)",
    institution: "Department of Organismic and Evolutionary Biology, Harvard University",
    type: "Site",
    activities: "DNA Sequencing (long reads), DNA Sequencing (short reads), RNA Sequencing, Bioinformatics (assembly)",
    address: "26 Oxford Street, Cambridge, MA 02138, USA",
    latitude: 42.3784629,
    longitude: -71.1155576
  },
  {
    projectName: "Wise Ancestors (WA)",
    institution: "BioQuest",
    type: "Site",
    activities: "Collecting, DNA Sequencing (long reads), RNA Sequencing, Bioinformatics (assembly)",
    address: "46 Reid Street, Hamilton, Bermuda",
    latitude: 32.2931069,
    longitude: -64.78306590000001
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Sanger Institute (DToL, Sanger 25G)",
    type: "Site",
    activities: "Affiliate",
    address: "Wellcome Genome Campus, Hinxton, Cambridgeshire, CB10 1SA. UK",
    latitude: 52.0802014,
    longitude: 0.1871654
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Max Planck Dresden",
    type: "Site",
    activities: "Affiliate",
    address: "Max Planck Institute of Molecular Cell Biology and Genetics, Pfotenhauerstr. 108, 01307 Dresden, Germany",
    latitude: 51.058636,
    longitude: 13.7845069
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "NHGRI",
    type: "Site",
    activities: "Affiliate",
    address: "Center for Genomics and Data Science Research, BG 49 RM 4A22, 49 Covent DR, Bethesda MD 20892",
    latitude: 38.9998705,
    longitude: -77.10599669999999
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Amazoomics (Genomics of Brazilian Biodiversity)",
    type: "Site",
    activities: "Affiliate",
    address: "R. Boaventura da Silva, 955 - Nazaré, Belém - PA, 66055-090, Brazil",
    latitude: -1.4469139,
    longitude: -48.4821946
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Colllosal",
    type: "Site",
    activities: "Funding, Collecting",
    address: "1401 Lavaca St, Unit, Austin, TX 78701",
    latitude: 30.2767442,
    longitude: -97.742027
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Revive & Restore",
    type: "Site",
    activities: "Funding, Collecting",
    address: "1505 Bridgeway, Sausalito, CA 94965",
    latitude: 37.860398,
    longitude: -122.4881632
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Allen Brain Institute",
    type: "Site",
    activities: "Funding, Collecting",
    address: "615 Westlake Avenue North, Seattle, WA 98109",
    latitude: 47.6253671,
    longitude: -122.3389163
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Leibniz Institute for Zoo and Wildlife Research",
    type: "Site",
    activities: "Processing, Collecting",
    address: "Alfred-Kowalke-Straße 17, 10315 Berlin, Germany",
    latitude: 52.5059665,
    longitude: 13.5214447
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Human Pangenome Reference Consortium",
    type: "Site",
    activities: "Affiliate",
    address: "1230 York Avenue, New York, NY, 10065",
    latitude: 40.7631824,
    longitude: -73.9563226
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "European Reference Genome Atlas (ERGA)",
    type: "Site",
    activities: "Affiliate",
    address: "Quartier Centre, 1015 Lausanne, Switzerland",
    latitude: 46.5195985,
    longitude: 6.5684919
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Bird10K (Bird 10,0000) Genome Project",
    type: "Site",
    activities: "Affiliate",
    address: "548 Binwen Rd, Binjiang District, Hangzhou, Zhejiang, China, 310053",
    latitude: 30.17284,
    longitude: 120.15039
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Rockefeller University PIs",
    type: "Site",
    activities: "Collecting, Biobanking",
    address: "1230 York Avenue, New York, NY, 10065",
    latitude: 40.7631824,
    longitude: -73.9563226
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "University of Denmark",
    type: "Site",
    activities: "Collecting, Biobanking",
    address: "Anker Engelunds Vej 1, Bygning 101A, 2800 Kongens Lyngby, Denmark",
    latitude: 55.7860512,
    longitude: 12.5233698
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Chicago Field Museum",
    type: "Site",
    activities: "Collecting, Biobanking",
    address: "1400 S Lake Shore Dr, Chicago, IL 60605",
    latitude: 41.8662166,
    longitude: -87.6169853
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Morgridge Institute for Research",
    type: "Site",
    activities: "Collecting, DNA Sequencing (long reads), Bioinformatics (assembly)",
    address: "330 N Orchard St, Madison, WI 53715",
    latitude: 43.0729696,
    longitude: -89.40807129999999
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Copenhagen Zoo",
    type: "Site",
    activities: "Collecting, Biobanking",
    address: "Roskildevej 32, 2000 Frederiksberg, Denmark",
    latitude: 55.670527,
    longitude: 12.5209965
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Bronx Zoo",
    type: "Site",
    activities: "Collecting, Biobanking",
    address: "2300 Southern Blvd, Bronx, NY 10460",
    latitude: 40.8510986,
    longitude: -73.8815388
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Stanford University hypothalamus project",
    type: "Site",
    activities: "Collecting",
    address: "450 Jane Stanford Way, Stanford, CA 94305",
    latitude: 37.4281053,
    longitude: -122.1690721
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "San Diego Frozen Zoo",
    type: "Site",
    activities: "Collecting, Biobanking",
    address: "15500 San Pasqual Valley Road, Escondido, California 92027",
    latitude: 33.0999807,
    longitude: -117.0012436
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Limp evolution project",
    type: "Site",
    activities: "Collecting",
    address: "9500 Gilman Dr, La Jolla, CA 92093",
    latitude: 32.879964,
    longitude: -117.2361296
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "University of Minnesota",
    type: "Site",
    activities: "Collecting",
    address: "200 SE Oak St., Minneapolis, MN 55414",
    latitude: 44.9753081,
    longitude: -93.22804099999999
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "California Conservation Genome Project (CCGP)",
    type: "Site",
    activities: "Affiliate",
    address: "405 Hilgard Avenue, Los Angeles, California 90095",
    latitude: 34.0725989,
    longitude: -118.4392858
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "AfricaBP",
    type: "Site",
    activities: "Affiliate",
    address: "Wellcome Genome Campus, Hinxton, Cambridgeshire, CB10 1SD, UK",
    latitude: 52.0802014,
    longitude: 0.1871654
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Cetacean Genomes Project",
    type: "Site",
    activities: "Affiliate",
    address: "1315 East-West Highway Silver Spring, MD 20910",
    latitude: 38.9923318,
    longitude: -77.030684
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "University of Denver, Colorado",
    type: "Site",
    activities: "Collecting",
    address: "2199 S University Blvd, Denver, CO 80210",
    latitude: 39.6765877,
    longitude: -104.9614396
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Bat1K",
    type: "Site",
    activities: "Affiliate",
    address: "Wellcome Trust Genome Campus, Hinxton, Saffron Walden CB10 1RQ, UK",
    latitude: 52.0810484,
    longitude: 0.1838827
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Senckenberg Translational Biodiversity Genomics (SGN - TBG)",
    type: "Site",
    activities: "Affiliate",
    address: "Senckenberganlage 25 D-60325 Frankfurt/Main",
    latitude: 50.1169934,
    longitude: 8.6515384
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Primate T2T project",
    type: "Site",
    activities: "Affiliate",
    address: "1410 NE Campus Pkwy, Seattle, WA 98195",
    latitude: 47.6565701,
    longitude: -122.3126853
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Ruminant T2T project",
    type: "Site",
    activities: "Affiliate",
    address: "111 W Fairfield St, Clay Center, NE 68933",
    latitude: 40.5212359,
    longitude: -98.0551102
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Katara Biodiversity Genomes Program",
    type: "Site",
    activities: "Affiliate",
    address: "Doha, Qatar",
    latitude: 25.2854473,
    longitude: 51.53103979999999
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Smithsonian",
    type: "Site",
    activities: "Collecting, Biobanking",
    address: "10th St. & Constitution Ave. NW, Washington, DC 20560",
    latitude: null,
    longitude: null
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Paratus Biosciences Bat Genomes",
    type: "Site",
    activities: "Affiliate",
    address: "430 East 29th Street, Suite 600, New York, NY 10016, USA",
    latitude: 40.7398629,
    longitude: -73.974383
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Marine Ecological Genomics Lab",
    type: "Site",
    activities: "DNA Sequencing (long reads), Collecting",
    address: "Haiqin Building NO.3, Zhuhai Campus, SYSU, Tangjiawan, Xiangzhou District, Zhuhai City",
    latitude: 22.380425,
    longitude: 113.540091
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "University of Otago, New Zealand",
    type: "Site",
    activities: "Collecting",
    address: "362 Leith Street, Dunedin North, Dunedin 9016, New Zealand",
    latitude: -45.8647299,
    longitude: 170.5150022
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Europan Mink Genome Conservation Project",
    type: "Site",
    activities: "Collecting",
    address: "Papieża Jana Pawła II 22a, 70-453 Szczecin, Poland",
    latitude: 53.4364942,
    longitude: 14.5447438
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Canine Genomes Project",
    type: "Site",
    activities: "Processing",
    address: "753 10 Uppsala, Sweden",
    latitude: 59.8565906,
    longitude: 17.6306386
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Yggdrasil Denmark Biodiversity Genomes",
    type: "Site",
    activities: "Affiliate",
    address: "Øster Voldgade 7, 1350 København, Denmark",
    latitude: 55.6874319,
    longitude: 12.5775307
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Ludwig-Maximilians-University (LMU) Biozentrum in Munich, Germany",
    type: "Site",
    activities: "Collecting",
    address: "Großhaderner Str. 2, 82152 Planegg, Germany",
    latitude: 48.1089709,
    longitude: 11.4575842
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Threatened Species Initiative",
    type: "Site",
    activities: "Affiliate",
    address: "The University of Sydney, NSW 2006, Australia",
    latitude: -33.8877902,
    longitude: 151.1888159
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "University of Connecticut",
    type: "Site",
    activities: "Affiliate",
    address: "352 Mansfield Rd, Storrs, CT 06269",
    latitude: 41.8088667,
    longitude: -72.2499066
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Universidad Austral de Chile",
    type: "Site",
    activities: "Collecting",
    address: "Independencia 631, Valdivia, Los Ríos, Chile",
    latitude: -39.815367,
    longitude: -73.2474393
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Sparrow genomes",
    type: "Site",
    activities: "Collecting",
    address: "105 Main St, Durham, NH 03824",
    latitude: 43.1359256,
    longitude: -70.932447
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "MIgratory bird genomes",
    type: "Site",
    activities: "Collecting",
    address: " An d. Vogelwarte 21, 26386 Wilhelmshaven, Germany",
    latitude: 53.5639882,
    longitude: 8.1095156
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "University of Milwakee",
    type: "Site",
    activities: "Collecting",
    address: "2200 E Kenwood Blvd, Milwaukee, WI 53211",
    latitude: 43.0751922,
    longitude: -87.8813912
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Swiss Ornithological Institute",
    type: "Site",
    activities: "Collecting",
    address: "Seerose 1 CH-6204 Sempach Switzerland",
    latitude: 47.1262046,
    longitude: 8.1935851
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Brood Parasitic Genomes",
    type: "Site",
    activities: "Collecting",
    address: "725 Commonwealth Ave, Boston, MA",
    latitude: 42.3502054,
    longitude: -71.1056953
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Songbird GRC chromosomes",
    type: "Site",
    activities: "Affiliate",
    address: "753 10 Uppsala, Sweden",
    latitude: 59.8565906,
    longitude: 17.6306386
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Manakin Genomes Research Coordinator Network",
    type: "Site",
    activities: "Collecting",
    address: "2415 Eisenhower Avenue, Alexandria, VA 22314",
    latitude: 38.8016276,
    longitude: -77.0704465
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "University of Auckland, New Zealand",
    type: "Site",
    activities: "Collecting, Bioinformatics (genome analysis)",
    address: "34 Princes Street, Auckland Central, Auckland 1010, New Zealand",
    latitude: -36.8519533,
    longitude: 174.7689525
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Bogato University",
    type: "Site",
    activities: "Collecting",
    address: "Carrera 30 con Calle 45 Edificio Uriel Gutierrez, Bogota 111321 Colombia",
    latitude: 4.639706500000001,
    longitude: -74.0900826
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Brown University",
    type: "Site",
    activities: "Collecting",
    address: "69 Brown Street, Providence, RI 02912",
    latitude: 41.827494,
    longitude: -71.40278959999999
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "University of Cyprus",
    type: "Site",
    activities: "Collecting",
    address: "1 Panepistimiou Avenue, 2109 Aglantzia, Nicosia",
    latitude: 35.144038,
    longitude: 33.410773
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Universitat Pompeu Fabra, Barcelona",
    type: "Site",
    activities: "Collecting",
    address: "Carrer de la Mercè, 12, Ciutat Vella, 08002 Barcelona, Spain",
    latitude: 41.3791652,
    longitude: 2.1796313
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "University of Milano",
    type: "Site",
    activities: "Collecting",
    address: "Via Festa del Perdono, 7, 20122 Milano MI, Italy",
    latitude: 45.4597037,
    longitude: 9.1942297
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Griffith University, Sydney",
    type: "Site",
    activities: "Collecting",
    address: "Parkland Dr., Southport Qld 4222",
    latitude: -27.961848,
    longitude: 153.3827622
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Chicken Reference Genomes",
    type: "Site",
    activities: "Collecting",
    address: "Bond Life Sciences Center, 1201 Rollins St Suite 105, Columbia, MO 65201",
    latitude: 38.94298800000001,
    longitude: -92.3232065
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "University of Akureyri",
    type: "Site",
    activities: "Collecting",
    address: "Solborg v/Norðurslóð, 600 Akureyri, Iceland",
    latitude: 65.6691338,
    longitude: -18.1023867
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Max Planck Institute of Animal Behavior",
    type: "Site",
    activities: "Collecting",
    address: "Am Obstberg 1, 78315 Radolfzell am Bodensee Germany",
    latitude: 47.76800189999999,
    longitude: 8.996431399999999
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Zhejiang University",
    type: "Site",
    activities: "Affiliate",
    address: "No. 866 Yuhangtang Road, Hangzhou City, Zhejiang Province, PR China, 310058",
    latitude: 30.296644,
    longitude: 120.084699
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Sea Turtle Genomes Project",
    type: "Site",
    activities: "Affiliate",
    address: "300 Massachusetts Ave, Amherst, MA 01003",
    latitude: 42.3851536,
    longitude: -72.5253031
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "University of Toronto",
    type: "Site",
    activities: "Collecting",
    address: "27 King's College Cir, Toronto, ON M5S 1A1, Canada",
    latitude: 43.6608325,
    longitude: -79.3958215
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Iowa State University",
    type: "Site",
    activities: "Collecting",
    address: "2433 Union Drive, Ames, IA 50011-2042",
    latitude: 42.0250894,
    longitude: -93.6491442
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "University of Copenhagen",
    type: "Site",
    activities: "Collecting",
    address: "Nørregade 10, 1172 København, Denmark",
    latitude: 55.6801421,
    longitude: 12.5714877
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Rutgers University",
    type: "Site",
    activities: "Collecting",
    address: "57 US Highway 1. New Brunswick, NJ 08901-8554",
    latitude: 40.47905189999999,
    longitude: -74.4248429
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "University of Florence",
    type: "Site",
    activities: "Collecting",
    address: "P.za di San Marco, 4, 50121 Firenze FI, Italy",
    latitude: 43.7783707,
    longitude: 11.2598628
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "University of Crete",
    type: "Site",
    activities: "Collecting",
    address: "Πανεπιστηµιούπολη Βουτών, Iraklio 700 13, Greece",
    latitude: 35.3059313,
    longitude: 25.082226
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Tuscia University",
    type: "Site",
    activities: "Collecting",
    address: "Via Santa Maria in Gradi, 4, 01100 Viterbo VT, Italy",
    latitude: 42.4130371,
    longitude: 12.1121463
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Milwaukee Public Museum Zoology",
    type: "Site",
    activities: "Collecting",
    address: "800 West Wells Street, Milwaukee, WI 53233",
    latitude: 43.0406616,
    longitude: -87.92114629999999
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Nguyen Tat Thanh University, Vietnam",
    type: "Site",
    activities: "",
    address: "300A Nguyễn Tất Thành, Phường 13, Quận 4, Hồ Chí Minh 70000, Vietnam",
    latitude: 10.7610329,
    longitude: 106.7105413
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Biodiversidad, Irapuato, Mexico",
    type: "Site",
    activities: "",
    address: "Libramiento Norte Carretera Irapuato León Kilómetro 9.6, Carr Panamericana Irapuato León, 36821 Irapuato, Gto., Mexico",
    latitude: 20.6642426,
    longitude: -101.2991722
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "University of North Carolina, Chapel Hill",
    type: "Site",
    activities: "",
    address: "145 E. Cameron Street, Hill Hall, Chapel Hill, NC 27514",
    latitude: 35.912607,
    longitude: -79.0531992
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Vassar College",
    type: "Site",
    activities: "",
    address: "124 Raymond Ave, Poughkeepsie, NY 12604",
    latitude: 41.6878091,
    longitude: -73.89680469999999
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "University of Toulouse",
    type: "Site",
    activities: "",
    address: "2 rue du Doyen-Gabriel-Marty 31042 Toulouse Cedex 9",
    latitude: 43.6070026,
    longitude: 1.4381553
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "University of Queensland",
    type: "Site",
    activities: "",
    address: "St Lucia QLD 4072, Australia",
    latitude: -27.4986134,
    longitude: 153.0117455
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "University of Melbourne",
    type: "Site",
    activities: "",
    address: "Parkville VIC 3010, Australia",
    latitude: -37.7975702,
    longitude: 144.9618719
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "University of the Pacific",
    type: "Site",
    activities: "",
    address: "3601 Pacific Avenue, Stockton, CA 95211",
    latitude: 37.9761397,
    longitude: -121.3158049
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "University of Kentucky",
    type: "Site",
    activities: "Collecting, Affiliate",
    address: "Lexington, KY 40506",
    latitude: 38.034157,
    longitude: -84.5050567
  },
  {
    projectName: "Vertebrate Genomes Project (VGP)",
    institution: "Leibniz Institute for Zoo and Wildlife Research",
    type: "Site",
    activities: "",
    address: "Alfred-Kowalke-Straße 17, 10315 Berlin, Germany",
    latitude: 52.5059665,
    longitude: 13.5214447
  },
  {
    projectName: "Ungulates Genome Project",
    institution: "University of Copenhagen",
    type: "Site",
    activities: "Affiliate",
    address: "Nørregade 10, 1172 København, Denmark",
    latitude: 55.6801421,
    longitude: 12.5714877
  },
  {
    projectName: "Ungulates Genome Project",
    institution: "Northwest A&F University",
    type: "Site",
    activities: "Affiliate",
    address: "3 Taicheng Rd, Yangling District, Xianyang, Shaanxi, China, 712100",
    latitude: 34.26166,
    longitude: 108.07534
  },
  {
    projectName: "Ungulates Genome Project",
    institution: "Guangzhou Zoo",
    type: "Site",
    activities: "Affiliate",
    address: "120 Xianlie Middle Rd, Yuexiu District, Guangzhou, Guangdong, China, 510070",
    latitude: 23.14379,
    longitude: 113.30335
  },
  {
    projectName: "Ungulates Genome Project",
    institution: "Kunming Institute of Zoology, the Chinese Academy of Sciences",
    type: "Site",
    activities: "Affiliate",
    address: "No.17 Longxin Road, Kunming, Yunnan, 650201, P.R.China",
    latitude: 24.90353,
    longitude: 102.79028
  },
  {
    projectName: "Threatened Species Initiative (TSI)",
    institution: "WA Department of Biodiversity, Conservation & Attractions",
    type: "Site",
    activities: "Affiliate",
    address: "7 Dick Perry Avenue KENSINGTON WA, Australia",
    latitude: -31.9947377,
    longitude: 115.8835698
  },
  {
    projectName: "Threatened Species Initiative (TSI)",
    institution: "Royal Botanical Gardens Sydney",
    type: "Site",
    activities: "Affiliate",
    address: "Mrs Macquaries Rd, Sydney NSW 2000",
    latitude: -33.8638561,
    longitude: 151.2205787
  },
  {
    projectName: "Threatened Species Initiative (TSI)",
    institution: "Zoo and Aquarium Association",
    type: "Site",
    activities: "Affiliate",
    address: "Bradley's Head Road, Mosman, NSW 2088",
    latitude: -33.8530534,
    longitude: 151.2463069
  },
  {
    projectName: "Threatened Species Initiative (TSI)",
    institution: "Australian Government Department of Climate Change, Energy, the Environment & Water",
    type: "Site",
    activities: "Affiliate",
    address: "John Gorton Building King Edward Terrace Parkes ACT 2600",
    latitude: -35.3020121,
    longitude: 149.1342236
  },
  {
    projectName: "Threatened Species Initiative (TSI)",
    institution: "Bioplatforms Australia",
    type: "Site",
    activities: "Affiliate",
    address: "4WW, 12 Research Park Dr, Macquarie Park NSW 2113, Australia",
    latitude: -33.7740753,
    longitude: 151.1169514
  },
  {
    projectName: "Soil Invertebrate Genome Initiative (METAINVERT)",
    institution: "Senckenberg Museum für Naturkunde Görlitz",
    type: "Site",
    activities: "Affiliate",
    address: "Am Museum 1 02826 Görlitz Germany",
    latitude: 51.1534602,
    longitude: 14.9865865
  },
  {
    projectName: "Soil Invertebrate Genome Initiative (METAINVERT)",
    institution: "Muséum national d'Histoire naturelle",
    type: "Site",
    activities: "Affiliate",
    address: "57 rue Cuvier, 75005 Paris, France",
    latitude: 48.8438705,
    longitude: 2.3567311
  },
  {
    projectName: "Soil Invertebrate Genome Initiative (METAINVERT)",
    institution: "Leibniz Institute for the Analysis of Biodiversity Change (LIB)",
    type: "Site",
    activities: "Affiliate",
    address: "Adenauerallee 127, 53113 Bonn, Germany",
    latitude: 50.7233807,
    longitude: 7.113946599999999
  },
  {
    projectName: "Soil Invertebrate Genome Initiative (METAINVERT)",
    institution: "Naturhistorisches Museum Wien",
    type: "Site",
    activities: "Affiliate",
    address: "Burgring 7, 1010 Wien, Austria",
    latitude: 48.205213,
    longitude: 16.3598442
  },
  {
    projectName: "Soil Invertebrate Genome Initiative (METAINVERT)",
    institution: "Wellcome Genome Campus",
    type: "Site",
    activities: "Affiliate",
    address: "Hinxton, Cambridgeshire,, CB10 1SA. UK",
    latitude: 52.07976379999999,
    longitude: 0.1853909
  },
  {
    projectName: "Soil Invertebrate Genome Initiative (METAINVERT)",
    institution: "Universität zu Köln",
    type: "Site",
    activities: "Affiliate",
    address: "Zülpicher Straße 47b, 50674 Köln, Germany",
    latitude: 50.92670510000001,
    longitude: 6.9357053
  },
  {
    projectName: "Soil Invertebrate Genome Initiative (METAINVERT)",
    institution: "Strasbourg University",
    type: "Site",
    activities: "Affiliate",
    address: "1 Rue Eugène Boeckel, 67000 Strasbourg, France",
    latitude: 48.575845,
    longitude: 7.739033999999999
  },
  {
    projectName: "Soil Invertebrate Genome Initiative (METAINVERT)",
    institution: "University of Goettingen",
    type: "Site",
    activities: "Affiliate",
    address: "Untere Karspüle 2, 37073 Goettingen, Germany",
    latitude: 51.5373968,
    longitude: 9.936200999999999
  },
  {
    projectName: "Soil Invertebrate Genome Initiative (METAINVERT)",
    institution: "Goethe Universität Frankfurt",
    type: "Site",
    activities: "Affiliate",
    address: "Max-von-Laue-Straße 13, D-60438 Frankfurt am Main, Germany",
    latitude: 50.1705623,
    longitude: 8.6284794
  },
  {
    projectName: "Project Psyche",
    institution: "Biology Centre of the Czech Academy of Sciences, Czechia",
    type: "Site",
    activities: "Sampling hub",
    address: "Branišovská 1160/31, 370 05 České Budějovice 2, Czechia",
    latitude: 48.97816419999999,
    longitude: 14.4458432
  },
  {
    projectName: "Project Psyche",
    institution: "University of Neuchâtel, Switzerland",
    type: "Site",
    activities: "Sampling hub",
    address: "Av. du Premier-Mars 26, 2000 Neuchâtel, Switzerland",
    latitude: 46.9939188,
    longitude: 6.938681099999999
  },
  {
    projectName: "Project Psyche",
    institution: "Institute of Evolutionary Biology, Spain",
    type: "Site",
    activities: "Sampling hub",
    address: "Dr. Aiguader, 88, 08003 Barcelona, Spain",
    latitude: 41.38476350000001,
    longitude: 2.1927796
  },
  {
    projectName: "Project Psyche",
    institution: "Lund University, Sweden",
    type: "Site",
    activities: "Sampling hub",
    address: "Box 117, SE-221 00, Lund, Sweden",
    latitude: 55.7046601,
    longitude: 13.1910073
  },
  {
    projectName: "Project Psyche",
    institution: "University of Florence, Italy",
    type: "Site",
    activities: "Sampling hub",
    address: "P.za di San Marco, 4, 50121 Firenze FI, Italy",
    latitude: 43.7783707,
    longitude: 11.2598628
  },
  {
    projectName: "Project Psyche",
    institution: "University of Oulu, Finland",
    type: "Site",
    activities: "Sampling hub",
    address: "Pentti Kaiteran katu 1, 90570 Oulu, Finland",
    latitude: 65.058736,
    longitude: 25.4640382
  },
  {
    projectName: "Project Psyche",
    institution: "The Grigore Antipa National Museum of Natural History, Romania",
    type: "Site",
    activities: "Sampling hub",
    address: "Şoseaua Pavel D. Kiseleff 1, București 011341, Romania",
    latitude: 44.460199,
    longitude: 26.0816158
  },
  {
    projectName: "Genome Sequencing and Assembly of Chondrichthyans (SQUALOMIX)",
    institution: "Atomosphere and Ocean Research Institute, University of Tokyo, Japan",
    type: "Site",
    activities: "Affiliate",
    address: "5-1-5, Kashiwanoha, Kashiwa-shi, Chiba, 277-8564, Japan",
    latitude: 35.8998667,
    longitude: 139.9331125
  },
  {
    projectName: "Genome Sequencing and Assembly of Chondrichthyans (SQUALOMIX)",
    institution: "Okinawa Churamu Aquarium",
    type: "Site",
    activities: "Affiliate",
    address: "888 Aza Ishikawa, Motobu-cho, Kunigami-gun, Okinawa, 905-0206, Japan",
    latitude: 26.6911544,
    longitude: 127.881734
  },
  {
    projectName: "Genome Sequencing and Assembly of Chondrichthyans (SQUALOMIX)",
    institution: "Osaka Aquarium Kaiyukan",
    type: "Site",
    activities: "Affiliate",
    address: "1-1-10 Kaigandori, Minato-ku, Osaka, 552-0022, Japan",
    latitude: 34.6563732,
    longitude: 135.4302962
  },
  {
    projectName: "Genome Sequencing and Assembly of Chondrichthyans (SQUALOMIX)",
    institution: "National Institute of Genetics, Japan",
    type: "Site",
    activities: "Processing",
    address: "1111 Yata, Mishima, Shizuoka 411-0801, Japan",
    latitude: 35.1164636,
    longitude: 138.935417
  },
  {
    projectName: "Polar Genomes Project (PGP)",
    institution: "Korea Polar Research Institute",
    type: "Site",
    activities: "Affiliate",
    address: "26 Songdomirae-ro, Yeonsu-gu, Incheon, 21990, South Korea",
    latitude: 37.365619,
    longitude: 126.64735
  },
  {
    projectName: "Polar Genomes Project (PGP)",
    institution: "Korea Polar Research Institute",
    type: "Site",
    activities: "Processing",
    address: "26 Songdomirae-ro, Yeonsu-gu, Incheon, 21990, South Korea",
    latitude: 37.365619,
    longitude: 126.64735
  },
  {
    projectName: "Polar Genomes Project (PGP)",
    institution: "Korea Polar Research Institute",
    type: "Site",
    activities: "DNA Sequencing (long reads)",
    address: "605, Baekgoong Plaza1, 13 Seongnam-daero 331beon-gil, Bundang-gu Seongnam-si, Gyeonggi-do, Korea",
    latitude: 37.3654233,
    longitude: 127.1062979
  },
  {
    projectName: "Polar Genomes Project (PGP)",
    institution: "Korea Polar Research Institute",
    type: "Site",
    activities: "DNA Sequencing (short reads)",
    address: "605, Baekgoong Plaza1, 13 Seongnam-daero 331beon-gil, Bundang-gu Seongnam-si, Gyeonggi-do, Korea",
    latitude: 37.3654233,
    longitude: 127.1062979
  },
  {
    projectName: "Polar Genomes Project (PGP)",
    institution: "Korea Polar Research Institute",
    type: "Site",
    activities: "RNA Sequencing",
    address: "605, Baekgoong Plaza1, 13 Seongnam-daero 331beon-gil, Bundang-gu Seongnam-si, Gyeonggi-do, Korea",
    latitude: 37.3654233,
    longitude: 127.1062979
  },
  {
    projectName: "Polar Genomes Project (PGP)",
    institution: "Korea Polar Research Institute",
    type: "Site",
    activities: "Bioinformatics (assembly)",
    address: "605, Baekgoong Plaza1, 13 Seongnam-daero 331beon-gil, Bundang-gu Seongnam-si, Gyeonggi-do, Korea",
    latitude: 37.3654233,
    longitude: 127.1062979
  },
  {
    projectName: "Polar Genomes Project (PGP)",
    institution: "Korea Polar Research Institute",
    type: "Site",
    activities: "Bioinformatics (annotation)",
    address: "605, Baekgoong Plaza1, 13 Seongnam-daero 331beon-gil, Bundang-gu Seongnam-si, Gyeonggi-do, Korea",
    latitude: 37.3654233,
    longitude: 127.1062979
  },
  {
    projectName: "Polar Genomes Project (PGP)",
    institution: "Korea Polar Research Institute",
    type: "Site",
    activities: "Bioinformatics (genome analysis)",
    address: "26 Songdomirae-ro, Yeonsu-gu, Incheon, 21990, South Korea",
    latitude: 37.365619,
    longitude: 126.64735
  },
  {
    projectName: "Polar Genomes Project (PGP)",
    institution: "Korea Polar Research Institute",
    type: "Site",
    activities: "Bioinformatics (databases and informatics support)",
    address: "26 Songdomirae-ro, Yeonsu-gu, Incheon, 21990, South Korea",
    latitude: 37.365619,
    longitude: 126.64735
  },
  {
    projectName: "Polar Genomes Project (PGP)",
    institution: "Korea Polar Research Institute",
    type: "Site",
    activities: "Biobanking",
    address: "26 Songdomirae-ro, Yeonsu-gu, Incheon, 21990, South Korea",
    latitude: 37.365619,
    longitude: 126.64735
  },
  {
    projectName: "PHYLOALPS",
    institution: "Station Alpine Joseph Fourier (UMS 832)",
    type: "Site",
    activities: "Affiliate",
    address: "2233 Rue de la Piscine, Université Grenoble Alpes, CS 40700 38058 Grenoble cedex 9, France",
    latitude: 45.1934299,
    longitude: 5.776894
  },
  {
    projectName: "PHYLOALPS",
    institution: "Wald, Schnee und Landschaft (WSL)",
    type: "Site",
    activities: "Affiliate",
    address: "Zürcherstrasse 111, 8903 Birmensdorf, Switzerland",
    latitude: 47.360462,
    longitude: 8.4553637
  },
  {
    projectName: "PHYLOALPS",
    institution: "Genoscope - Centre National de Séquençage",
    type: "Site",
    activities: "Affiliate",
    address: "2, rue Gaston Crémieux, CEA Paris-Saclay, GENOSCOPE, 91000 ÉVRY, France",
    latitude: 48.6236152,
    longitude: 2.4393278
  },
  {
    projectName: "Lilioid Monocots Core Group Genome Project (LMGP)",
    institution: "USDA-ARS, Department of Horticulture, University of Wisconsin",
    type: "Site",
    activities: "Headquarters",
    address: "1575 Linden Drive, Madison, WI 53706, USA",
    latitude: 43.07483819999999,
    longitude: -89.4121206
  },
  {
    projectName: "Lilioid Monocots Core Group Genome Project (LMGP)",
    institution: "Biochemistry Department, University of Otago",
    type: "Site",
    activities: "Headquarters",
    address: "Dunedin 9054, New Zealand",
    latitude: -45.8779099,
    longitude: 170.5021599
  },
  {
    projectName: "Lilioid Monocots Core Group Genome Project (LMGP)",
    institution: "New Cultivar Innovation,The New Zealand Institute for Plant & Food Research Limited",
    type: "Site",
    activities: "Headquarters",
    address: "Christchurch 8140, New Zealand",
    latitude: -43.5328181,
    longitude: 172.6319915
  },
  {
    projectName: "Lilioid Monocots Core Group Genome Project (LMGP)",
    institution: "Institute of Chinese Medical Science (ICMS), University of Macau",
    type: "Site",
    activities: "Affiliate",
    address: "Avenida da Universidade, Taipa, Macau, China",
    latitude: 22.12489,
    longitude: 113.55159
  },
  {
    projectName: "Ocean Genomes (OG)",
    institution: "University of Western Australia",
    type: "Site",
    activities: "Headquarters",
    address: "Minderoo OceanOmics Centre at UWA, The University of Western Australia, Bayliss Building, Room 2.40A, Crawley, Perth, WA Australia, 6003",
    latitude: -31.9789061,
    longitude: 115.8180721
  },
  {
    projectName: "Open Green Genomes (OGG)",
    institution: "Joint Genome Institute ",
    type: "Site",
    activities: "Headquarters",
    address: "DOE Joint Genome Institute, Lawrence Berkeley National Laboratory, 1 Cyclotron Road, Berkeley, CA 94720",
    latitude: 37.8791052,
    longitude: -122.2542383
  },
  {
    projectName: "Open Green Genomes (OGG)",
    institution: "HudsonAlpha Institute for Biotechnology",
    type: "Site",
    activities: "Headquarters",
    address: "HudsonAlpha Institute of Biothechnology, 601 Genome Way, Huntsville, AL, 35806",
    latitude: 34.7255274,
    longitude: -86.69075629999999
  },
  {
    projectName: "Hong Kong EBP (EBPHK)",
    institution: "Hong Kong University of Science and Technology (HKUST)",
    type: "Site",
    activities: "Affiliate, Processing, Bioinformatics (annotation), Bioinformatics (assembly), Bioinformatics (databases and informatics support), Bioinformatics (genome analysis)",
    address: "Clear Water Bay, Hong Kong",
    latitude: 22.2851406,
    longitude: 114.2940282
  },
  {
    projectName: "Hong Kong EBP (EBPHK)",
    institution: "City University of Hong Kong (CityU)",
    type: "Site",
    activities: "Processing",
    address: "83 Tat Chee Ave, Kowloon Tong, Hong Kong",
    latitude: 22.3379245,
    longitude: 114.172484
  },
  {
    projectName: "Hong Kong EBP (EBPHK)",
    institution: "Hong Kong Baptist University",
    type: "Site",
    activities: "Processing, Bioinformatics (assembly), Bioinformatics (annotation), Bioinformatics (genome analysis), Bioinformatics (databases and informatics support)",
    address: "224 Waterloo Rd, Kowloon Tong, Hong Kong",
    latitude: 22.3411787,
    longitude: 114.1799772
  },
  {
    projectName: "Hong Kong EBP (EBPHK)",
    institution: "The University of Hong Kong (HKU)",
    type: "Site",
    activities: "Processing, Bioinformatics (assembly), Bioinformatics (annotation), Bioinformatics (genome analysis), Bioinformatics (databases and informatics support)",
    address: "Pok Fu Lam, Hong Kong",
    latitude: 22.2679201,
    longitude: 114.1290719
  },
  {
    projectName: "Hong Kong EBP (EBPHK)",
    institution: "Hong Kong Polytechnic University",
    type: "Site",
    activities: "Processing",
    address: "11 Yuk Choi Rd, Hung Hom, Hong Kong",
    latitude: 22.3050239,
    longitude: 114.1792341
  },
  {
    projectName: "Euglena International Network (EIN)",
    institution: "Earlham Institute",
    type: "Site",
    activities: "Affiliate",
    address: "Norwich Research Park, Colney Ln, Norwich NR4 7UZ, UK",
    latitude: 52.622805,
    longitude: 1.2197416
  },
  {
    projectName: "Euglena International Network (EIN)",
    institution: "EBI",
    type: "Site",
    activities: "Affiliate",
    address: "Wellcome Genome, Hinxton CB10 1SD UK",
    latitude: 52.0802014,
    longitude: 0.1871654
  },
  {
    projectName: "Euglena International Network (EIN)",
    institution: "Osaka University",
    type: "Site",
    activities: "Affiliate",
    address: "3-4-1 KOWAKAE, HIGASHIOSAKA CITY,. OSAKA 577-8502, JAPAN",
    latitude: 34.6508886,
    longitude: 135.5880669
  },
  {
    projectName: "Euglena International Network (EIN)",
    institution: "Shenzhen Key Laboratory of Marine Bioresource and Eco-environmental Science,",
    type: "Site",
    activities: "Affiliate",
    address: " Shenzhen Engineering Laboratory for Marine Algal Biotechnology, Guangdong Provincial Key Laboratory for Plant Epigenetics, College of Life Sciences and Oceanography, Shenzhen University, Shenzhen, 518060, China",
    latitude: 22.53306,
    longitude: 113.932813
  },
  {
    projectName: "Euglena International Network (EIN)",
    institution: "Institute of Parasitology",
    type: "Site",
    activities: "Affiliate",
    address: "Czech Academy of Sciences, and Faculty of Sciences, University of South Bohemia, 37005, České Budějovice, Czech Republic",
    latitude: 48.9775024,
    longitude: 14.4451175
  },
  {
    projectName: "Euglena International Network (EIN)",
    institution: "Institute of Evolutionary Biology,",
    type: "Site",
    activities: "Affiliate",
    address: "Żwirki i Wigury 101, 02-089 Warsaw, Poland",
    latitude: 52.2134008,
    longitude: 20.9876069
  },
  {
    projectName: "Euglena International Network (EIN)",
    institution: "Trent University",
    type: "Site",
    activities: "Affiliate",
    address: "Trent University, Peterborough, ON, Canada",
    latitude: 44.3569412,
    longitude: -78.2870331
  },
  {
    projectName: "Euglena International Network (EIN)",
    institution: "Sherbrooke University",
    type: "Site",
    activities: "Affiliate",
    address: "Université de Sherbrooke, Sherbrooke, QC, Canada",
    latitude: 45.37794239999999,
    longitude: -71.92939419999999
  },
  {
    projectName: "Euglena International Network (EIN)",
    institution: "Department of Chemistry and Manchester Institute of Biotechnology,",
    type: "Site",
    activities: "Affiliate",
    address: "University of Manchester, Manchester M1 7DN, UK",
    latitude: 53.4656853,
    longitude: -2.232706
  },
  {
    projectName: "Euglena International Network (EIN)",
    institution: "Department of Biology",
    type: "Site",
    activities: "Affiliate",
    address: "Central Michigan University, Mt. Pleasant, MI 48859, USA",
    latitude: 43.5907792,
    longitude: -84.7788786
  },
  {
    projectName: "Euglena International Network (EIN)",
    institution: "Euglena Co., Ltd",
    type: "Site",
    activities: "Affiliate",
    address: "2F Yokohama Bio Industry Center (YBIC), 1-6 Suehiro, Tsurumi, Yokohama Kanagawa  230-0045 Japan",
    latitude: 35.4789423,
    longitude: 139.6894068
  },
  {
    projectName: "Euglena International Network (EIN)",
    institution: "Kemin Industries",
    type: "Site",
    activities: "Affiliate",
    address: "Research and Development, Plymouth, MI 48170, USA",
    latitude: 42.3714253,
    longitude: -83.4702132
  },
  {
    projectName: "Global Genome Biodiversity Network (GGBN)",
    institution: "Berlin Botanic Garden and Botanical Museum",
    type: "Site",
    activities: "Headquarters",
    address: "Königin-Luise-Straße 6-8, 14195 Berlin, Germany",
    latitude: 52.4585322,
    longitude: 13.3046593
  },
  {
    projectName: "Dresden HQ Genomes Project",
    institution: "MPI-CBG, Sequencing and Genotyping Facility ",
    type: "Site",
    activities: "Affiliate",
    address: "Pfotenhauerstr. 108, 01307 Dresden, Germany",
    latitude: 51.0573329,
    longitude: 13.7844945
  },
  {
    projectName: "EBP-Norway",
    institution: "Norwegian Sequencing Center, UiO",
    type: "Site",
    activities: "DNA Sequencing (long reads), RNA Sequencing",
    address: "PO Box 1066, Blindern, 0316 Oslo",
    latitude: 59.94131520000001,
    longitude: 10.7264213
  },
  {
    projectName: "EBP-Norway",
    institution: "Norwegian Sequencing Center, Oslo University Hospital",
    type: "Site",
    activities: "DNA Sequencing (short reads)",
    address: "Kirkeveien 166, 0407 Oslo, Norway",
    latitude: 59.9414546,
    longitude: 10.7385442
  },
  {
    projectName: "EBP-Norway",
    institution: "CIGENE, Norwegan University of Life sciences",
    type: "Site",
    activities: "DNA Sequencing (long reads), Bioinformatics (assembly and annotation)",
    address: "Husdyrfagbygget, Oluf Thesens vei 6, 1433 Ås",
    latitude: 59.66566770000001,
    longitude: 10.7597994
  },
  {
    projectName: "EBP-Norway",
    institution: "Dept of Informatics, Univ of Bergen",
    type: "Site",
    activities: "Bioinformatics (assembly and annotation), Bioinformatics (databases and informatics support)",
    address: "Department of Informatics, University of Bergen, P.O. Box 7803, N-5020 Bergen, Norway",
    latitude: 60.3878586,
    longitude: 5.3217549
  },
  {
    projectName: "EBP-Norway",
    institution: "Dept of Biology, Univ of Bergen",
    type: "Site",
    activities: "Biobanking",
    address: "Department of Biological Sciences, University of Bergen, P.O. Box 7803, N-5020 Bergen, Norway",
    latitude: 60.3878586,
    longitude: 5.3217549
  },
  {
    projectName: "EBP-Norway",
    institution: "Norwegian University of Science and technology",
    type: "Site",
    activities: "Biobanking",
    address: "Schøninghuset, B329, Kalvskinnet, Erling Skakkes gate 47A",
    latitude: 63.4279562,
    longitude: 10.3858865
  },
  {
    projectName: "EBP-Norway",
    institution: "Nord University",
    type: "Site",
    activities: "Bioinformatics (assembly and annotation)",
    address: "Faculty of Biosciences and Aquaculture, Nord University, Postboks 1490, 8049 Bodø",
    latitude: 67.2803556,
    longitude: 14.404916
  },
  {
    projectName: "EBP-Norway",
    institution: "University of Tromsø",
    type: "Site",
    activities: "Bioinformatics (databases and informatics support), Biobanking",
    address: "Institutt for kjemi, Fakultet for Naturvitenskap og Teknologi, UiT Norges arktiske universitet, Postboks 6050 Langnes, N-9037 Tromsø",
    latitude: 69.6815464,
    longitude: 18.9767114
  },
  {
    projectName: "EBP-Norway",
    institution: "SINTEF",
    type: "Site",
    activities: "Biobanking",
    address: "SINTEF, Postboks 4760 Torgarden, 7465 TRONDHEIM",
    latitude: 63.4305149,
    longitude: 10.3950528
  },
  {
    projectName: "Cetaceans Genomes Project (CGP)",
    institution: "Vertebrate Genomes Project, The Rockefeller University",
    type: "Site",
    activities: "Affiliate",
    address: "1230 York Avenue, Box 366, New York, NY 10065, USA",
    latitude: 40.7631824,
    longitude: -73.9563226
  },
  {
    projectName: "Cetaceans Genomes Project (CGP)",
    institution: "Darwin Tree of Life UK, Wellcome Sanger Institute",
    type: "Site",
    activities: "Affiliate",
    address: "Wellcome Genome Campus, Hinxton, Cambridgeshire CB10 1SA, UK",
    latitude: 52.0802014,
    longitude: 0.1871654
  },
  {
    projectName: "Cetaceans Genomes Project (CGP)",
    institution: "LOEWE Centre for Translational Biodiversity Genomics, Senckenberg Research Institute",
    type: "Site",
    activities: "Affiliate",
    address: "Senckenberganlage 25, D-60325 Frankfurt am Main, Germany",
    latitude: 50.1169934,
    longitude: 8.6515384
  },
  {
    projectName: "Cetaceans Genomes Project (CGP)",
    institution: "Conservation Science Wildlife Health, San Diego Zoo Wildlife Alliance",
    type: "Site",
    activities: "Affiliate",
    address: "15600 San Pasqual Valley Rd, Escondido, CA 92027",
    latitude: 33.0948167,
    longitude: -117.0012961
  },
  {
    projectName: "Cetaceans Genomes Project (CGP)",
    institution: "Regenerative Biology, Morgridge Institute for Research",
    type: "Site",
    activities: "Affiliate",
    address: "330 N Orchard Street, Madison, WI 53715, USA",
    latitude: 43.0729696,
    longitude: -89.40807129999999
  },
  {
    projectName: "Cetaceans Genomes Project (CGP)",
    institution: "Canadian BioGenome Project",
    type: "Site",
    activities: "Affiliate",
    address: "675 W 10th Ave, Vancouver, BC V5Z 0B4, Canada",
    latitude: 49.2626787,
    longitude: -123.1194676
  },
  {
    projectName: "Darwin Tree of Life (DToL)",
    institution: "Natural History Museum",
    type: "Site",
    activities: "Headquarters, Processing, Biobanking, Bioinformatics (databases and informatics support)",
    address: "Cromwell Rd, South Kensington, London SW7 5BD",
    latitude: 51.4954492,
    longitude: -0.176906
  },
  {
    projectName: "Darwin Tree of Life (DToL)",
    institution: "Oxford University, Wytham Woods",
    type: "Site",
    activities: "Processing",
    address: "Conservator of Wytham Woods, University of Oxford, Sawmill Yard, Wytham, OXFORD, OX2 8QQ",
    latitude: 51.7736068,
    longitude: -1.3223991
  },
  {
    projectName: "Darwin Tree of Life (DToL)",
    institution: "Royal Botanical Gardens Edinburgh",
    type: "Site",
    activities: "Processing, Biobanking",
    address: "Edinburgh EH3 5NZ",
    latitude: 55.9642658,
    longitude: -3.2121256
  },
  {
    projectName: "Darwin Tree of Life (DToL)",
    institution: "Marine Biological Association",
    type: "Site",
    activities: "Processing",
    address: "The Laboratory, Citadel Hill, Plymouth PL1 2PB",
    latitude: 50.3754565,
    longitude: -4.1426565
  },
  {
    projectName: "Darwin Tree of Life (DToL)",
    institution: "Royal Botanical Gardens Kew, London",
    type: "Site",
    activities: "Biobanking, Processing",
    address: "Kew Foundation Royal Botanic Gardens, Kew Richmond TW9 3AE UK",
    latitude: 51.4787438,
    longitude: -0.295573
  },
  {
    projectName: "Darwin Tree of Life (DToL)",
    institution: "University of Dublin",
    type: "Site",
    activities: "Processing",
    address: "University College Dublin, Belfield, Dublin 4, Ireland. Eircode: D04 V1W8",
    latitude: 53.3091808,
    longitude: -6.233707099999999
  },
  {
    projectName: "Darwin Tree of Life (DToL)",
    institution: "Earlham Institute, Norwich",
    type: "Site",
    activities: "Bioinformatics (databases and informatics support), Bioinformatics (genome analysis)",
    address: "Norwich Research Park, Colney Ln, Norwich NR4 7UZ",
    latitude: 52.622805,
    longitude: 1.2197416
  },
  {
    projectName: "Darwin Tree of Life (DToL)",
    institution: "EMBL- EBI Cambridge",
    type: "Site",
    activities: "Bioinformatics (annotation)",
    address: "EMBL-EBI Main Building, Wellcome Genome, Hinxton CB10 1SD",
    latitude: 52.0802014,
    longitude: 0.1871654
  },
  {
    projectName: "Darwin Tree of Life (DToL)",
    institution: "University of Edinburgh",
    type: "Site",
    activities: "Bioinformatics (assembly)",
    address: "Old College, South Bridge, Edinburgh EH8 9YL",
    latitude: 55.9474302,
    longitude: -3.1872571
  },
  {
    projectName: "Darwin Tree of Life (DToL)",
    institution: "University of Cambridge",
    type: "Site",
    activities: "Bioinformatics (assembly)",
    address: "The Old Schools, Trinity Ln, Cambridge CB2 1TN",
    latitude: 52.20523559999999,
    longitude: 0.11705
  },
  {
    projectName: "Darwin Tree of Life (DToL)",
    institution: "Oxford CCAP",
    type: "Site",
    activities: "Processing",
    address: "Department of Biology, South Parks Road, Oxford, OX1 3RB",
    latitude: 51.7585245,
    longitude: -1.253087
  },
  {
    projectName: "Darwin Tree of Life (DToL)",
    institution: "CABI Biosciences",
    type: "Site",
    activities: "Processing, Biobanking",
    address: "Bakeham Ln, Englefield Green, Egham TW20 9TY",
    latitude: 51.4187188,
    longitude: -0.5697454
  },
  {
    projectName: "1,000 Bat Genomes (Bat1K)",
    institution: "Max-Planck-Institut für molekulare Zellbiologie und Genetik",
    type: "Site",
    activities: "Headquarters",
    address: "Pfotenhauerstraße 108, 01307 Dresden",
    latitude: 51.0573329,
    longitude: 13.7844945
  },
  {
    projectName: "1,000 Bat Genomes (Bat1K)",
    institution: "Senckenberg Forschungsinstitut und Naturmuseum",
    type: "Site",
    activities: "Affiliate",
    address: "Senckenberganlage 25, 60325 Frankfurt am Main",
    latitude: 50.1169934,
    longitude: 8.6515384
  },
  {
    projectName: "1,000 Bat Genomes (Bat1K)",
    institution: "Paratus Sciences ",
    type: "Site",
    activities: "Affiliate",
    address: "430 E 29th St, New York, NY 10016, USA",
    latitude: 40.7398629,
    longitude: -73.974383
  },
  {
    projectName: "1,000 Bat Genomes (Bat1K)",
    institution: "Vertebrate Genome Lab ",
    type: "Site",
    activities: "Affiliate",
    address: "1230 York Avenue, New York, NY 10065",
    latitude: 40.7631824,
    longitude: -73.9563226
  },
  {
    projectName: "1,000 Bat Genomes (Bat1K)",
    institution: "Wellcome Sanger Institute",
    type: "Site",
    activities: "Affiliate",
    address: "Wellcome Trust Genome Campus, Hinxton, Saffron Walden CB10 1RQ, UK",
    latitude: 52.0810484,
    longitude: 0.1838827
  },
  {
    projectName: "1,000 Bat Genomes (Bat1K)",
    institution: "University College Dublin",
    type: "Site",
    activities: "Affiliate",
    address: "University College Dublin, Belfield, Dublin 4, Ireland",
    latitude: 53.3097268,
    longitude: -6.2215897
  },
  {
    projectName: "1,000 Bat Genomes (Bat1K)",
    institution: "Texas Tech University ",
    type: "Site",
    activities: "Affiliate",
    address: "2500 Broadway W, Lubbock, TX 79409",
    latitude: 33.5846516,
    longitude: -101.8724995
  },
  {
    projectName: "1,000 Bat Genomes (Bat1K)",
    institution: "Stony Brook University",
    type: "Site",
    activities: "Affiliate",
    address: "100 Nicolls Rd, Stony Brook, NY 11794",
    latitude: 40.9158619,
    longitude: -73.12134549999999
  },
  {
    projectName: "An Atlas of Eukaryotic Marine Genomes (ATLASea)",
    institution: "Museum national d'Histoire naturelle (MNHN)",
    type: "Site",
    activities: "Affiliate, Biobanking, Processing",
    address: "57 rue Cuvier, 75005 Paris, France",
    latitude: 48.8438705,
    longitude: 2.3567311
  },
  {
    projectName: "An Atlas of Eukaryotic Marine Genomes (ATLASea)",
    institution: "Genoscope, Commissariat à l'énergie atomique et aux énergies alternatives (CEA)",
    type: "Site",
    activities: "Affiliate, DNA Sequencing (long reads), DNA Sequencing (short reads), RNA Sequencing, Bioinformatics (assembly and annotation)",
    address: "2 rue Gaston Crémieux, 91000 Evry, France",
    latitude: 48.6233486,
    longitude: 2.4394112
  },
  {
    projectName: "An Atlas of Eukaryotic Marine Genomes (ATLASea)",
    institution: "Sorbonne Université",
    type: "Site",
    activities: "Affiliate",
    address: "21, rue de l'École de Médecine, 75006 Paris, France",
    latitude: 48.8509046,
    longitude: 2.3414076
  },
  {
    projectName: "An Atlas of Eukaryotic Marine Genomes (ATLASea)",
    institution: "Paris Sciences Lettres Université",
    type: "Site",
    activities: "Affiliate",
    address: "60 rue Mazarine, 75006 Paris, France",
    latitude: 48.8546525,
    longitude: 2.3378555
  },
  {
    projectName: "An Atlas of Eukaryotic Marine Genomes (ATLASea)",
    institution: "Aix-Marseille Université",
    type: "Site",
    activities: "Affiliate",
    address: "58 bd Charles Livon, 13284 Marseille, France",
    latitude: 43.2921966,
    longitude: 5.3591384
  },
  {
    projectName: "An Atlas of Eukaryotic Marine Genomes (ATLASea)",
    institution: "Ifremer",
    type: "Site",
    activities: "Affiliate, Bioinformatics (databases and informatics support)",
    address: "1625 route de Sainte-Anne, 29280 Plouzané, France",
    latitude: 48.359113,
    longitude: -4.558800499999999
  },
  {
    projectName: "Beenome100 Project (BEENOME100)",
    institution: "USDA-ARS Pollinating Insect-Biology, Management, Systematics Research",
    type: "Site",
    activities: "Headquarters",
    address: "Utah State University, Dept. Biology, UMC5310 Logan, UT 84322",
    latitude: 41.745161,
    longitude: -111.8097425
  },
  {
    projectName: "Beenome100 Project (BEENOME100)",
    institution: "USDA-ARS Tropical Pest Genetics and Molecular Biology Research Unit",
    type: "Site",
    activities: "Headquarters",
    address: "64 Nowelo Street Hilo, HI 96720",
    latitude: 19.6983299,
    longitude: -155.0927928
  },
  {
    projectName: "Beenome100 Project (BEENOME100)",
    institution: "USDA-ARS Pollinator Health in Southern Crop Ecosystems Research",
    type: "Site",
    activities: "Affiliate",
    address: "141 EXPERIMENT STATION RD Stoneville, MS 38776",
    latitude: 33.4224409,
    longitude: -90.9069456
  },
  {
    projectName: "Beenome100 Project (BEENOME100)",
    institution: "USDA-ARS Honey Bee Breeding, Genetics, and Physiology Research",
    type: "Site",
    activities: "Affiliate",
    address: "1157 Ben Hur Rd, Baton Rouge, LA 70820",
    latitude: 30.3794355,
    longitude: -91.1670974
  },
  {
    projectName: "Beenome100 Project (BEENOME100)",
    institution: "Princeton University",
    type: "Site",
    activities: "Affiliate",
    address: "106A Guyot Ln, Princeton, NJ 08544",
    latitude: 40.3458,
    longitude: -74.654476
  },
  {
    projectName: "Beenome100 Project (BEENOME100)",
    institution: "University of Alabama",
    type: "Site",
    activities: "Affiliate",
    address: "300 Hackberry Lane Tuscaloosa, AL 35487-0344",
    latitude: 33.2141906,
    longitude: -87.5412623
  },
  {
    projectName: "Beenome100 Project (BEENOME100)",
    institution: "University of California",
    type: "Site",
    activities: "Affiliate",
    address: "605 Hutchison Drive, Davis, CA 95616",
    latitude: 38.5395506,
    longitude: -121.7567687
  },
  {
    projectName: "Beenome100 Project (BEENOME100)",
    institution: "University of Illinois",
    type: "Site",
    activities: "Affiliate",
    address: "505 S. Goodwin Ave. Urbana, IL 61801",
    latitude: 40.1087558,
    longitude: -88.2245062
  },
  {
    projectName: "Beenome100 Project (BEENOME100)",
    institution: "USDA-ARS National Center for Agricultural Utilization Research",
    type: "Site",
    activities: "Headquarters",
    address: "1815 N. University Street Peoria, IL 61604",
    latitude: 40.7097335,
    longitude: -89.61447869999999
  },
  {
    projectName: "Aquatic Symbiosis Genomics Project (ASG)",
    institution: "GEOMAR Helmholtz Centre for Ocean Research Kiel",
    type: "Site",
    activities: "Affiliate",
    address: "Wischhofstraße 1-3, 24148 Kiel, Germany",
    latitude: 54.3285239,
    longitude: 10.1788471
  },
  {
    projectName: "Aquatic Symbiosis Genomics Project (ASG)",
    institution: "Nova Southeastern University",
    type: "Site",
    activities: "Affiliate",
    address: "3300 S University Dr, Fort Lauderdale, FL 33328, United States",
    latitude: 26.0816808,
    longitude: -80.24846079999999
  },
  {
    projectName: "Aquatic Symbiosis Genomics Project (ASG)",
    institution: "University of Derby",
    type: "Site",
    activities: "Affiliate",
    address: "Kedleston Rd, Derby DE22 1GB, UK",
    latitude: 52.9507205,
    longitude: -1.5073194
  },
  {
    projectName: "Aquatic Symbiosis Genomics Project (ASG)",
    institution: "Dalhousie University, Canada",
    type: "Site",
    activities: "Affiliate",
    address: "6299 South St, Halifax, NS B3H 4R2, Canada",
    latitude: 44.6361842,
    longitude: -63.59313919999999
  },
  {
    projectName: "Aquatic Symbiosis Genomics Project (ASG)",
    institution: "University of British Columbia",
    type: "Site",
    activities: "Affiliate",
    address: "Vancouver, BC V6T 1Z4, Canada",
    latitude: 49.2516532,
    longitude: -123.2514349
  },
  {
    projectName: "Aquatic Symbiosis Genomics Project (ASG)",
    institution: "University of Vienna",
    type: "Site",
    activities: "Affiliate",
    address: "Universitätsring 1, 1010 Wien, Austria",
    latitude: 48.2129785,
    longitude: 16.3601365
  },
  {
    projectName: "Aquatic Symbiosis Genomics Project (ASG)",
    institution: "Queen Mary University of London",
    type: "Site",
    activities: "Affiliate",
    address: "327 Mile End Rd, Bethnal Green, London E1 4NS, UK",
    latitude: 51.5245289,
    longitude: -0.0399857
  },
  {
    projectName: "Aquatic Symbiosis Genomics Project (ASG)",
    institution: "Sainsbury Laboratory, Cambridge University",
    type: "Site",
    activities: "Affiliate",
    address: "Bateman St, Cambridge CB2 1LR, UK",
    latitude: 52.1953022,
    longitude: 0.1267608
  },
  {
    projectName: "Aquatic Symbiosis Genomics Project (ASG)",
    institution: "University of Rhode Island",
    type: "Site",
    activities: "Affiliate",
    address: "45 Upper College Rd, Kingston, RI 02881, United States",
    latitude: 41.4837551,
    longitude: -71.5255193
  },
  {
    projectName: "Aquatic Symbiosis Genomics Project (ASG)",
    institution: "Senckenberg Research Institute",
    type: "Site",
    activities: "Affiliate",
    address: "Am Jakobskirchhof 4, 99423 Weimar, Germany",
    latitude: 50.9834332,
    longitude: 11.3274589
  },
  {
    projectName: "Aquatic Symbiosis Genomics Project (ASG)",
    institution: "Portland State University",
    type: "Site",
    activities: "Affiliate",
    address: "1825 SW Broadway, Portland, OR 97201, United States",
    latitude: 45.5118744,
    longitude: -122.6844194
  },
  {
    projectName: "Aquatic Symbiosis Genomics Project (ASG)",
    institution: "University of Oregon",
    type: "Site",
    activities: "Affiliate",
    address: "1585 E 13th Ave, Eugene, OR 97403, United States",
    latitude: 44.045953,
    longitude: -123.0705122
  },
  {
    projectName: "Aquatic Symbiosis Genomics Project (ASG)",
    institution: "University of California, Merced",
    type: "Site",
    activities: "Affiliate",
    address: "5200 Lake Rd, Merced, CA 95343, United States",
    latitude: 37.3659036,
    longitude: -120.4215763
  },
  {
    projectName: "African BioGenome Project (AfricaBP)",
    institution: "Agricultural Research Council",
    type: "Site",
    activities: "Affiliate",
    address: "Agricultural Research Council, Pretoria, South Africa",
    latitude: -25.7485438,
    longitude: 28.236981
  },
  {
    projectName: "African BioGenome Project (AfricaBP)",
    institution: "International Institute of Tropical Agriculture",
    type: "Site",
    activities: "Affiliate",
    address: "International Institute of Tropical Agriculture, Nigeria",
    latitude: 9.081999,
    longitude: 8.675277
  },
  {
    projectName: "African BioGenome Project (AfricaBP)",
    institution: "South African Medical Research Council",
    type: "Site",
    activities: "Affiliate",
    address: "South African Medical Research Council, South Africa",
    latitude: -33.9162159,
    longitude: 18.6044098
  },
  {
    projectName: "African BioGenome Project (AfricaBP)",
    institution: "African Genome Center",
    type: "Site",
    activities: "Affiliate",
    address: "African Genome Center, Morocco",
    latitude: 31.791702,
    longitude: -7.092619999999999
  },
  {
    projectName: "10,000 Plant Genomes (10KP)",
    institution: "BGI Research Wuhan",
    type: "Site",
    activities: "Headquarters",
    address: "BGI Research, Wuhan 430074, China",
    latitude: 30.5311927,
    longitude: 114.3400858
  },
  {
    projectName: "10,000 Plant Genomes (10KP)",
    institution: "China National GeneBank",
    type: "Site",
    activities: "Affiliate",
    address: "China National GeneBank, Jinsha Road, Dapeng New District, Shenzhen, Guangdong Province, China",
    latitude: 22.59489,
    longitude: 114.47938
  },
  {
    projectName: "10,000 Plant Genomes (10KP)",
    institution: "University of Alberta",
    type: "Site",
    activities: "Affiliate",
    address: "Department of Biological Sciences and Department of Medicine, University of Alberta, Edmonton, Alberta, Canada",
    latitude: 53.5290289,
    longitude: -113.5255352
  },
  {
    projectName: "10,000 Plant Genomes (10KP)",
    institution: "Fairy Lake Botanical Garden",
    type: "Site",
    activities: "Affiliate",
    address: "Key Laboratory of Southern Subtropical Plant Diversity, Fairy Lake Botanical Garden, Shenzhen & Chinese Academy of Sciences, Shenzhen, China",
    latitude: 22.5775992,
    longitude: 114.1825737
  },
  {
    projectName: "10,000 Plant Genomes (10KP)",
    institution: "World Agroforestry Centre (ICRAF)",
    type: "Site",
    activities: "Affiliate",
    address: "African Orphan Crops Consortium,World Agroforestry Centre (ICRAF), Nairobi 00100, Kenya",
    latitude: -1.236467,
    longitude: 36.819017
  },
  {
    projectName: "10,000 Plant Genomes (10KP)",
    institution: "Max Planck Institute for Plant Breeding Research",
    type: "Site",
    activities: "Affiliate",
    address: "Department of Plant Microbe Interactions, Max Planck Institute for Plant Breeding Research, Cologne 50829, Germany",
    latitude: 50.9593856,
    longitude: 6.8600948
  },
  {
    projectName: "10,000 Plant Genomes (10KP)",
    institution: "Southwest Forestry University",
    type: "Site",
    activities: "Affiliate",
    address: "Key Laboratory for Forest Genetic and Tree Improvement and Propagation in Universities of Yunnan Province, Southwest Forestry University, Kunming 650224, China,",
    latitude: 25.063993,
    longitude: 102.754576
  },
  {
    projectName: "10,000 Plant Genomes (10KP)",
    institution: "Chinese Academy of Sciences",
    type: "Site",
    activities: "Affiliate",
    address: "CAS Center for Excellence in Molecular Plant Sciences, Chinese Academy of Sciences, Shanghai 20032, China",
    latitude: 31.230416,
    longitude: 121.473701
  },
  {
    projectName: "10,000 Plant Genomes (10KP)",
    institution: "University of British Columbia",
    type: "Site",
    activities: "Affiliate",
    address: "Biodiversity Research Centre, University of British Columbia, Vancouver, BC, Canada",
    latitude: 49.263321,
    longitude: -123.2496779
  },
  {
    projectName: "10,000 Plant Genomes (10KP)",
    institution: "University of Florida",
    type: "Site",
    activities: "Affiliate",
    address: "Department of Biology, University of Florida, Gainesville, FL, USA",
    latitude: 29.6438967,
    longitude: -82.3446252
  },
  {
    projectName: "10,000 Plant Genomes (10KP)",
    institution: "South China Botanical Garden",
    type: "Site",
    activities: "Affiliate",
    address: "Key Laboratory of Plant Resource Conservation and Sustainable Utilization, The Chinese Academy of Sciences, South China Botanical Garden, Guangzhou, Guangdong 510650, China",
    latitude: 23.17766,
    longitude: 113.36063
  },
  {
    projectName: "10,000 Plant Genomes (10KP)",
    institution: "Wuhan Botanical Garden",
    type: "Site",
    activities: "Affiliate",
    address: "CAS Key Laboratory of Plant Germplasm Enhancement and Specialty Agriculture, Wuhan Botanical Garden, Chinese Academy of Sciences, Wuhan, China",
    latitude: 30.545696,
    longitude: 114.422612
  },
  {
    projectName: "10,000 Plant Genomes (10KP)",
    institution: "South China Agricultural University",
    type: "Site",
    activities: "Affiliate",
    address: "College of Science, South China Agricultural University, Guangzhou, 510642, China",
    latitude: 23.161083,
    longitude: 113.350706
  },
  {
    projectName: "10,000 Plant Genomes (10KP)",
    institution: "Forestry Bureau of Ruili",
    type: "Site",
    activities: "Affiliate",
    address: "Forestry Bureau of Ruili, Yunnan Dehong, Ruili, 678600, China",
    latitude: 24.0982499,
    longitude: 98.10001
  },
  {
    projectName: "1,000 Chilean Genomes",
    institution: "Universidad Andres Bello",
    type: "Site",
    activities: "Affiliate, Processing, DNA Sequencing (long reads), Bioinformatics (assembly), Bioinformatics (annotation), Bioinformatics (genome analysis)",
    address: "Av República 330, Santiago, Chile",
    latitude: -33.4526948,
    longitude: -70.66698699999999
  },
  {
    projectName: "1,000 Chilean Genomes",
    institution: "Universidad de O'Higgins",
    type: "Site",
    activities: "Affiliate, Processing, DNA Sequencing (long reads), Bioinformatics (assembly), Bioinformatics (annotation), Bioinformatics (genome analysis), Bioinformatics (databases and informatics support)",
    address: "Av. Libertador Gral. Bernardo O'Higgins 611, Rancagua, Chile",
    latitude: -34.1644082,
    longitude: -70.7416439
  },
  {
    projectName: "1,000 Chilean Genomes",
    institution: "Universidad de Chile",
    type: "Site",
    activities: "Affiliate, Processing, DNA Sequencing (long reads), DNA Sequencing (short reads), RNA Sequencing, Bioinformatics (assembly), Bioinformatics (annotation), Bioinformatics (genome analysis), Bioinformatics (databases and informatics support)",
    address: "Olivos 1007, Santiago, Chile",
    latitude: -33.4363169,
    longitude: -70.732998
  },
  {
    projectName: "1,000 Chilean Genomes",
    institution: "Universidad de Antofagasta",
    type: "Site",
    activities: "Affiliate, DNA Sequencing (long reads), Processing, Bioinformatics (assembly), Bioinformatics (annotation), Bioinformatics (genome analysis)",
    address: "Avda. Universidad Antofagasta 02800, Antofagasta, Chile",
    latitude: -23.7048133,
    longitude: -70.4220148
  },
  {
    projectName: "1,000 Chilean Genomes",
    institution: "Australomics",
    type: "Site",
    activities: "Affiliate, Processing, DNA Sequencing (long reads), DNA Sequencing (short reads), RNA Sequencing, Bioinformatics (assembly), Bioinformatics (annotation), Bioinformatics (genome analysis), Bioinformatics (databases and informatics support)",
    address: "Facultad de Ciencias, Universidad Austral de Chile, Valdivia, Chile",
    latitude: -39.817419,
    longitude: -73.2426102
  },
  {
    projectName: "Cartilaginous Fish Genome Project (CFGP)",
    institution: "Institute of Oceanology",
    type: "Site",
    activities: "Affiliate, Processing",
    address: "CAS and Shandong Province Key Laboratory of Experimental Marine Biology, Center for Ocean Mega-Science, Institute of Oceanology, Chinese Academy of Sciences, Qingdao, China",
    latitude: 36.0662299,
    longitude: 120.38299
  },
  {
    projectName: "Cartilaginous Fish Genome Project (CFGP)",
    institution: "Institute of Deep-sea Science and Engineering",
    type: "Site",
    activities: "Affiliate, Processing",
    address: "Institute of Deep-sea Science and Engineering, Chinese Academy of Sciences, Sanya 572000, China",
    latitude: 18.2524799,
    longitude: 109.51209
  },
  {
    projectName: "Cartilaginous Fish Genome Project (CFGP)",
    institution: "BGI-Qingdao",
    type: "Site",
    activities: "DNA Sequencing (long reads), DNA Sequencing (short reads)",
    address: "BGI-Qingdao, BGI-Shenzhen, Qingdao, China",
    latitude: 36.0662299,
    longitude: 120.38299
  },
  {
    projectName: "Cartilaginous Fish Genome Project (CFGP)",
    institution: "Biomarker Technologies Co，LTD",
    type: "Site",
    activities: "DNA Sequencing (long reads), DNA Sequencing (short reads), RNA Sequencing",
    address: "Biomarker Technologies Co，LTD，Beijing, China",
    latitude: 39.904211,
    longitude: 116.407395
  },
  {
    projectName: "Cartilaginous Fish Genome Project (CFGP)",
    institution: "Xi’an Haorui Genomics Technology Co., LTD",
    type: "Site",
    activities: "DNA Sequencing (long reads), DNA Sequencing (short reads), RNA Sequencing",
    address: "Xi’an Haorui Genomics Technology Co., LTD, Xi’an, China",
    latitude: 34.2658138,
    longitude: 108.9540936
  },
  {
    projectName: "Catalan Initiative for the Earth BioGenome Project (CBP)",
    institution: "Institut de Biologia Evolutiva",
    type: "Site",
    activities: "Processing",
    address: "Pg. Marítim de la Barceloneta, 37, Ciutat Vella, 08003 Barcelona (Spain)",
    latitude: 41.3854833,
    longitude: 2.1958498
  },
  {
    projectName: "Catalan Initiative for the Earth BioGenome Project (CBP)",
    institution: "CNAG",
    type: "Site",
    activities: "DNA Sequencing (long reads), Bioinformatics (assembly and annotation)",
    address: "Carrer de Baldiri Reixac, 4, torre i, Distrito de Les Corts, 08028 Barcelona (Spain)",
    latitude: 41.381849,
    longitude: 2.1165617
  },
  {
    projectName: "Catalan Initiative for the Earth BioGenome Project (CBP)",
    institution: "Museu de Ciències Naturals de Barcelona",
    type: "Site",
    activities: "Affiliate, Biobanking",
    address: "P° Picasso s/n, Parc Ciutadella, 08003, Barcelona, Spain",
    latitude: 41.388123,
    longitude: 2.1860152
  },
  {
    projectName: "Catalan Initiative for the Earth BioGenome Project (CBP)",
    institution: "Institut Botànic de Barcelona (CSIC)",
    type: "Site",
    activities: "Affiliate, Biobanking",
    address: "Passeig del Migdia, s/n, Sants-Montjuïc, 08038 Barcelona (Spain)",
    latitude: 41.3615322,
    longitude: 2.1603489
  },
  {
    projectName: "Catalan Initiative for the Earth BioGenome Project (CBP)",
    institution: "Andorra Recerca+Innovació",
    type: "Site",
    activities: "Affiliate",
    address: "Prat de la Creu, 68-76, AD500 Andorra la Vella (Andorra)",
    latitude: 42.5062207,
    longitude: 1.5213598
  },
  {
    projectName: "Catalan Initiative for the Earth BioGenome Project (CBP)",
    institution: "Institut d'Estudis Catalans & Institució Catalana d'Història Natural",
    type: "Site",
    activities: "Affiliate",
    address: "Carrer del Carme, 47 08001 Barcelona.",
    latitude: 41.3813121,
    longitude: 2.1692108
  },
  {
    projectName: "Catalan Initiative for the Earth BioGenome Project (CBP)",
    institution: "Centre Balear de Biodiversitat",
    type: "Site",
    activities: "Affiliate, Processing, DNA Sequencing (short reads)",
    address: "Carrer Blaise Pascal 6 – Parc Bit, 07121 Palma (Illes Balears, Spain)",
    latitude: 39.63628310000001,
    longitude: 2.6325747
  },
  {
    projectName: "Catalan Initiative for the Earth BioGenome Project (CBP)",
    institution: "Centre de Regulació Genòmica (CRG)",
    type: "Site",
    activities: "Affiliate, Bioinformatics (assembly and annotation)",
    address: "C/ Dr. Aiguader, 88 PRBB Building 08003 Barcelona, Spain",
    latitude: 41.3854203,
    longitude: 2.1944581
  },
  {
    projectName: "Catalan Initiative for the Earth BioGenome Project (CBP)",
    institution: "Observatoire Océanologique de Banyuls s/mer",
    type: "Site",
    activities: "Affiliate",
    address: "66650 Banyuls-sur-mer, France",
    latitude: 42.4599115,
    longitude: 3.1077277
  }
];