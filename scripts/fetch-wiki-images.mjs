// Sources REAL, freely-licensed lead images from Wikimedia for a curated set of
// Indian Politics cards (people / buildings / national symbols). Only accepts
// public-domain / CC / GODL-India licenses; records attribution; downscales to webp.
// Cards not listed here, or whose image isn't clearly free, are left for illustration.
// Run after `npm i sharp --no-save`:  node scripts/fetch-wiki-images.mjs
import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const category = process.argv[2] || 'indian-politics'
const outDir = join(root, `public/data/${category}/art`)
mkdirSync(outDir, { recursive: true })
mkdirSync(join(root, '.art'), { recursive: true })

// cardId -> exact Wikipedia article title (disambiguated where needed), per deck.
// Only people/places with genuinely free images get real photos; the license filter
// below rejects anything non-free, which then falls back to generated illustration.
const MAPS = {
  'indian-politics': {
  'br-ambedkar': 'B. R. Ambedkar',
  'jawaharlal-nehru': 'Jawaharlal Nehru',
  'lal-bahadur-shastri': 'Lal Bahadur Shastri',
  'indira-gandhi': 'Indira Gandhi',
  'morarji-desai': 'Morarji Desai',
  'charan-singh': 'Charan Singh',
  'rajiv-gandhi': 'Rajiv Gandhi',
  'vp-singh': 'V. P. Singh',
  'chandra-shekhar': 'Chandra Shekhar',
  'pv-narasimha-rao': 'P. V. Narasimha Rao',
  'deve-gowda': 'H. D. Deve Gowda',
  'ik-gujral': 'I. K. Gujral',
  'atal-bihari-vajpayee': 'Atal Bihari Vajpayee',
  'manmohan-singh': 'Manmohan Singh',
  'narendra-modi': 'Narendra Modi',
  'rajendra-prasad': 'Rajendra Prasad',
  's-radhakrishnan': 'Sarvepalli Radhakrishnan',
  'zakir-husain': 'Zakir Husain (politician)',
  'vv-giri': 'V. V. Giri',
  'fakhruddin-ali-ahmed': 'Fakhruddin Ali Ahmed',
  'neelam-sanjiva-reddy': 'Neelam Sanjiva Reddy',
  'giani-zail-singh': 'Zail Singh',
  'r-venkataraman': 'R. Venkataraman',
  'kr-narayanan': 'K. R. Narayanan',
  'apj-abdul-kalam': 'A. P. J. Abdul Kalam',
  'pratibha-patil': 'Pratibha Patil',
  'pranab-mukherjee': 'Pranab Mukherjee',
  'droupadi-murmu': 'Droupadi Murmu',
  'sardar-patel': 'Vallabhbhai Patel',
  'maulana-azad': 'Abul Kalam Azad',
  'gv-mavalankar': 'G. V. Mavalankar',
  'sukumar-sen': 'Sukumar Sen (civil servant)',
  'tn-seshan': 'T. N. Seshan',
  'jayaprakash-narayan': 'Jayaprakash Narayan',
  'ram-manohar-lohia': 'Ram Manohar Lohia',
  'jagjivan-ram': 'Jagjivan Ram',
  'vk-krishna-menon': 'V. K. Krishna Menon',
  'cd-deshmukh': 'Chintaman Dwarkanath Deshmukh',
  'kanshi-ram': 'Kanshi Ram',
  'bn-rau': 'Benegal Narsing Rau',
  'sucheta-kripalani': 'Sucheta Kripalani',
  'parliament-house': 'Parliament House (India)',
  'rashtrapati-bhavan': 'Rashtrapati Bhavan',
  'supreme-court': 'Supreme Court of India',
    'reserve-bank-of-india': 'Reserve Bank of India',
    // note: 'national-emblem' deliberately omitted — the State Emblem of India is
    // legally restricted (Prohibition of Improper Use Act); it stays an illustration.
  },
  'indian-cinema': {
    // Real people — deceased classic-era figures (often PD/CC) and living stars
    // (CC event photos). Films/concepts/events have no free imagery and stay art.
    'dadasaheb-phalke': 'Dadasaheb Phalke',
    'devika-rani': 'Devika Rani',
    'k-l-saigal': 'K. L. Saigal',
    'v-shantaram': 'V. Shantaram',
    'mehboob-khan': 'Mehboob Khan',
    'nargis': 'Nargis',
    'dilip-kumar': 'Dilip Kumar',
    'madhubala': 'Madhubala',
    'guru-dutt': 'Guru Dutt',
    'raj-kapoor': 'Raj Kapoor',
    'bimal-roy': 'Bimal Roy',
    'meena-kumari': 'Meena Kumari',
    'waheeda-rehman': 'Waheeda Rehman',
    'satyajit-ray': 'Satyajit Ray',
    'ritwik-ghatak': 'Ritwik Ghatak',
    'mrinal-sen': 'Mrinal Sen',
    'uttam-kumar': 'Uttam Kumar',
    'suchitra-sen': 'Suchitra Sen',
    'm-g-ramachandran': 'M. G. Ramachandran',
    'sivaji-ganesan': 'Sivaji Ganesan',
    'kamal-haasan': 'Kamal Haasan',
    'rajinikanth': 'Rajinikanth',
    'mani-ratnam': 'Mani Ratnam',
    'ilaiyaraaja': 'Ilaiyaraaja',
    'n-t-rama-rao': 'N. T. Rama Rao',
    'savitri': 'Savitri (actress)',
    'k-viswanath': 'K. Viswanath',
    'chiranjeevi': 'Chiranjeevi',
    's-s-rajamouli': 'S. S. Rajamouli',
    'adoor-gopalakrishnan': 'Adoor Gopalakrishnan',
    'mammootty': 'Mammootty',
    'mohanlal': 'Mohanlal',
    'dr-rajkumar': 'Rajkumar (actor)',
    'girish-karnad': 'Girish Karnad',
    'shyam-benegal': 'Shyam Benegal',
    'smita-patil': 'Smita Patil',
    'shabana-azmi': 'Shabana Azmi',
    'naseeruddin-shah': 'Naseeruddin Shah',
    'lata-mangeshkar': 'Lata Mangeshkar',
    'asha-bhosle': 'Asha Bhosle',
    'mohammed-rafi': 'Mohammed Rafi',
    'kishore-kumar': 'Kishore Kumar',
    's-p-balasubrahmanyam': 'S. P. Balasubrahmanyam',
    'naushad': 'Naushad',
    's-d-burman': 'S. D. Burman',
    'r-d-burman': 'R. D. Burman',
    'a-r-rahman': 'A. R. Rahman',
    'amitabh-bachchan': 'Amitabh Bachchan',
    'yash-chopra': 'Yash Chopra',
    'sridevi': 'Sridevi',
    'madhuri-dixit': 'Madhuri Dixit',
    'shah-rukh-khan': 'Shah Rukh Khan',
    'aamir-khan': 'Aamir Khan',
    'anurag-kashyap': 'Anurag Kashyap',
    // Places with free photos
    'ramoji-film-city': 'Ramoji Film City',
    'ftii-pune': 'Film and Television Institute of India',
  },
  monuments: {
    'qutub-minar': 'Qutb Minar',
    'iron-pillar-delhi': 'Iron pillar of Delhi',
    'red-fort': 'Red Fort',
    'humayuns-tomb': "Humayun's Tomb",
    'jama-masjid-delhi': 'Jama Masjid, Delhi',
    'india-gate': 'India Gate',
    'lotus-temple': 'Lotus Temple',
    'purana-qila': 'Purana Qila',
    'taj-mahal': 'Taj Mahal',
    'agra-fort': 'Agra Fort',
    'fatehpur-sikri': 'Fatehpur Sikri',
    'itimad-ud-daulah': "Tomb of I'timād-ud-Daulah",
    'bara-imambara': 'Bara Imambara',
    'dhamek-stupa': 'Dhamek Stupa',
    'lion-capital-sarnath': 'Lion Capital of Ashoka',
    'kashi-vishwanath': 'Kashi Vishwanath Temple',
    'dashashwamedh-ghat': 'Dashashwamedh Ghat',
    'jhansi-fort': 'Jhansi Fort',
    'amber-fort': 'Amer Fort',
    'hawa-mahal': 'Hawa Mahal',
    'city-palace-jaipur': 'City Palace, Jaipur',
    'jantar-mantar-jaipur': 'Jantar Mantar, Jaipur',
    'mehrangarh-fort': 'Mehrangarh',
    'jaisalmer-fort': 'Jaisalmer Fort',
    'chittorgarh-fort': 'Chittor Fort',
    'kumbhalgarh-fort': 'Kumbhalgarh',
    'city-palace-udaipur': 'City Palace, Udaipur',
    'dilwara-temples': 'Dilwara Temples',
    'ranakpur-temple': 'Ranakpur Jain temple',
    'junagarh-fort': 'Junagarh Fort',
    'khajuraho': 'Khajuraho Group of Monuments',
    'sanchi-stupa': 'Sanchi',
    'gwalior-fort': 'Gwalior Fort',
    'orchha-fort': 'Orchha',
    'jahaz-mahal': 'Jahaz Mahal',
    'bhimbetka': 'Bhimbetka rock shelters',
    'bhojeshwar-temple': 'Bhojeshwar Temple',
    'rani-ki-vav': 'Rani ki vav',
    'modhera-sun-temple': 'Sun Temple, Modhera',
    'somnath-temple': 'Somnath temple',
    'dwarkadhish-temple': 'Dwarkadhish Temple',
    'adalaj-stepwell': 'Adalaj Stepwell',
    'dholavira': 'Dholavira',
    'statue-of-unity': 'Statue of Unity',
    'sabarmati-ashram': 'Sabarmati Ashram',
    'ajanta-caves': 'Ajanta Caves',
    'ellora-caves': 'Ellora Caves',
    'elephanta-caves': 'Elephanta Caves',
    'gateway-of-india': 'Gateway of India',
    'cst-mumbai': 'Chhatrapati Shivaji Maharaj Terminus',
    'bibi-ka-maqbara': 'Bibi Ka Maqbara',
    'raigad-fort': 'Raigad Fort',
    'daulatabad-fort': 'Daulatabad Fort',
    'hampi': 'Hampi',
    'stone-chariot-hampi': 'Vitthala Temple, Hampi',
    'mysore-palace': 'Mysore Palace',
    'gol-gumbaz': 'Gol Gumbaz',
    'hoysaleswara-temple': 'Hoysaleswara Temple',
    'chennakeshava-temple': 'Chennakeshava Temple, Belur',
    'gomateshwara': 'Gommateshwara statue',
    'badami-caves': 'Badami cave temples',
    'pattadakal': 'Pattadakal',
    'brihadeeswarar-temple': 'Brihadisvara Temple, Thanjavur',
    'meenakshi-temple': 'Meenakshi Temple',
    'shore-temple': 'Shore Temple',
    'pancha-rathas': 'Pancha Rathas',
    'arjunas-penance': 'Descent of the Ganges (Mahabalipuram)',
    'airavatesvara-temple': 'Airavatesvara Temple',
    'ramanathaswamy-temple': 'Ramanathaswamy Temple',
    'rock-fort-trichy': 'Ucchi Pillayar Temple, Rockfort',
    'charminar': 'Charminar',
    'golconda-fort': 'Golconda',
    'qutb-shahi-tombs': 'Qutb Shahi tombs',
    'ramappa-temple': 'Ramappa Temple',
    'warangal-fort': 'Warangal Fort',
    'lepakshi-temple': 'Veerabhadra Temple, Lepakshi',
    'padmanabhaswamy-temple': 'Padmanabhaswamy Temple',
    'mattancherry-palace': 'Mattancherry Palace',
    'bekal-fort': 'Bekal Fort',
    'bom-jesus-basilica': 'Basilica of Bom Jesus',
    'se-cathedral-goa': 'Se Cathedral',
    'aguada-fort': 'Fort Aguada',
    'victoria-memorial': 'Victoria Memorial, Kolkata',
    'howrah-bridge': 'Howrah Bridge',
    'dakshineswar-temple': 'Dakshineswar Kali Temple',
    'konark-sun-temple': 'Konark Sun Temple',
    'jagannath-temple-puri': 'Jagannath Temple, Puri',
    'lingaraja-temple': 'Lingaraja Temple',
    'udayagiri-caves-odisha': 'Udayagiri and Khandagiri Caves',
    'hazarduari-palace': 'Hazarduari Palace',
    'mahabodhi-temple': 'Mahabodhi Temple',
    'nalanda': 'Nalanda',
    'golghar-patna': 'Golghar',
    'golden-temple': 'Golden Temple',
    'jallianwala-bagh': 'Jallianwala Bagh',
    'leh-palace': 'Leh Palace',
    'thiksey-monastery': 'Thikse Monastery',
    'key-monastery': 'Key Monastery',
    'kamakhya-temple': 'Kamakhya Temple',
    'rang-ghar': 'Rang Ghar',
  },
  science: {
    'aryabhata': 'Aryabhata',
    'brahmagupta': 'Brahmagupta',
    'bhaskara-ii': 'Bhāskara II',
    'bhaskara-i': 'Bhāskara I',
    'varahamihira': 'Varāhamihira',
    'madhava-of-sangamagrama': 'Madhava of Sangamagrama',
    'sushruta': 'Sushruta',
    'charaka': 'Charaka',
    'kanada': 'Kanada (philosopher)',
    'pingala': 'Pingala',
    'panini': 'Pāṇini',
    'jagadish-chandra-bose': 'Jagadish Chandra Bose',
    'cv-raman': 'C. V. Raman',
    'srinivasa-ramanujan': 'Srinivasa Ramanujan',
    'satyendra-nath-bose': 'Satyendra Nath Bose',
    'meghnad-saha': 'Meghnad Saha',
    'homi-bhabha': 'Homi J. Bhabha',
    'vikram-sarabhai': 'Vikram Sarabhai',
    'subrahmanyan-chandrasekhar': 'Subrahmanyan Chandrasekhar',
    'har-gobind-khorana': 'Har Gobind Khorana',
    'venkatraman-ramakrishnan': 'Venki Ramakrishnan',
    'prafulla-chandra-ray': 'Prafulla Chandra Ray',
    'shanti-swarup-bhatnagar': 'Shanti Swarup Bhatnagar',
    'birbal-sahni': 'Birbal Sahni',
    'salim-ali': 'Salim Ali',
    'janaki-ammal': 'Janaki Ammal',
    'anna-mani': 'Anna Mani',
    'kamala-sohonie': 'Kamala Sohonie',
    'gn-ramachandran': 'G. N. Ramachandran',
    'yellapragada-subbarow': 'Yellapragada Subbarow',
    'ms-swaminathan': 'M. S. Swaminathan',
    'verghese-kurien': 'Verghese Kurien',
    'raj-reddy': 'Raj Reddy',
    'ec-george-sudarshan': 'E. C. George Sudarshan',
    'harish-chandra': 'Harish-Chandra',
    'cr-rao': 'C. R. Rao',
    'pc-mahalanobis': 'Prasanta Chandra Mahalanobis',
    'satish-dhawan': 'Satish Dhawan',
    'ur-rao': 'Udupi Ramachandra Rao',
    'apj-abdul-kalam': 'A. P. J. Abdul Kalam',
    'asima-chatterjee': 'Asima Chatterjee',
    'obaid-siddiqi': 'Obaid Siddiqi',
    'tessy-thomas': 'Tessy Thomas',
    'raja-ramanna': 'Raja Ramanna',
    'jayant-narlikar': 'Jayant Narlikar',
    'narinder-singh-kapany': 'Narinder Singh Kapany',
    'kalpana-chawla': 'Kalpana Chawla',
    'rakesh-sharma': 'Rakesh Sharma',
    'vainu-bappu': 'Vainu Bappu',
    'isro': 'Indian Space Research Organisation',
    'drdo': 'Defence Research and Development Organisation',
    'iisc-bangalore': 'Indian Institute of Science',
    'tifr': 'Tata Institute of Fundamental Research',
    'barc': 'Bhabha Atomic Research Centre',
    'csir': 'Council of Scientific and Industrial Research',
    'iit': 'Indian Institutes of Technology',
    'indian-statistical-institute': 'Indian Statistical Institute',
    'physical-research-laboratory': 'Physical Research Laboratory',
    'raman-research-institute': 'Raman Research Institute',
    'aryabhata-satellite': 'Aryabhata (satellite)',
    'chandrayaan-1': 'Chandrayaan-1',
    'chandrayaan-2': 'Chandrayaan-2',
    'chandrayaan-3': 'Chandrayaan-3',
    'mangalyaan': 'Mars Orbiter Mission',
    'aditya-l1': 'Aditya-L1',
    'smiling-buddha': 'Smiling Buddha',
    'pokhran-ii': 'Pokhran-II',
    'green-revolution': 'Green Revolution in India',
    'white-revolution': 'Operation Flood',
    'slv-3': 'Satellite Launch Vehicle',
    'record-104-satellites': 'PSLV-C37',
    'gaganyaan': 'Gaganyaan',
    'apsara-reactor': 'Apsara (reactor)',
    'decimal-place-value': 'Hindu–Arabic numeral system',
    'raman-effect': 'Raman scattering',
    'chandrasekhar-limit': 'Chandrasekhar limit',
    'ramachandran-plot': 'Ramachandran plot',
    'ayurveda': 'Ayurveda',
    'pslv': 'Polar Satellite Launch Vehicle',
    'gslv': 'Geosynchronous Satellite Launch Vehicle',
    'param-8000': 'PARAM',
    'jaipur-foot': 'Jaipur Foot',
    'crescograph': 'Crescograph',
    'brahmos': 'BrahMos',
    'agni-missile': 'Agni (missile)',
    'tejas': 'HAL Tejas',
    'wootz-steel': 'Wootz steel',
    'aryabhatiya': 'Aryabhatiya',
    'bakhshali-manuscript': 'Bakhshali manuscript',
  },
}
const MAP = MAPS[category] || {}

