// Seeds public/data/monuments/cards.json — the 100-card "Monuments of India"
// deck (no questions and no images yet; cards render the emblem fallback).
// Run: node scripts/seed-monuments.mjs
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public/data/monuments')

// [id, title, subtitle, type, emblem, palette, description]
const C = [
  // — Delhi —
  ['qutub-minar', 'Qutub Minar', 'The Tower of Victory', 'place', 'spear', 'flame', "Delhi's soaring 73-metre fluted sandstone minaret, begun by Qutb-ud-din Aibak in 1199 to mark the founding of the Delhi Sultanate."],
  ['iron-pillar-delhi', 'The Iron Pillar', 'The Rustless Wonder', 'artifact', 'spear', 'dusk', "A 4th-century Gupta-era iron column in the Qutb complex, famous for resisting rust for over 1,600 years."],
  ['red-fort', 'Red Fort', 'Lal Qila', 'place', 'palace', 'flame', "Shah Jahan's vast red-sandstone fortress-palace in Delhi, completed in 1648; the Prime Minister addresses the nation from its ramparts each Independence Day."],
  ['humayuns-tomb', "Humayun's Tomb", 'The First Garden-Tomb', 'place', 'crown', 'dawn', "The mid-16th-century Mughal mausoleum in Delhi, the subcontinent's first great garden-tomb and a forerunner of the Taj Mahal."],
  ['jama-masjid-delhi', 'Jama Masjid', 'The Friday Mosque', 'place', 'moon', 'flame', "Shah Jahan's grand red-sandstone and marble mosque in Old Delhi, completed in 1656 and among the largest in India."],
  ['india-gate', 'India Gate', 'The War Memorial', 'place', 'shield', 'dusk', "The 42-metre sandstone arch on Delhi's central vista, honouring the Indian soldiers who died in the First World War and the Third Anglo-Afghan War."],
  ['lotus-temple', 'Lotus Temple', 'The Bahai House of Worship', 'place', 'lotus', 'dawn', "Delhi's marble Bahai temple, opened in 1986, shaped like a half-open lotus of twenty-seven petals and open to all faiths."],
  ['purana-qila', 'Purana Qila', 'The Old Fort', 'place', 'palace', 'forest', "Delhi's oldest fort, raised by Sher Shah Suri and Humayun on a site long linked with the legendary Indraprastha."],

  // — Agra & Uttar Pradesh —
  ['taj-mahal', 'Taj Mahal', 'A Teardrop in Marble', 'place', 'crown', 'dawn', "The white-marble mausoleum at Agra built by Shah Jahan for his wife Mumtaz Mahal, completed around 1653 and the most famous monument in India."],
  ['agra-fort', 'Agra Fort', 'The Red Fort of Agra', 'place', 'palace', 'flame', "The great red-sandstone Mughal fort at Agra, residence of emperors from Akbar onward, where Shah Jahan spent his last years gazing at the Taj."],
  ['fatehpur-sikri', 'Fatehpur Sikri', "Akbar's Abandoned Capital", 'place', 'palace', 'flame', "The red-sandstone city built by Akbar in the 1570s as his capital, crowned by the towering Buland Darwaza, soon abandoned for want of water."],
  ['itimad-ud-daulah', 'Itimad-ud-Daulah', 'The Baby Taj', 'place', 'crown', 'dawn', "The exquisite Agra tomb built by Nur Jahan for her father, the first Mughal monument faced entirely in white marble with inlaid stone."],
  ['bara-imambara', 'Bara Imambara', 'The Maze of Lucknow', 'place', 'palace', 'dusk', "The grand 1784 Lucknow complex built by Nawab Asaf-ud-Daula, famed for its vast pillarless hall and the Bhulbhulaiya labyrinth."],
  ['dhamek-stupa', 'Dhamek Stupa', 'Where the Wheel Turned', 'place', 'chakra', 'dusk', "The massive cylindrical stupa at Sarnath marking the spot where the Buddha gave his first sermon, setting the wheel of dharma in motion."],
  ['lion-capital-sarnath', 'The Lion Capital', "Ashoka's Pillar at Sarnath", 'artifact', 'chakra', 'flame', "The Mauryan sandstone capital of four addorsed lions raised by Ashoka at Sarnath, adopted as the State Emblem of India."],
  ['kashi-vishwanath', 'Kashi Vishwanath Temple', 'The Golden Temple of Shiva', 'place', 'trident', 'royal', "The revered Shiva temple on the Ganga at Varanasi, its spire and dome plated in gold gifted by Maharaja Ranjit Singh."],
  ['dashashwamedh-ghat', 'Dashashwamedh Ghat', 'The Steps of the Ganga', 'place', 'river', 'ocean', "The most famous riverfront ghat at Varanasi, where the grand evening Ganga Aarti is performed before crowds of pilgrims."],
  ['jhansi-fort', 'Jhansi Fort', "Rani Lakshmibai's Stronghold", 'place', 'shield', 'forest', "The hilltop fort in Bundelkhand defended by Rani Lakshmibai during the 1857 uprising against the British."],

  // — Rajasthan —
  ['amber-fort', 'Amber Fort', 'The Amber Palace', 'place', 'palace', 'dawn', "The hilltop fort-palace near Jaipur begun by Raja Man Singh in 1592, blending Rajput and Mughal styles above Maota Lake."],
  ['hawa-mahal', 'Hawa Mahal', 'The Palace of Winds', 'place', 'crown', 'flame', "Jaipur's pink-sandstone façade of 1799, a honeycomb of 953 latticed windows from which royal women watched the street unseen."],
  ['city-palace-jaipur', 'City Palace, Jaipur', 'Seat of the Maharajas', 'place', 'throne', 'royal', "The sprawling palace complex at the heart of Jaipur, begun by Sawai Jai Singh II and still home to the city's royal family."],
  ['jantar-mantar-jaipur', 'Jantar Mantar', 'The Stone Observatory', 'place', 'star', 'dusk', "Sawai Jai Singh II's 18th-century Jaipur observatory of giant masonry instruments, including the world's largest stone sundial."],
  ['mehrangarh-fort', 'Mehrangarh Fort', 'The Citadel of Jodhpur', 'place', 'shield', 'dawn', "The mighty fort rising 120 metres above the blue city of Jodhpur, founded by Rao Jodha in 1459 and lined with carved palaces."],
  ['jaisalmer-fort', 'Jaisalmer Fort', 'The Golden Fort', 'place', 'palace', 'dawn', "The 'Sonar Quila' of yellow sandstone rising from the Thar Desert, founded in 1156 and one of the world's few still-inhabited living forts."],
  ['chittorgarh-fort', 'Chittorgarh Fort', 'The Pride of Mewar', 'place', 'shield', 'flame', "The vast hill fort of Mewar, scene of legendary Rajput sieges and jauhar, crowned by the Vijay Stambha tower of victory."],
  ['kumbhalgarh-fort', 'Kumbhalgarh Fort', 'The Great Wall of India', 'place', 'shield', 'forest', "The 15th-century Mewar fort whose perimeter wall runs some 36 kilometres, among the longest in the world; birthplace of Maharana Pratap."],
  ['city-palace-udaipur', 'City Palace, Udaipur', 'The Palace on Lake Pichola', 'place', 'throne', 'ocean', "The grand lakeside palace complex of Mewar at Udaipur, begun by Udai Singh II, overlooking the island Lake Palace."],
  ['dilwara-temples', 'Dilwara Temples', 'Marble Lacework', 'place', 'lotus', 'dawn', "The Jain temples at Mount Abu, built between the 11th and 13th centuries, renowned for astonishingly intricate white-marble carving."],
  ['ranakpur-temple', 'Ranakpur Jain Temple', 'The Temple of 1,444 Pillars', 'place', 'lotus', 'dawn', "The 15th-century marble Jain temple in Rajasthan dedicated to Adinatha, supported by 1,444 uniquely carved pillars."],
  ['junagarh-fort', 'Junagarh Fort', 'The Fort of Bikaner', 'place', 'palace', 'flame', "The fort at Bikaner raised by Raja Rai Singh in the 1590s, never conquered, holding opulent palaces within its walls."],

  // — Madhya Pradesh —
  ['khajuraho', 'Khajuraho Temples', 'Poetry in Stone', 'place', 'conch', 'dusk', "The Chandela temples of the 10th and 11th centuries in Madhya Pradesh, famed for their sensuous and intricate sculpture."],
  ['sanchi-stupa', 'Sanchi Stupa', 'The Great Stupa', 'place', 'chakra', 'forest', "The hemispherical Buddhist stupa commissioned by Ashoka in the 3rd century BCE, ringed by elaborately carved gateways (toranas)."],
  ['gwalior-fort', 'Gwalior Fort', 'The Gibraltar of India', 'place', 'shield', 'forest', "The hilltop fortress dominating Gwalior, prized for centuries and adorned with the blue-tiled Man Mandir palace."],
  ['orchha-fort', 'Orchha Fort', 'Bundela Splendour', 'place', 'palace', 'dawn', "The riverside fort-palace of the Bundela kings at Orchha, with the soaring Jahangir Mahal and royal cenotaphs along the Betwa."],
  ['jahaz-mahal', 'Jahaz Mahal', 'The Ship Palace', 'place', 'palace', 'ocean', "The 'ship palace' of Mandu, seeming to float between two lakes, built for the court of Sultan Ghiyas-ud-din Khalji."],
  ['bhimbetka', 'Bhimbetka Rock Shelters', "India's Oldest Canvas", 'place', 'mountain', 'dusk', "The rock shelters of Madhya Pradesh whose cave paintings span many thousands of years, among the earliest traces of human life in India."],
  ['bhojeshwar-temple', 'Bhojeshwar Temple', 'The Unfinished Shiva Temple', 'place', 'trident', 'forest', "The 11th-century temple at Bhojpur housing one of India's largest single-stone Shiva lingams, left unfinished by King Bhoja."],

  // — Gujarat —
  ['rani-ki-vav', 'Rani ki Vav', "The Queen's Stepwell", 'place', 'river', 'dawn', "The 11th-century stepwell at Patan, built as a memorial by Queen Udayamati, descending in carved terraces of over 500 sculptures."],
  ['modhera-sun-temple', 'Modhera Sun Temple', 'Temple of the Sun', 'place', 'sun', 'dawn', "The 11th-century Solanki temple to Surya at Modhera, aligned so the rising sun lights the sanctum at the equinoxes."],
  ['somnath-temple', 'Somnath Temple', 'The Eternal Shrine', 'place', 'trident', 'ocean', "The Shiva temple on the Gujarat coast, first of the twelve jyotirlingas, destroyed and rebuilt many times across the centuries."],
  ['dwarkadhish-temple', 'Dwarkadhish Temple', 'The Abode of Krishna', 'place', 'conch', 'ocean', "The towering five-storey temple to Krishna at Dwarka, one of the Char Dham pilgrimage sites, flying a great flag changed daily."],
  ['adalaj-stepwell', 'Adalaj Stepwell', 'A Well of Carved Light', 'place', 'river', 'dusk', "The five-storey 1498 stepwell near Ahmedabad, blending Hindu and Islamic motifs in cool carved galleries below ground."],
  ['dholavira', 'Dholavira', 'A Harappan City', 'place', 'vessel', 'dawn', "The Harappan city in the Kutch desert, over 4,500 years old, with sophisticated water reservoirs and an ancient signboard."],
  ['statue-of-unity', 'Statue of Unity', "The World's Tallest Statue", 'artifact', 'mountain', 'dawn', "The 182-metre statue of Sardar Vallabhbhai Patel on the Narmada, unveiled in 2018 as the tallest statue in the world."],
  ['sabarmati-ashram', 'Sabarmati Ashram', "Gandhi's Home", 'place', 'scroll', 'dawn', "Mahatma Gandhi's riverside ashram at Ahmedabad, from which he set out on the 1930 Salt March to Dandi."],

  // — Maharashtra —
  ['ajanta-caves', 'Ajanta Caves', 'The Painted Caves', 'place', 'mountain', 'dusk', "The rock-cut Buddhist caves of Maharashtra, carved from the 2nd century BCE, celebrated for their ancient murals of the Buddha's lives."],
  ['ellora-caves', 'Ellora Caves', 'The Kailasa Temple', 'place', 'mountain', 'dusk', "The cave complex near Aurangabad where the colossal Kailasa temple was carved top-down from a single rock, spanning Buddhist, Hindu and Jain faiths."],
  ['elephanta-caves', 'Elephanta Caves', 'The Cave of Shiva', 'place', 'trident', 'ocean', "The rock-cut Shiva caves on an island off Mumbai, dominated by the great three-headed Trimurti sculpture."],
  ['gateway-of-india', 'Gateway of India', 'The Arch of Mumbai', 'place', 'palace', 'ocean', "The basalt triumphal arch on Mumbai's waterfront, completed in 1924, through which the last British troops departed India in 1948."],
  ['cst-mumbai', 'Chhatrapati Shivaji Terminus', 'A Victorian Gothic Marvel', 'place', 'palace', 'dusk', "Mumbai's grand 1888 railway terminus, an exuberant fusion of Victorian Gothic and Indian styles designed by F. W. Stevens."],
  ['bibi-ka-maqbara', 'Bibi Ka Maqbara', 'The Taj of the Deccan', 'place', 'crown', 'dawn', "The 17th-century Aurangabad mausoleum built for Aurangzeb's wife, modelled on the Taj Mahal at smaller scale."],
  ['raigad-fort', 'Raigad Fort', "Shivaji's Capital", 'place', 'shield', 'forest', "The hill fort in the Sahyadris where Shivaji was crowned Chhatrapati in 1674, capital of the Maratha kingdom."],
  ['daulatabad-fort', 'Daulatabad Fort', 'The Hill of Devagiri', 'place', 'shield', 'forest', "The formidable conical hill fort near Aurangabad, once Muhammad bin Tughlaq's short-lived imperial capital."],

  // — Karnataka —
  ['hampi', 'Hampi', 'The Ruins of Vijayanagara', 'place', 'crown', 'dusk', "The vast ruined capital of the Vijayanagara Empire on the Tungabhadra, strewn with temples, bazaars and the great Virupaksha shrine."],
  ['stone-chariot-hampi', 'The Stone Chariot', "Hampi's Vittala Temple", 'artifact', 'chariot', 'dusk', "The iconic stone chariot shrine in Hampi's Vittala Temple complex, an emblem of Karnataka whose wheels were once able to turn."],
  ['mysore-palace', 'Mysore Palace', 'The Wodeyar Seat', 'place', 'throne', 'royal', "The opulent Indo-Saracenic palace of the Wodeyar kings at Mysuru, dazzlingly illuminated during the Dasara festival."],
  ['gol-gumbaz', 'Gol Gumbaz', 'The Whispering Dome', 'place', 'crown', 'forest', "The 17th-century tomb of Sultan Mohammed Adil Shah at Bijapur, crowned by one of the world's largest domes and a famous whispering gallery."],
  ['hoysaleswara-temple', 'Hoysaleswara Temple', 'The Halebidu Masterpiece', 'place', 'trident', 'dusk', "The 12th-century Hoysala twin Shiva temple at Halebidu, its soapstone walls covered in friezes of unmatched detail."],
  ['chennakeshava-temple', 'Chennakeshava Temple', 'The Belur Jewel', 'place', 'conch', 'dusk', "The 12th-century Hoysala temple to Vishnu at Belur, built by King Vishnuvardhana and renowned for its sculpted bracket figures."],
  ['gomateshwara', 'Gomateshwara', 'The Colossus of Shravanabelagola', 'artifact', 'lotus', 'dawn', "The 17-metre monolithic statue of the Jain saint Bahubali, carved around 981 CE and anointed in the grand Mahamastakabhisheka."],
  ['badami-caves', 'Badami Cave Temples', 'Chalukyan Rock Art', 'place', 'mountain', 'flame', "The 6th-century rock-cut cave temples of the early Chalukyas at Badami, hewn from red sandstone cliffs above Agastya Lake."],
  ['pattadakal', 'Pattadakal', 'A Cradle of Temple Building', 'place', 'conch', 'dusk', "The Chalukyan temple complex in Karnataka where northern and southern temple styles met, a UNESCO World Heritage Site."],

  // — Tamil Nadu —
  ['brihadeeswarar-temple', 'Brihadeeswarar Temple', 'The Great Chola Temple', 'place', 'trident', 'royal', "Raja Raja Chola's towering granite Shiva temple at Thanjavur, completed in 1010, its vimana among the tallest in the world."],
  ['meenakshi-temple', 'Meenakshi Amman Temple', 'The Temple of Madurai', 'place', 'lotus', 'flame', "The vast Madurai temple to Meenakshi and Sundareswarar, its towering gopurams covered in thousands of brightly painted figures."],
  ['shore-temple', 'Shore Temple', 'The Temple by the Sea', 'place', 'trident', 'ocean', "The early-8th-century Pallava temple at Mahabalipuram standing against the Bay of Bengal, one of the oldest stone temples in South India."],
  ['pancha-rathas', 'Pancha Rathas', 'The Five Chariots', 'artifact', 'chariot', 'dawn', "The five monolithic Pallava shrines at Mahabalipuram, each carved as a 'ratha' from a single rock in the 7th century."],
  ['arjunas-penance', "Arjuna's Penance", 'The Descent of the Ganges', 'artifact', 'river', 'dawn', "The giant 7th-century Pallava bas-relief at Mahabalipuram, among the largest open-air rock reliefs in the world."],
  ['airavatesvara-temple', 'Airavatesvara Temple', 'The Chariot of Darasuram', 'place', 'chariot', 'dusk', "The 12th-century Chola temple at Darasuram, shaped as a great stone chariot and famed for its musical stone steps."],
  ['ramanathaswamy-temple', 'Ramanathaswamy Temple', 'The Corridor of Rameswaram', 'place', 'conch', 'ocean', "The island temple at Rameswaram with the longest pillared corridor of any Hindu temple, both a Char Dham and a jyotirlinga site."],
  ['rock-fort-trichy', 'Rockfort Temple', 'The Rock of Tiruchirappalli', 'place', 'mountain', 'flame', "The temple complex perched atop an ancient rock outcrop at Tiruchirappalli, reached by hundreds of steps cut into the stone."],

  // — Telangana & Andhra Pradesh —
  ['charminar', 'Charminar', 'The Four Minarets', 'place', 'moon', 'flame', "Hyderabad's 1591 monument of four grand arches and minarets, raised by Muhammad Quli Qutb Shah at the founding of the city."],
  ['golconda-fort', 'Golconda Fort', 'The Citadel of Diamonds', 'place', 'shield', 'dusk', "The great granite fort of the Qutb Shahis near Hyderabad, once the centre of the world's diamond trade, with remarkable acoustics."],
  ['qutb-shahi-tombs', 'Qutb Shahi Tombs', 'The Royal Necropolis', 'place', 'crown', 'dusk', "The domed tombs of the Qutb Shahi sultans set in gardens near Golconda, blending Persian, Pathan and Hindu styles."],
  ['ramappa-temple', 'Ramappa Temple', 'The Floating-Brick Temple', 'place', 'trident', 'forest', "The 13th-century Kakatiya Shiva temple in Telangana, built with bricks light enough to float; a UNESCO World Heritage Site."],
  ['warangal-fort', 'Warangal Fort', 'The Kakatiya Capital', 'place', 'palace', 'dusk', "The ruined fort of the Kakatiya dynasty at Warangal, famed for its ornate carved gateways, the Kakatiya Kala Thoranam."],
  ['lepakshi-temple', 'Lepakshi Temple', 'The Hanging Pillar', 'place', 'conch', 'flame', "The 16th-century Vijayanagara temple in Andhra Pradesh, known for its hanging pillar, giant monolithic Nandi and ceiling murals."],

  // — Kerala & Goa —
  ['padmanabhaswamy-temple', 'Padmanabhaswamy Temple', 'The Reclining Vishnu', 'place', 'conch', 'dawn', "The Thiruvananthapuram temple to Vishnu reclining on the serpent Anantha, famed for its carved gopuram and legendary vaults."],
  ['mattancherry-palace', 'Mattancherry Palace', 'The Dutch Palace', 'place', 'palace', 'forest', "The Kochi palace built by the Portuguese and renovated by the Dutch, lined with some of India's finest Hindu murals."],
  ['bekal-fort', 'Bekal Fort', 'The Keyhole by the Sea', 'place', 'shield', 'ocean', "The large keyhole-shaped laterite fort on the Kerala coast, its observation tower looking out over the Arabian Sea."],
  ['bom-jesus-basilica', 'Basilica of Bom Jesus', 'The Shrine of Old Goa', 'place', 'star', 'dawn', "The 16th-century baroque basilica in Old Goa holding the relics of St Francis Xavier; a UNESCO World Heritage Site."],
  ['se-cathedral-goa', 'Sé Cathedral', 'The Great Church of Goa', 'place', 'palace', 'dawn', "One of Asia's largest churches, raised by the Portuguese in Old Goa and home to the famed Golden Bell."],
  ['aguada-fort', 'Fort Aguada', 'The Watchtower of Goa', 'place', 'shield', 'ocean', "The 17th-century Portuguese coastal fort and lighthouse guarding the mouth of the Mandovi against the Dutch and Marathas."],

  // — West Bengal & Odisha —
  ['victoria-memorial', 'Victoria Memorial', 'The Marble Hall of Kolkata', 'place', 'crown', 'dawn', "The grand white-marble memorial to Queen Victoria in Kolkata, completed in 1921 and now a museum of the Raj era."],
  ['howrah-bridge', 'Howrah Bridge', 'The Gateway to Kolkata', 'place', 'river', 'ocean', "The great cantilever bridge over the Hooghly, opened in 1943, carrying vast daily crowds without a single pier in the river."],
  ['dakshineswar-temple', 'Dakshineswar Kali Temple', "Ramakrishna's Shrine", 'place', 'trident', 'ocean', "The 19th-century Kali temple on the Hooghly near Kolkata, founded by Rani Rashmoni and linked to the saint Ramakrishna."],
  ['konark-sun-temple', 'Konark Sun Temple', 'The Chariot of the Sun', 'place', 'sun', 'flame', "The 13th-century Odisha temple to Surya built as a colossal stone chariot with twelve pairs of carved wheels drawn by seven horses."],
  ['jagannath-temple-puri', 'Jagannath Temple', 'The Lord of the Universe', 'place', 'chakra', 'flame', "The great 12th-century temple at Puri to Jagannath, whose deities ride out each year on towering chariots in the Rath Yatra."],
  ['lingaraja-temple', 'Lingaraja Temple', 'The Heart of Bhubaneswar', 'place', 'trident', 'dusk', "The 11th-century Kalinga-style Shiva temple dominating Bhubaneswar, the ancient 'temple city' of Odisha."],
  ['udayagiri-caves-odisha', 'Udayagiri Caves', 'The Jain Hermitage', 'place', 'mountain', 'forest', "The rock-cut caves near Bhubaneswar carved for Jain monks under King Kharavela, bearing the famous Hathigumpha inscription."],
  ['hazarduari-palace', 'Hazarduari Palace', 'The Palace of a Thousand Doors', 'place', 'palace', 'dawn', "The 19th-century Italianate palace at Murshidabad, built for the Nawabs of Bengal, with its thousand doors, many of them false."],

  // — Bihar —
  ['mahabodhi-temple', 'Mahabodhi Temple', 'Where the Buddha Awoke', 'place', 'tree', 'forest', "The temple at Bodh Gaya beside the Bodhi tree under which the Buddha attained enlightenment, among Buddhism's holiest sites."],
  ['nalanda', 'Nalanda Mahavihara', 'The Ancient University', 'place', 'scroll', 'forest', "The ruins of the great Buddhist monastic university in Bihar, a centre of learning from the 5th century until its destruction around 1200."],
  ['golghar-patna', 'Golghar', 'The Great Granary', 'place', 'vessel', 'dawn', "The beehive-shaped colonial granary built at Patna in 1786 after a famine, climbed by two sweeping spiral stairways."],

  // — Punjab, Ladakh & Himachal —
  ['golden-temple', 'Golden Temple', 'Harmandir Sahib', 'place', 'lotus', 'dawn', "The holiest shrine of Sikhism at Amritsar, its gilded sanctum set in the sacred Amrit Sarovar pool and open on all four sides."],
  ['jallianwala-bagh', 'Jallianwala Bagh', 'A Garden of Memory', 'place', 'fire', 'flame', "The walled Amritsar garden where troops fired on a peaceful gathering in 1919, a turning point in India's freedom struggle."],
  ['leh-palace', 'Leh Palace', 'The Roof of Ladakh', 'place', 'palace', 'dusk', "The nine-storey 17th-century royal palace overlooking Leh, built by King Sengge Namgyal in the manner of Tibet's Potala."],
  ['thiksey-monastery', 'Thiksey Monastery', 'The Little Potala', 'place', 'chakra', 'ocean', "The hilltop Buddhist gompa near Leh, resembling the Potala Palace, home to a giant statue of the future Buddha Maitreya."],
  ['key-monastery', 'Key Monastery', 'The Fort of Spiti', 'place', 'mountain', 'forest', "The thousand-year-old Tibetan Buddhist monastery perched on a crag high in the Spiti Valley of Himachal Pradesh."],

  // — Northeast —
  ['kamakhya-temple', 'Kamakhya Temple', 'The Shakti Shrine of Assam', 'place', 'trident', 'flame', "The hilltop temple near Guwahati to the goddess Kamakhya, among the most revered Shakti Peethas and centre of the Ambubachi Mela."],
  ['rang-ghar', 'Rang Ghar', 'The Colosseum of the East', 'place', 'palace', 'forest', "The two-storey 18th-century Ahom pavilion near Sivasagar in Assam, one of Asia's oldest surviving amphitheatres."],
]

if (C.length !== 100) throw new Error(`Expected 100 cards, got ${C.length}`)

const cards = C.map(([id, title, subtitle, type, emblem, palette, description], i) => ({
  id,
  order: i + 1,
  title,
  subtitle,
  type,
  emblem,
  palette,
  description,
}))

mkdirSync(join(outDir, 'questions'), { recursive: true })
writeFileSync(
  join(outDir, 'cards.json'),
  JSON.stringify({ category: 'monuments', name: 'Monuments of India', questionsPerCard: 30, cards }, null, 2),
)
const by = {}
for (const c of cards) by[c.type] = (by[c.type] || 0) + 1
console.log(`Wrote ${cards.length} Monuments cards →`, JSON.stringify(by))
