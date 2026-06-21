// Seeds public/data/science/cards.json — the 100-card "Science & Innovation" deck
// (no questions and no images yet; cards render the emblem fallback).
// Run: node scripts/seed-science.mjs
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public/data/science')

// [id, title, subtitle, type, emblem, palette, description]
const C = [
  // — Ancient & classical (mathematics, astronomy, medicine) —
  ['aryabhata', 'Aryabhata', 'The First Great Astronomer', 'character', 'star', 'dusk', "The 5th-century mathematician-astronomer whose Aryabhatiya gave a place-value system, an accurate value of pi, and the idea that the Earth rotates on its axis."],
  ['brahmagupta', 'Brahmagupta', 'Master of Zero', 'character', 'scroll', 'dusk', "The 7th-century mathematician who, in the Brahmasphutasiddhanta, first set out rules for arithmetic with zero and negative numbers."],
  ['bhaskara-ii', 'Bhaskara II', 'Bhaskaracharya', 'character', 'scroll', 'royal', "The 12th-century mathematician whose Lilavati and Siddhanta Shiromani anticipated ideas of calculus and the derivative centuries before Europe."],
  ['bhaskara-i', 'Bhaskara I', 'The Sine Approximator', 'character', 'scroll', 'dusk', "The 7th-century astronomer, the first to write numbers in the Hindu place-value system with a circle for zero, famous for a remarkably accurate sine formula."],
  ['varahamihira', 'Varahamihira', 'The Polymath of Ujjain', 'character', 'sun', 'dusk', "The 6th-century astronomer-polymath whose Pancha-Siddhantika and Brihat Samhita compiled astronomy, astrology and natural science."],
  ['madhava-of-sangamagrama', 'Madhava of Sangamagrama', 'Founder of the Kerala School', 'character', 'star', 'forest', "The 14th-century mathematician who discovered infinite series for pi and the trigonometric functions, anticipating calculus by some 250 years."],
  ['sushruta', 'Sushruta', 'The Father of Surgery', 'character', 'serpent', 'forest', "The ancient surgeon whose Sushruta Samhita describes hundreds of operations and instruments, including rhinoplasty and cataract surgery."],
  ['charaka', 'Charaka', 'The Father of Medicine', 'character', 'lotus', 'forest', "The ancient physician whose Charaka Samhita is a foundational text of Ayurveda, covering diagnosis, digestion, immunity and ethics."],
  ['kanada', 'Kanada', 'The Atom Philosopher', 'character', 'eye', 'dusk', "The ancient sage who founded the Vaisheshika school and proposed that all matter is made of indivisible particles called anu (atoms)."],
  ['pingala', 'Pingala', 'The First Binary Thinker', 'character', 'dice', 'dusk', "The ancient scholar whose Chandahshastra used a binary system and arrays that prefigured Pascal's triangle and the Fibonacci sequence."],
  ['baudhayana', 'Baudhayana', 'Geometer of the Altars', 'character', 'scroll', 'dusk', "The author of the Sulba Sutras, which stated a form of the Pythagorean theorem and an accurate approximation of the square root of two."],
  ['panini', 'Panini', 'The Grammar Machine', 'character', 'scroll', 'dusk', "The ancient grammarian whose Ashtadhyayi described Sanskrit with nearly 4,000 formal rules, a system admired as a forerunner of computer science."],

  // — Modern scientists —
  ['jagadish-chandra-bose', 'Jagadish Chandra Bose', 'Pioneer of Radio & Plant Science', 'character', 'tree', 'forest', "The polymath who demonstrated millimetre radio waves and showed that plants respond to stimuli, inventing the crescograph to measure their growth."],
  ['cv-raman', 'C. V. Raman', 'The Raman Effect', 'character', 'eye', 'ocean', "The physicist who discovered the scattering of light that bears his name, winning the 1930 Nobel Prize — the first for an Asian in the sciences."],
  ['srinivasa-ramanujan', 'Srinivasa Ramanujan', 'The Man Who Knew Infinity', 'character', 'dice', 'flame', "The self-taught mathematical genius who, in a short life, produced thousands of results in number theory, partitions and infinite series."],
  ['satyendra-nath-bose', 'Satyendra Nath Bose', 'Father of the Boson', 'character', 'star', 'ocean', "The physicist whose work on quantum statistics, developed with Einstein, gave rise to Bose-Einstein statistics and the particle class called bosons."],
  ['meghnad-saha', 'Meghnad Saha', 'Reader of the Stars', 'character', 'sun', 'ocean', "The astrophysicist whose Saha ionization equation linked the spectra of stars to their temperature, transforming stellar astrophysics."],
  ['homi-bhabha', 'Homi J. Bhabha', 'Father of the Nuclear Programme', 'character', 'fire', 'flame', "The physicist who founded India's atomic energy programme and TIFR, known for Bhabha scattering in particle physics."],
  ['vikram-sarabhai', 'Vikram Sarabhai', 'Father of the Space Programme', 'character', 'arrow', 'ocean', "The visionary physicist who founded ISRO and the Physical Research Laboratory, launching India into the space age."],
  ['subrahmanyan-chandrasekhar', 'Subrahmanyan Chandrasekhar', 'The Chandrasekhar Limit', 'character', 'star', 'dusk', "The astrophysicist who showed that a white dwarf above about 1.4 solar masses must collapse, winning the 1983 Nobel Prize in Physics."],
  ['har-gobind-khorana', 'Har Gobind Khorana', 'Cracker of the Genetic Code', 'character', 'lotus', 'forest', "The biochemist who helped decipher how the genetic code directs protein synthesis, sharing the 1968 Nobel Prize in Medicine."],
  ['venkatraman-ramakrishnan', 'Venkatraman Ramakrishnan', 'Mapper of the Ribosome', 'character', 'lotus', 'forest', "The structural biologist who shared the 2009 Nobel Prize in Chemistry for revealing the atomic structure of the ribosome."],
  ['prafulla-chandra-ray', 'Prafulla Chandra Ray', 'Father of Indian Chemistry', 'character', 'vessel', 'flame', "The chemist who discovered mercurous nitrite and founded Bengal Chemicals, India's first pharmaceutical company."],
  ['shanti-swarup-bhatnagar', 'Shanti Swarup Bhatnagar', 'Architect of Indian R&D', 'character', 'vessel', 'flame', "The chemist who built the network of national laboratories under the CSIR, after whom India's top science prize is named."],
  ['birbal-sahni', 'Birbal Sahni', 'Reader of Ancient Plants', 'character', 'tree', 'forest', "The palaeobotanist who studied India's fossil plants and founded the institute of palaeosciences that bears his name."],
  ['salim-ali', 'Salim Ali', 'The Birdman of India', 'character', 'garuda', 'forest', "The ornithologist whose surveys and writings transformed the study of Indian birds and shaped the country's conservation movement."],
  ['janaki-ammal', 'E. K. Janaki Ammal', 'Pioneering Botanist', 'character', 'lotus', 'forest', "The botanist and cytogeneticist celebrated for her work on sugarcane and plant chromosomes; a magnolia is named in her honour."],
  ['anna-mani', 'Anna Mani', 'The Weather Woman of India', 'character', 'sun', 'ocean', "The physicist and meteorologist who designed instruments to measure solar radiation, ozone and wind, modernising Indian weather science."],
  ['kamala-sohonie', 'Kamala Sohonie', 'A Door Opened for Women', 'character', 'lotus', 'dawn', "The biochemist who, against great resistance, became the first Indian woman to earn a PhD in a scientific field, studying nutrition and the drink neera."],
  ['gn-ramachandran', 'G. N. Ramachandran', 'The Ramachandran Plot', 'character', 'eye', 'ocean', "The biophysicist who proposed the triple-helix structure of collagen and devised the Ramachandran plot used to study protein structure."],
  ['yellapragada-subbarow', 'Yellapragada Subbarow', 'Quiet Conqueror of Disease', 'character', 'serpent', 'forest', "The biochemist whose discoveries underpinned ATP energy chemistry and yielded the drugs methotrexate and synthetic folic acid."],
  ['ms-swaminathan', 'M. S. Swaminathan', 'Father of the Green Revolution', 'character', 'tree', 'forest', "The agricultural scientist whose high-yield wheat varieties helped India move from famine to food self-sufficiency."],
  ['verghese-kurien', 'Verghese Kurien', 'The Milkman of India', 'character', 'vessel', 'dawn', "The engineer who led Operation Flood and the Amul cooperative model, making India the world's largest milk producer."],
  ['raj-reddy', 'Raj Reddy', 'A Pioneer of AI', 'character', 'eye', 'ocean', "The computer scientist and Turing Award laureate who pioneered large-scale speech recognition and artificial intelligence."],
  ['ec-george-sudarshan', 'E. C. George Sudarshan', 'The Overlooked Genius', 'character', 'star', 'dusk', "The theoretical physicist behind the V-A theory of the weak force and the quantum theory of optical coherence."],
  ['harish-chandra', 'Harish-Chandra', 'Architect of Representation Theory', 'character', 'scroll', 'royal', "The mathematician whose deep work on harmonic analysis and the representation theory of Lie groups shaped modern mathematics."],
  ['cr-rao', 'C. R. Rao', 'A Giant of Statistics', 'character', 'dice', 'ocean', "The statistician whose Cramer-Rao bound and Rao-Blackwell theorem are cornerstones of modern statistical theory."],
  ['pc-mahalanobis', 'P. C. Mahalanobis', 'Founder of Indian Statistics', 'character', 'dice', 'ocean', "The scientist who founded the Indian Statistical Institute, devised the Mahalanobis distance and shaped national economic planning."],
  ['satish-dhawan', 'Satish Dhawan', 'Builder of Indian Rocketry', 'character', 'arrow', 'ocean', "The aerospace engineer and ISRO chairman who guided India's launch-vehicle programme; the Sriharikota spaceport is named for him."],
  ['ur-rao', 'U. R. Rao', 'The Satellite Man', 'character', 'star', 'ocean', "The space scientist who led the building of Aryabhata, India's first satellite, and later chaired ISRO."],
  ['apj-abdul-kalam', 'A. P. J. Abdul Kalam', 'The Missile Man', 'character', 'arrow', 'flame', "The aerospace engineer who led the SLV-III and India's missile programme before serving as President; a beloved teacher of science."],
  ['asima-chatterjee', 'Asima Chatterjee', 'Chemist of Healing Plants', 'character', 'lotus', 'forest', "The organic chemist renowned for work on alkaloids and anti-epileptic and anti-malarial drugs; the first Indian woman to earn a Doctor of Science."],
  ['obaid-siddiqi', 'Obaid Siddiqi', 'Founder of Indian Molecular Biology', 'character', 'lotus', 'ocean', "The molecular biologist and neurogeneticist who founded India's molecular biology research and the National Centre for Biological Sciences."],
  ['tessy-thomas', 'Tessy Thomas', 'The Missile Woman', 'character', 'arrow', 'flame', "The aerospace scientist who became the first woman to lead an Indian missile project, directing the long-range Agni programme."],
  ['raja-ramanna', 'Raja Ramanna', 'The Nuclear Mind', 'character', 'fire', 'flame', "The nuclear physicist who led the team behind India's first nuclear test, the 1974 Smiling Buddha at Pokhran."],
  ['jayant-narlikar', 'Jayant Narlikar', 'Questioner of the Big Bang', 'character', 'star', 'dusk', "The astrophysicist, co-author of the Hoyle-Narlikar theory of gravity, who founded the centre for astronomy and astrophysics at Pune."],
  ['narinder-singh-kapany', 'Narinder Singh Kapany', 'Father of Fibre Optics', 'character', 'eye', 'ocean', "The physicist whose pioneering work on light transmission through glass fibres founded the field of fibre optics."],
  ['kalpana-chawla', 'Kalpana Chawla', 'Among the Stars', 'character', 'star', 'ocean', "The aerospace engineer and first woman of Indian origin in space, who died aboard the Space Shuttle Columbia in 2003."],
  ['rakesh-sharma', 'Rakesh Sharma', 'The First Indian in Space', 'character', 'star', 'ocean', "The air-force pilot who in 1984 became the first Indian citizen in space, famously calling his homeland 'Saare Jahan Se Achha' from orbit."],
  ['vainu-bappu', 'M. K. Vainu Bappu', 'A Light for Indian Astronomy', 'character', 'moon', 'dusk', "The astronomer who revived modern observational astronomy in India and after whom a great optical telescope is named."],

  // — Institutions —
  ['isro', 'ISRO', 'The Indian Space Research Organisation', 'place', 'arrow', 'ocean', "India's national space agency, founded in 1969, known for low-cost launches, lunar and Mars missions, and the PSLV workhorse."],
  ['drdo', 'DRDO', 'Defence Research & Development', 'place', 'shield', 'flame', "India's defence research organisation, founded in 1958, behind missiles, radars, aircraft and strategic systems."],
  ['iisc-bangalore', 'Indian Institute of Science', 'The Tata Institute', 'place', 'palace', 'forest', "India's premier research institute, founded in 1909 at Bengaluru with the vision of Jamsetji Tata."],
  ['tifr', 'TIFR', 'Tata Institute of Fundamental Research', 'place', 'palace', 'ocean', "The Mumbai institute founded by Homi Bhabha in 1945, a leading centre for physics, mathematics and biology."],
  ['barc', 'BARC', 'Bhabha Atomic Research Centre', 'place', 'fire', 'flame', "India's premier nuclear research facility at Trombay, home to its research reactors and atomic energy programme."],
  ['csir', 'CSIR', 'Council of Scientific & Industrial Research', 'place', 'vessel', 'royal', "The vast network of national laboratories, set up in 1942, that drives India's industrial and applied science research."],
  ['iit', 'The IITs', 'Indian Institutes of Technology', 'place', 'palace', 'royal', "India's elite engineering and technology institutes, beginning with Kharagpur in 1951, now a global byword for talent."],
  ['indian-statistical-institute', 'Indian Statistical Institute', 'The Home of Indian Statistics', 'place', 'dice', 'ocean', "The Kolkata institute founded by P. C. Mahalanobis in 1931, a world centre for statistics and data science."],
  ['physical-research-laboratory', 'Physical Research Laboratory', 'Cradle of Space Science', 'place', 'star', 'ocean', "The Ahmedabad laboratory founded by Vikram Sarabhai in 1947, the birthplace of India's space research."],
  ['raman-research-institute', 'Raman Research Institute', "Raman's Own Institute", 'place', 'eye', 'ocean', "The Bengaluru institute founded by C. V. Raman in 1948 to pursue fundamental research in physics."],

  // — Missions & milestones —
  ['aryabhata-satellite', 'Aryabhata', "India's First Satellite", 'event', 'star', 'ocean', "India's first satellite, built by ISRO and launched in 1975, marking the country's entry into space."],
  ['chandrayaan-1', 'Chandrayaan-1', 'India Reaches the Moon', 'event', 'moon', 'dusk', "India's first lunar mission, launched in 2008, whose instruments confirmed the presence of water on the Moon."],
  ['chandrayaan-2', 'Chandrayaan-2', 'Orbiter, Lander and Rover', 'event', 'moon', 'dusk', "The ambitious 2019 lunar mission whose orbiter still studies the Moon, though its lander did not survive touchdown."],
  ['chandrayaan-3', 'Chandrayaan-3', 'Triumph at the South Pole', 'event', 'moon', 'ocean', "The 2023 mission that made India the first nation to land near the Moon's south pole and the fourth to soft-land at all."],
  ['mangalyaan', 'Mangalyaan', 'The Mars Orbiter Mission', 'event', 'arrow', 'flame', "The 2013-14 mission that made India the first country to reach Mars orbit on its very first attempt, and at remarkably low cost."],
  ['aditya-l1', 'Aditya-L1', "India's Sun Watcher", 'event', 'sun', 'flame', "India's first dedicated solar observatory, launched in 2023 to study the Sun from the L1 Lagrange point."],
  ['smiling-buddha', 'Smiling Buddha', "India's First Nuclear Test", 'event', 'fire', 'flame', "Code name of India's first nuclear test, conducted at Pokhran in 1974."],
  ['pokhran-ii', 'Pokhran-II', 'Operation Shakti', 'event', 'fire', 'flame', "The series of nuclear tests at Pokhran in 1998 that established India as a declared nuclear power."],
  ['green-revolution', 'The Green Revolution', 'From Famine to Surplus', 'event', 'tree', 'forest', "The transformation of Indian agriculture in the 1960s and 70s through high-yield seeds, irrigation and fertilisers."],
  ['white-revolution', 'The White Revolution', 'Operation Flood', 'event', 'vessel', 'dawn', "The dairy cooperative movement that made India the world's largest milk producer, led by Verghese Kurien."],
  ['slv-3', 'SLV-3', "India's First Launch Vehicle", 'event', 'arrow', 'ocean', "India's first satellite launch vehicle, which in 1980 placed the Rohini satellite in orbit under project director A. P. J. Abdul Kalam."],
  ['record-104-satellites', '104 Satellites', 'A World Record Launch', 'event', 'arrow', 'ocean', "The 2017 PSLV flight that launched 104 satellites in a single mission, a world record at the time."],
  ['gaganyaan', 'Gaganyaan', "India's Crewed Spaceflight", 'event', 'arrow', 'ocean', "India's programme to send astronauts to orbit aboard an indigenous spacecraft, its first human spaceflight effort."],
  ['apsara-reactor', 'Apsara', "Asia's First Reactor", 'event', 'fire', 'flame', "Commissioned at Trombay in 1956, Apsara was the first nuclear research reactor in Asia."],

  // — Concepts & discoveries —
  ['the-zero', 'Zero', 'The Number That Changed the World', 'concept', 'chakra', 'dusk', "The treatment of zero as a number in its own right, formalised in India, which made modern mathematics possible."],
  ['decimal-place-value', 'The Decimal System', 'The Power of Place', 'concept', 'dice', 'dusk', "The base-ten place-value notation, developed in India and carried west as the Hindu-Arabic numerals used worldwide."],
  ['raman-effect', 'The Raman Effect', 'Why the Sea is Blue', 'concept', 'eye', 'ocean', "The inelastic scattering of light by molecules, discovered by C. V. Raman, now a key tool for identifying materials."],
  ['bose-einstein-statistics', 'Bose-Einstein Statistics', 'The Physics of Bosons', 'concept', 'star', 'ocean', "The quantum statistics, founded on S. N. Bose's work, that govern particles called bosons and predict the Bose-Einstein condensate."],
  ['saha-equation', 'The Saha Equation', 'The Chemistry of Stars', 'concept', 'sun', 'ocean', "Meghnad Saha's equation linking the ionisation of a gas to its temperature and pressure, the foundation of stellar spectroscopy."],
  ['chandrasekhar-limit', 'The Chandrasekhar Limit', 'When a Star Must Die', 'concept', 'star', 'dusk', "The maximum mass, about 1.4 times the Sun, that a white dwarf can have before collapsing into a neutron star or black hole."],
  ['ramanujan-1729', 'The Number 1729', 'The Taxicab Number', 'concept', 'dice', 'flame', "The Hardy-Ramanujan number, the smallest expressible as a sum of two cubes in two different ways, made famous by Ramanujan."],
  ['ramachandran-plot', 'The Ramachandran Plot', 'The Map of Proteins', 'concept', 'eye', 'ocean', "A diagram devised by G. N. Ramachandran that maps the allowed twists of a protein's backbone, central to structural biology."],
  ['mahalanobis-distance', 'The Mahalanobis Distance', 'Measuring the Unusual', 'concept', 'dice', 'ocean', "A statistical measure of how far a point lies from a distribution, devised by P. C. Mahalanobis and widely used in data science."],
  ['ayurveda', 'Ayurveda', 'The Science of Life', 'concept', 'lotus', 'forest', "One of the world's oldest systems of medicine, built on balance among the doshas and on diet, herbs and lifestyle."],
  ['kerala-school', 'The Kerala School', 'Calculus Before Newton', 'concept', 'scroll', 'forest', "The medieval school of mathematics, led by Madhava, that developed infinite series for pi and trigonometric functions."],
  ['indian-trigonometry', 'The Sine Function', 'From Jya to Sine', 'concept', 'star', 'dusk', "The Indian functions jya and kojya, ancestors of the modern sine and cosine, passed through Arabic into world mathematics."],
  ['upi', 'UPI', 'A Payments Revolution', 'concept', 'chakra', 'royal', "The Unified Payments Interface, an Indian-built real-time system that turned the country into a world leader in digital payments."],
  ['aadhaar', 'Aadhaar', "The World's Largest ID System", 'concept', 'eye', 'royal', "India's biometric digital identity programme, the largest of its kind in the world."],

  // — Inventions, instruments & artefacts —
  ['pslv', 'PSLV', 'The Workhorse of ISRO', 'artifact', 'arrow', 'ocean', "The Polar Satellite Launch Vehicle, ISRO's reliable rocket that has launched hundreds of satellites for India and the world."],
  ['gslv', 'GSLV', 'The Cryogenic Rocket', 'artifact', 'arrow', 'ocean', "India's Geosynchronous Satellite Launch Vehicle, which mastered the difficult indigenous cryogenic engine."],
  ['param-8000', 'PARAM 8000', "India's First Supercomputer", 'artifact', 'eye', 'royal', "The indigenous supercomputer built by C-DAC in 1991 after India was denied imported machines, launching the PARAM series."],
  ['jaipur-foot', 'The Jaipur Foot', 'Mobility for Millions', 'artifact', 'tree', 'dawn', "The low-cost, rugged prosthetic limb developed in India that has restored mobility to millions of amputees worldwide."],
  ['crescograph', 'The Crescograph', "Bose's Plant Recorder", 'artifact', 'tree', 'forest', "Jagadish Chandra Bose's instrument that magnified and recorded the minute growth and responses of plants."],
  ['brahmos', 'BrahMos', 'The Supersonic Cruise Missile', 'artifact', 'arrow', 'flame', "The India-Russia supersonic cruise missile, among the fastest of its kind in service."],
  ['agni-missile', 'The Agni Missile', "India's Long Reach", 'artifact', 'fire', 'flame', "DRDO's family of long-range ballistic missiles, a pillar of India's strategic deterrent."],
  ['tejas', 'Tejas', 'The Light Combat Aircraft', 'artifact', 'arrow', 'ocean', "India's indigenous lightweight multirole fighter jet, developed over decades and inducted into the air force."],
  ['wootz-steel', 'Wootz Steel', 'The Steel of Legends', 'artifact', 'fire', 'flame', "The high-carbon crucible steel made in ancient South India, prized across the world and the basis of fabled Damascus blades."],
  ['seamless-celestial-globe', 'The Seamless Celestial Globe', 'A Metallurgical Marvel', 'artifact', 'moon', 'dusk', "Hollow metal globes cast in one seamless piece by Mughal-era metalworkers in Kashmir and Sialkot, long thought impossible to make."],
  ['aryabhatiya', 'The Aryabhatiya', 'A Treatise of the Cosmos', 'artifact', 'scroll', 'dusk', "Aryabhata's compact 5th-century treatise on mathematics and astronomy, written in verse, that influenced scholars for centuries."],
  ['bakhshali-manuscript', 'The Bakhshali Manuscript', 'An Ancient Zero', 'artifact', 'scroll', 'dawn', "An ancient birch-bark mathematical manuscript whose dotted symbol is among the earliest known uses of zero."],
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
  JSON.stringify({ category: 'science', name: 'Science & Innovation', questionsPerCard: 30, cards }, null, 2),
)
const by = {}
for (const c of cards) by[c.type] = (by[c.type] || 0) + 1
console.log(`Wrote ${cards.length} Science cards →`, JSON.stringify(by))