// Override the auto-picked infobox image for cards where the infobox photo isn't
// clearly free (or is the wrong subject), but a specific known freely-licensed file
// exists. Pinning the file keeps real people/places on real photos instead of art.
const FILE_OVERRIDES = {
  'indian-politics': {
    'jawaharlal-nehru': 'File:Jawaharlal Nehru 1949.jpg',
    // Infobox photo is GFDL-1.2 (not in our accepted set); use a GODL-India PMO portrait.
    'deve-gowda': 'File:The former Prime Minister, Shri H.D. Deve Gowda calling on the Prime Minister, Shri Narendra Modi, in New Delhi on June 03, 2015 (cropped).jpg',
    // Auto-picker grabs the restricted court emblem; pin a CC BY-SA building photo instead.
    'supreme-court': 'File:Supreme Court of India front view 02.jpg',
    // 'sukumar-sen' has no free photograph; the only free file is the 2020 India Post
    // stamp, whose crop lands on the Election Commission logo (not his face), so he
    // stays an illustration.
  },
  'indian-cinema': {
    // filled in after a first pass reveals which infobox photos are non-free / wrong subject
  },
  monuments: {
    // Pinned free Commons files where the auto-picked infobox image was non-free
    // (GFDL/FAL) or missing. Each verified CC/PD via the Commons API.
    'humayuns-tomb': "File:Humayun's Tomb, buildings in Delhi 05.jpg",
    'agra-fort': 'File:20191204 Moat and walls of Agra Fort 0925 6582.jpg',
    'itimad-ud-daulah': 'File:Itimad-ud-Daulah Agra 01.jpg',
    'dilwara-temples': 'File:Dilwara temple at mount abu.jpg',
    'gateway-of-india': 'File:Gateway of India , Mumbai, India.jpg',
    'mysore-palace': 'File:Mysore Palace, Mysuru, Karnataka, India.jpg',
    'bara-imambara': 'File:View of Bara Imambara, Lucknow.jpg',
    'ellora-caves': 'File:Ellora Cave 16 Kailasa Temple.jpg',
    'stone-chariot-hampi': 'File:Stone Chariot, Hampi 4.jpg',
    'jahaz-mahal': 'File:Jahaz Mahal, Mandu at evening.jpg',
    'rock-fort-trichy': 'File:ROCKFORT TEMPLE, Trichy.jpg',
    'howrah-bridge': 'File:Howrah Bridge 02.jpg',
  },
  science: {
    // Pinned free Commons files where the infobox image was non-free or missing
    // (found + license-verified via the Commons API).
    'drdo': 'File:DRDO Bhawan2.jpg',
    'iisc-bangalore': 'File:Main Building, Indian Institute of Science, Bangalore, Karnataka, India (2017).jpg',
    'tifr': 'File:TIFR (Tata Institute for Fundamental Research) Mumbai (VMCAI 2015).jpg',
    'indian-statistical-institute': 'File:Indian Statistical Institute, Kolkata.jpg',
    'barc': 'File:BARC nuclear reactor.JPG',
    'subrahmanyan-chandrasekhar': 'File:Subrahmanyan Chandrasekhar harvard.jpg',
    'har-gobind-khorana': 'File:Har Gobind Khorana.jpg',
    'cr-rao': 'File:Calyampudi Radhakrishna Rao close-up (cropped).JPG',
    'obaid-siddiqi': 'File:The President, Dr. A.P.J. Abdul Kalam presenting Padma Vibhushan to Prof. Obaid Siddiqi, an eminent scientist, at investiture ceremony, in New Delhi on March 29, 2006.jpg',
    'jaipur-foot': 'File:Dr Koneru Satya Prasad with child amputees provided with jaipur foot.jpg',
    'wootz-steel': 'File:South Indian Wootz Steel Sword.jpg',
    'green-revolution': 'File:Agriculture in India tractor farming Punjab preparing field for a wheat crop without burning previous crop stalk.jpg',
  },
}
const FILE_OVERRIDE = FILE_OVERRIDES[category] || {}

// Accept only genuinely free licenses.
const FREE = /(public domain|^pd|cc0|cc[ -]by([ -]sa)?|creative commons attribution|godl)/i
const NONFREE = /(non[- ]free|fair use|all rights reserved|copyright)/i

const strip = (s) => (s ? s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : '')
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const UA = 'KathaCards/1.0 (educational trivia app; contact via github.com/somanath73/katha-cards)'

// Retry on 429 / 5xx with long exponential backoff (rides out IP throttles).
async function fetchRetry(url) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const r = await fetch(url, { headers: { 'User-Agent': UA } })
    if (r.ok) return r
    if (r.status === 429 || r.status >= 500) {
      await sleep(8000 * Math.pow(2, attempt)) // 8s,16s,32s,64s,128s,256s
      continue
    }
    throw new Error(`HTTP ${r.status}`)
  }
  throw new Error('HTTP 429 (exhausted retries)')
}

// Use the action API pageimages = the canonical infobox photo (usually well-licensed).
async function summaryImage(title) {
  const api = `https://en.wikipedia.org/w/api.php?action=query&format=json&redirects=1&prop=pageimages&piprop=original|thumbnail&pithumbsize=900&titles=${encodeURIComponent(title)}`
  const r = await fetchRetry(api)
  const j = await r.json()
  const page = Object.values(j.query?.pages || {})[0]
  return page?.original?.source || page?.thumbnail?.source || null
}

// Resolve a specific Commons File: title directly to its url + license.
async function commonsFileInfo(fileTitle) {
  const api = `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|extmetadata&titles=${encodeURIComponent(fileTitle)}`
  const r = await fetchRetry(api)
  const j = await r.json()
  const page = Object.values(j.query?.pages || {})[0]
  const ii = page?.imageinfo?.[0]
  if (!ii) return null
  const m = ii.extmetadata || {}
  return {
    imgUrl: ii.url,
    license: strip(m.LicenseShortName?.value) || strip(m.License?.value) || strip(m.UsageTerms?.value),
    artist: strip(m.Artist?.value) || strip(m.Credit?.value) || 'Unknown',
    licenseUrl: strip(m.LicenseUrl?.value),
    file: fileTitle.replace(/^File:/, ''),
  }
}

async function commonsLicense(imgUrl) {
  const file = 'File:' + decodeURIComponent(imgUrl.split('/').pop())
  const api = `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=extmetadata|url&titles=${encodeURIComponent(file)}`
  const r = await fetchRetry(api)
  const j = await r.json()
  const page = Object.values(j.query?.pages || {})[0]
  const m = page?.imageinfo?.[0]?.extmetadata || {}
  const license = strip(m.LicenseShortName?.value) || strip(m.License?.value) || strip(m.UsageTerms?.value)
  const artist = strip(m.Artist?.value) || strip(m.Credit?.value) || 'Unknown'
  const licenseUrl = strip(m.LicenseUrl?.value)
  return { license, artist, licenseUrl, file }
}

async function one(id, title) {
  try {
    let imgUrl, license, artist, licenseUrl, file
    if (FILE_OVERRIDE[id]) {
      const info = await commonsFileInfo(FILE_OVERRIDE[id])
      if (!info || !info.imgUrl) return { id, ok: false, reason: 'override: no info' }
      ;({ imgUrl, license, artist, licenseUrl, file } = info)
    } else {
      imgUrl = await summaryImage(title)
      if (!imgUrl) return { id, ok: false, reason: 'no image' }
      ;({ license, artist, licenseUrl, file } = await commonsLicense(imgUrl))
    }
    const free = FREE.test(license) && !NONFREE.test(license)
    if (!license) return { id, ok: false, reason: 'license unknown' }
    if (!free) return { id, ok: false, reason: `non-free: ${license}` }
    const res = await fetchRetry(imgUrl)
    const buf = Buffer.from(await res.arrayBuffer())
    const out = join(outDir, `${id}.webp`)
    await sharp(buf, { failOn: 'none' })
      .resize({ width: 600, height: 900, fit: 'cover', position: sharp.strategy.attention })
      .webp({ quality: 82 })
      .toFile(out)
    return { id, ok: true, license, artist, licenseUrl, source: `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`, file: file.replace(/^File:/, '') }
  } catch (e) {
    return { id, ok: false, reason: e.message }
  }
}

// Incremental: keep prior successes (by attribution entry), only fetch the rest.
const attrPath = join(root, `.art/${category}.attribution.json`)
const done = new Map()
if (existsSync(attrPath)) for (const e of JSON.parse(readFileSync(attrPath, 'utf8'))) done.set(e.id, e)

const todo = Object.entries(MAP).filter(([id]) => !done.has(id) || !existsSync(join(outDir, `${id}.webp`)))
console.log(`Already have ${done.size}; fetching ${todo.length} remaining...`)

const failed = []
for (const [id, title] of todo) {
  const r = await one(id, title)
  if (r.ok) done.set(id, { id: r.id, artist: r.artist, license: r.license, licenseUrl: r.licenseUrl, source: r.source, file: r.file })
  else failed.push(r)
  await sleep(5000) // slow pace to avoid Wikimedia rate limits
}

const attribution = [...done.values()]
writeFileSync(attrPath, JSON.stringify(attribution, null, 2))

console.log(`Real images sourced (total): ${attribution.length}/${Object.keys(MAP).length}`)
console.log('License mix:', JSON.stringify(attribution.reduce((a, r) => ((a[r.license] = (a[r.license] || 0) + 1), a), {}), null, 0))
console.log('Still need illustration:', JSON.stringify(failed.map((f) => `${f.id} (${f.reason})`), null, 2))
