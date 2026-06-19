// Seeds public/data/ramayana/cards.json — the 100-card Ramayana deck (no questions yet).
// Run: node scripts/seed-ramayana.mjs
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public/data/ramayana')

// [id, title, subtitle, type, emblem, palette, description]
const C = [
  // — Bala Kanda: origins & boyhood —
  ['valmiki', 'Valmiki', 'The First Poet', 'character', 'scroll', 'dusk', "The sage revered as the Adi Kavi, the 'first poet', who composed the Ramayana in Sanskrit. He sheltered the exiled Sita in his hermitage and taught the epic to her twin sons."],
  ['the-ramayana', 'The Ramayana', "Rama's Journey", 'concept', 'scroll', 'royal', "One of the two great Sanskrit epics of ancient India, told in seven kandas. It narrates the life of Rama as a model of dharma, devotion, and ideal kingship."],
  ['dasharatha', 'Dasharatha', 'King of Kosala', 'character', 'throne', 'dusk', "The aged ruler of Ayodhya and father of Rama. Bound by a promise of two boons to Queen Kaikeyi, he was forced to exile his beloved son and died of grief soon after."],
  ['kaushalya', 'Kaushalya', "Rama's Mother", 'character', 'lotus', 'dawn', "The eldest queen of Dasharatha and mother of Rama. Gentle and devout, she bore her son's exile with dignified sorrow."],
  ['kaikeyi', 'Kaikeyi', 'The Queen Who Asked', 'character', 'crown', 'dusk', "Dasharatha's second queen and mother of Bharata. Swayed by her maid Manthara, she demanded the two boons that sent Rama into exile and Bharata to the throne."],
  ['sumitra', 'Sumitra', 'Mother of the Twins', 'character', 'lotus', 'dawn', "The third queen of Dasharatha and mother of the twins Lakshmana and Shatrughna, who served their elder brothers with unwavering loyalty."],
  ['putrakameshti', 'The Putrakameshti', 'A Sacrifice for Sons', 'event', 'fire', 'royal', "Childless, Dasharatha performed a great fire sacrifice for heirs. A divine being rose from the flames with sacred payasam for his queens, and four sons were born."],
  ['rama', 'Rama', 'The Seventh Avatar', 'character', 'bow', 'royal', "The eldest son of Dasharatha and hero of the epic, an incarnation of Vishnu born to destroy the demon-king Ravana. He is upheld as the ideal of dharma."],
  ['bharata', 'Bharata', 'The Reluctant Regent', 'character', 'throne', 'dusk', "Son of Kaikeyi, who refused the throne won for him by his mother's scheme. He ruled Ayodhya only as Rama's steward, placing his brother's sandals upon the throne."],
  ['lakshmana', 'Lakshmana', "Rama's Shadow", 'character', 'sword', 'flame', "The devoted twin who followed Rama into exile, serving him and Sita tirelessly. Fierce in battle, he slew the rakshasa prince Indrajit."],
  ['shatrughna', 'Shatrughna', 'The Vanquisher of Foes', 'character', 'sword', 'royal', "The youngest brother, twin of Lakshmana and constant companion of Bharata. He later slew the demon Lavanasura and founded the city of Mathura."],
  ['vishvamitra', 'Vishvamitra', 'The Warrior-Sage', 'character', 'fire', 'forest', "A king who became a brahmarshi through severe penance. He took the young Rama and Lakshmana to guard his sacrifice and taught them celestial weapons."],
  ['vasishtha', 'Vasishtha', 'The Royal Guru', 'character', 'scroll', 'royal', "The family preceptor of the house of Ikshvaku and guide to its kings. He counselled Dasharatha and conducted the rites of the dynasty."],
  ['tataka', 'Tataka', 'The Forest Demoness', 'character', 'trident', 'forest', "A fearsome yakshini turned rakshasi who ravaged the woodlands and the sages within. Rama slew her at Vishvamitra's bidding, his first great deed."],
  ['subduing-tataka', 'Subduing Tataka', "Rama's First Battle", 'event', 'arrow', 'forest', "At Vishvamitra's command the young Rama loosed his arrows against the demoness Tataka, freeing the forest hermitages from her terror."],
  ['ahalya', 'Ahalya', 'The Stone Set Free', 'character', 'lotus', 'dawn', "The wife of the sage Gautama, cursed to lie as stone for an act of deceit by Indra. The dust of Rama's feet released her and restored her form."],
  ['liberation-of-ahalya', 'Liberation of Ahalya', 'The Curse Lifted', 'event', 'lotus', 'dawn', "On the road to Mithila, Rama's touch broke the long curse upon Ahalya, returning her from stone to living woman — a sign of his redeeming grace."],
  ['mithila', 'Mithila', 'The City of Janaka', 'place', 'palace', 'dawn', "The capital of the Videha kingdom, ruled by the philosopher-king Janaka. Here Sita was raised and her swayamvara held."],
  ['janaka', 'Janaka', 'The Philosopher King', 'character', 'throne', 'royal', "The wise and detached ruler of Mithila and father of Sita, whom he found in a furrow while ploughing. He set the breaking of Shiva's bow as her bride-price."],
  ['sita', 'Sita', 'Daughter of the Earth', 'character', 'lotus', 'dawn', "The daughter of King Janaka, born of the earth and an incarnation of Lakshmi. Her devotion, purity, and endurance are the moral heart of the epic."],
  ['pinaka', 'Pinaka', "Shiva's Mighty Bow", 'artifact', 'bow', 'royal', "The colossal bow of Shiva kept in Janaka's court, which no king could even lift. Whoever could string it would win the hand of Sita."],
  ['breaking-the-bow', 'Breaking the Bow', "Sita's Swayamvara", 'event', 'bow', 'royal', "At the swayamvara Rama lifted Shiva's bow and, drawing it to string it, snapped it in two — winning Sita and announcing his more-than-mortal strength."],
  ['marriage-of-rama-sita', 'Marriage of Rama and Sita', 'A Sacred Union', 'event', 'lotus', 'dawn', "With the bow broken, Rama wed Sita at Mithila, and his three brothers married her sister and cousins in a single grand ceremony."],
  ['urmila', 'Urmila', "Lakshmana's Wife", 'character', 'lotus', 'dusk', "The daughter of Janaka who married Lakshmana. She remained in Ayodhya through the long exile, her sacrifice of separation often overlooked."],
  ['parashurama', 'Parashurama', 'The Axe-Wielding Sage', 'character', 'sword', 'flame', "The fierce brahmin-warrior avatar of Vishnu who confronted Rama after the bow broke. Rama drew Parashurama's own great bow, and the elder yielded to the new age."],

  // — Ayodhya Kanda: the exile —
  ['manthara', 'Manthara', 'The Whispering Maid', 'character', 'eye', 'dusk', "The hunchbacked servant of Kaikeyi whose poisonous counsel turned the queen against Rama, setting the tragedy of the exile in motion."],
  ['kaikeyis-boons', "Kaikeyi's Two Boons", 'A Promise Recalled', 'event', 'crown', 'dusk', "Reminding Dasharatha of two boons he had once granted, Kaikeyi demanded the crown for Bharata and fourteen years of forest exile for Rama."],
  ['vanavasa', 'Vanavasa', 'The Fourteen-Year Exile', 'concept', 'tree', 'dusk', "The long banishment to the forest that Rama accepted without complaint to keep his father's word — the test of dharma at the epic's core."],
  ['the-exile', 'The Exile of Rama', 'Into the Forest', 'event', 'tree', 'dusk', "Rather than let his father break a vow, Rama left Ayodhya for the wilderness, with Sita and Lakshmana choosing to share his hardship."],
  ['death-of-dasharatha', 'Death of Dasharatha', "A Father's Grief", 'event', 'throne', 'dusk', "Unable to bear the loss of Rama, the old king died calling his son's name, the curse of a bereaved father at last come due."],
  ['sumantra', 'Sumantra', 'The Faithful Charioteer', 'character', 'chariot', 'royal', "The trusted minister and charioteer of Dasharatha who drove Rama to the forest's edge and returned, heartbroken, to a grieving Ayodhya."],
  ['guha', 'Guha', 'The Boatman Chief', 'character', 'river', 'forest', "The Nishada chieftain and ferryman who, in love and reverence, carried Rama, Sita, and Lakshmana across the Ganga on their way to exile."],
  ['chitrakoot', 'Chitrakoot', 'The Sheltering Hills', 'place', 'mountain', 'forest', "The forested hill where Rama settled in early exile and where Bharata came to plead for his return."],
  ['the-paduka', 'The Paduka', "Rama's Sandals", 'artifact', 'throne', 'royal', "The wooden sandals Rama gave to Bharata in place of himself. Bharata enthroned them and ruled Ayodhya in their name until Rama's return."],
  ['bharatas-plea', "Bharata's Plea", 'The Sandals on the Throne', 'event', 'throne', 'royal', "Bharata journeyed to Chitrakoot begging Rama to take back the crown. Rama refused for duty's sake, and Bharata bore home only the royal sandals."],
  ['dharma', 'Dharma', 'The Path of Righteousness', 'concept', 'chakra', 'royal', "The moral law that every figure in the epic must uphold against desire and grief. Rama's unfailing adherence to it is the spine of the story."],
  ['maryada-purushottam', 'Maryada Purushottam', 'The Perfect Man', 'concept', 'lotus', 'royal', "The title given to Rama as the ideal man who never transgressed the bounds of virtue, duty, and honour."],

  // — Aranya Kanda: the forest & abduction —
  ['dandaka', 'Dandaka Forest', 'The Vast Wilderness', 'place', 'tree', 'forest', "The great southern forest of exile, haunted by rakshasas and dotted with the hermitages of sages whom Rama vowed to protect."],
  ['agastya', 'Agastya', 'The Sage of the South', 'character', 'fire', 'forest', "The venerable sage who received Rama in the Dandaka forest and gifted him divine weapons, including the bow and quiver of Vishnu."],
  ['panchavati', 'Panchavati', 'The Forest Home', 'place', 'tree', 'forest', "The grove on the Godavari where Rama, Sita, and Lakshmana built their hut and lived in peace — until Shurpanakha came."],
  ['jatayu', 'Jatayu', 'The Noble Vulture', 'character', 'garuda', 'dusk', "The aged king of vultures and friend of Dasharatha. He gave his life trying to rescue Sita from Ravana's flying chariot."],
  ['shurpanakha', 'Shurpanakha', "Ravana's Sister", 'character', 'serpent', 'flame', "The rakshasi whose advances Rama and Lakshmana spurned, and whom Lakshmana disfigured. Her grievance brought Ravana's wrath upon them."],
  ['khara', 'Khara', 'The Demon of Janasthana', 'character', 'sword', 'flame', "A rakshasa cousin of Ravana who led an army of fourteen thousand against Rama to avenge Shurpanakha, and was destroyed by him alone."],
  ['maricha', 'Maricha', 'The Golden Deer', 'character', 'eye', 'forest', "The shape-shifting rakshasa who, against his own warning, took the form of a golden deer to lure Rama away so that Ravana could seize Sita."],
  ['the-golden-deer', 'The Golden Deer', 'A Fatal Lure', 'event', 'eye', 'forest', "Enchanted by a deer of gold, Sita begged Rama to capture it. The deer was Maricha in disguise, and the chase drew Rama far from the hut."],
  ['lakshman-rekha', 'The Lakshman Rekha', 'The Line Not to Cross', 'concept', 'shield', 'forest', "The protective line Lakshmana is said to have drawn around the hut before leaving Sita. Tricked into stepping past it, she fell into Ravana's hands."],
  ['ravana', 'Ravana', 'The Ten-Headed King', 'character', 'crown', 'flame', "The mighty rakshasa emperor of Lanka, a learned devotee of Shiva turned tyrant. His abduction of Sita brought the wrath of Rama upon him."],
  ['the-ten-heads', 'The Ten Heads of Ravana', 'Knowledge and Pride', 'concept', 'crown', 'flame', "Ravana's ten heads are said to signify his mastery of the six shastras and four Vedas — vast learning ruined by ungoverned pride."],
  ['abduction-of-sita', 'The Abduction of Sita', "Ravana's Crime", 'event', 'chariot', 'flame', "Disguised as a mendicant, Ravana carried Sita off in his flying chariot to Lanka, the act that set the whole war in motion."],
  ['jatayus-stand', "Jatayu's Last Stand", "A Vulture's Sacrifice", 'event', 'garuda', 'dusk', "The aged vulture Jatayu fought Ravana in the sky to save Sita. Mortally wounded, he lived only long enough to tell Rama which way she was taken."],
  ['kabandha', 'Kabandha', 'The Headless Demon', 'character', 'serpent', 'forest', "A cursed gandharva turned into a monstrous armed torso. Slain by Rama, he was freed from his curse and pointed the brothers toward Sugriva."],
  ['shabari', 'Shabari', 'The Devoted Ascetic', 'character', 'tree', 'dawn', "The aged tribal devotee who waited a lifetime to receive Rama, offering him berries she had carefully tasted to ensure their sweetness."],

  // — Kishkindha Kanda: the vanara alliance —
  ['pampa', 'Pampa Lake', 'The Waters of Kishkindha', 'place', 'river', 'forest', "The lotus-covered lake near Rishyamukha where Rama, grieving for Sita, first met Hanuman and was led to Sugriva."],
  ['hanuman', 'Hanuman', 'The Son of the Wind', 'character', 'mace', 'flame', "The mighty vanara, son of the wind-god and supreme devotee of Rama. His strength, wisdom, and devotion carry the heart of the epic's second half."],
  ['sugriva', 'Sugriva', 'The Exiled Vanara King', 'character', 'crown', 'forest', "The monkey king of Kishkindha, driven out by his brother Vali. Allied with Rama, he lent the vanara host to the search for Sita."],
  ['vali', 'Vali', 'The Mighty Vanara', 'character', 'mace', 'forest', "The immensely strong king of Kishkindha and brother of Sugriva, blessed to drain half the strength of any foe he faced. Rama slew him to right Sugriva's wrong."],
  ['slaying-of-vali', 'The Slaying of Vali', 'An Arrow from Hiding', 'event', 'arrow', 'forest', "To restore Sugriva to his throne, Rama struck Vali with an arrow from concealment during their duel — a deed long debated for its dharma."],
  ['tara', 'Tara', 'The Wise Queen', 'character', 'lotus', 'forest', "The clever and eloquent queen of Kishkindha, wife of Vali. Her counsel and her grief are among the most affecting passages of the epic."],
  ['angada', 'Angada', "Vali's Valiant Son", 'character', 'mace', 'forest', "The young vanara prince, son of Vali, who became a chief commander in Rama's army and an envoy to Ravana's court."],
  ['jambavan', 'Jambavan', 'The King of Bears', 'character', 'mountain', 'forest', "The ancient and wise lord of the bears who counselled the search party and reminded Hanuman of his own forgotten powers."],
  ['kishkindha', 'Kishkindha', 'The Vanara Kingdom', 'place', 'mountain', 'forest', "The mountain realm of the monkey-folk ruled by Sugriva, from which the great search for Sita was launched in all directions."],
  ['vanara-sena', 'The Vanara Sena', 'The Monkey Army', 'concept', 'mace', 'forest', "The vast host of vanaras and bears who rallied to Rama, built the great bridge, and stormed Lanka in his cause."],
  ['sampati', 'Sampati', "Jatayu's Brother", 'character', 'garuda', 'flame', "The wingless elder vulture who, learning of Jatayu's death, told the searchers that Sita was held across the sea in Lanka."],

  // — Sundara Kanda: Hanuman in Lanka —
  ['mahendra', 'Mount Mahendra', 'The Leaping Peak', 'place', 'mountain', 'ocean', "The great seaside mountain from which Hanuman gathered himself and sprang across the ocean toward Lanka."],
  ['hanumans-leap', "Hanuman's Leap", 'Across the Ocean', 'event', 'mountain', 'ocean', "Swelling to enormous size, Hanuman bounded a hundred yojanas over the sea to Lanka, overcoming trials of sea-demons along the way."],
  ['surasa', 'Surasa', 'The Mother of Serpents', 'character', 'serpent', 'ocean', "A sea-demoness sent to test Hanuman during his leap. He passed through her jaws by shrinking small, proving cunning as well as strength."],
  ['lanka', 'Lanka', "Ravana's Golden City", 'place', 'palace', 'flame', "The fabled island-fortress of the rakshasas, gleaming with gold, ruled by Ravana and ringed by the sea."],
  ['ashoka-vatika', 'Ashoka Vatika', "Sita's Captivity", 'place', 'tree', 'dusk', "The grove of ashoka trees in Lanka where Sita was held captive, guarded by rakshasis, refusing all of Ravana's threats and blandishments."],
  ['trijata', 'Trijata', 'The Kindly Rakshasi', 'character', 'moon', 'dusk', "The gentle demoness among Sita's guards who comforted her with a dream foretelling Ravana's fall and Rama's victory."],
  ['the-ring-of-rama', "Rama's Signet Ring", 'A Token of Truth', 'artifact', 'star', 'flame', "The ring Hanuman carried to Sita as proof that he came from Rama, and which she answered with her own jewel."],
  ['chudamani', 'The Chudamani', "Sita's Crest-Jewel", 'artifact', 'star', 'dawn', "The hair-jewel Sita entrusted to Hanuman to carry back to Rama, a token of her endurance and a sign she still lived."],
  ['burning-of-lanka', 'The Burning of Lanka', 'A Tail Aflame', 'event', 'fire', 'flame', "Captured and his tail set alight by the rakshasas, Hanuman leapt across the rooftops and set the golden city ablaze before bounding home."],

  // — Yuddha Kanda: the war —
  ['vibhishana', 'Vibhishana', 'The Righteous Brother', 'character', 'crown', 'royal', "The virtuous younger brother of Ravana who counselled returning Sita. Cast out, he joined Rama and was promised the throne of Lanka."],
  ['nala', 'Nala', 'The Bridge-Builder', 'character', 'mountain', 'ocean', "The vanara architect, son of the divine craftsman, who engineered the great causeway of floating stones across the sea to Lanka."],
  ['setu-bandha', 'Setu Bandha', 'Building the Bridge', 'event', 'mountain', 'ocean', "The vanara host bridged the ocean with boulders and tree-trunks, some said to float because the name of Rama was written upon them."],
  ['rama-setu', 'Rama Setu', 'The Causeway to Lanka', 'place', 'river', 'ocean', "The long bridge of stones raised across the sea, over which Rama's army marched to lay siege to Lanka."],
  ['the-rakshasas', 'The Rakshasas', 'The Hosts of Lanka', 'concept', 'trident', 'flame', "The fierce demon-folk of Lanka, masters of illusion and war, who fought for Ravana against the vanara army."],
  ['kumbhakarna', 'Kumbhakarna', 'The Sleeping Giant', 'character', 'mountain', 'flame', "Ravana's colossal brother, cursed to sleep for months at a time. Woken to fight, he devoured warriors by the score before Rama felled him."],
  ['death-of-kumbhakarna', 'Death of Kumbhakarna', 'The Mountain Falls', 'event', 'mountain', 'flame', "Roused from his long sleep, the giant Kumbhakarna wrought havoc on the battlefield until Rama severed his great limbs and head with celestial arrows."],
  ['indrajit', 'Indrajit', 'The Conqueror of Indra', 'character', 'arrow', 'flame', "Ravana's eldest son Meghnad, who once defeated Indra himself. A master of illusion and the deadly serpent-arrows, he was slain at last by Lakshmana."],
  ['the-naga-pasha', 'The Naga-Pasha', 'The Serpent Noose', 'artifact', 'serpent', 'flame', "Indrajit's serpent-arrows that bound Rama and Lakshmana in living coils, until Garuda, foe of snakes, came and freed them."],
  ['garuda', 'Garuda', 'The Eagle of Vishnu', 'character', 'garuda', 'ocean', "The divine eagle and mount of Vishnu, whose mere approach scattered Indrajit's serpent-bonds and revived the fallen brothers."],
  ['sanjeevani', 'The Sanjeevani', 'The Herb of Life', 'artifact', 'tree', 'forest', "The luminous life-restoring herb growing on a far Himalayan peak. Unable to find it, Hanuman carried back the whole mountain to heal Lakshmana."],
  ['hanuman-and-the-mountain', 'Hanuman and the Mountain', 'Lifting Dronagiri', 'event', 'mountain', 'forest', "When Lakshmana lay dying, Hanuman flew to the Himalayas and, unable to pick the right herb, bore the entire glowing mountain back to the battlefield."],
  ['fall-of-indrajit', 'The Fall of Indrajit', 'Lakshmana Prevails', 'event', 'arrow', 'flame', "After fierce illusory battles, Lakshmana slew the sorcerer-prince Indrajit, breaking the back of Lanka's resistance."],
  ['mandodari', 'Mandodari', "Ravana's Queen", 'character', 'crown', 'dusk', "The wise and virtuous chief queen of Ravana, who pleaded with him in vain to return Sita and avoid the ruin of Lanka."],
  ['prahasta', 'Prahasta', "Ravana's Commander", 'character', 'mace', 'flame', "The veteran general and chief minister of Ravana, commander of the Lankan armies, who fell to the vanara host before the city walls."],
  ['pushpaka-vimana', 'The Pushpaka Vimana', 'The Flying Chariot', 'artifact', 'chariot', 'dusk', "The self-moving aerial chariot seized by Ravana, which later bore Rama, Sita, and their companions home to Ayodhya through the sky."],
  ['brahmastra', 'The Brahmastra', 'The Ultimate Weapon', 'artifact', 'arrow', 'flame', "The irresistible divine missile invoked with sacred mantras. Rama loosed it to end Ravana, striking the demon-king through the heart."],
  ['slaying-of-ravana', 'The Slaying of Ravana', "The Demon-King's End", 'event', 'bow', 'flame', "In their final duel Rama, counselled in the secret of Ravana's life, pierced him with the Brahmastra and freed the world of his tyranny."],
  ['agni-pariksha', 'The Agni Pariksha', 'The Trial by Fire', 'event', 'fire', 'flame', "To answer doubts of her purity after captivity, Sita entered fire; the god Agni bore her out unharmed, affirming her unstained virtue."],
  ['pativrata', "Sita's Fidelity", 'The Devoted Wife', 'concept', 'fire', 'dawn', "Sita's unwavering faithfulness through captivity and trial, held up by the epic as the ideal of the pativrata, the devoted wife."],

  // — Uttara Kanda: return & after —
  ['return-to-ayodhya', 'Return to Ayodhya', 'The First Diwali', 'event', 'sun', 'dawn', "The exiles' homecoming after fourteen years, when the people lit rows of lamps to welcome Rama — remembered ever after as Diwali."],
  ['sarayu', 'The Sarayu', 'River of Ayodhya', 'place', 'river', 'dawn', "The sacred river flowing past Ayodhya, witness to Rama's birth, his departure, his return, and at the last his passing from the world."],
  ['ayodhya', 'Ayodhya', "Rama's Capital", 'place', 'palace', 'royal', "The ancient capital of Kosala on the Sarayu, seat of the Ikshvaku dynasty and the city to which Rama returned in triumph."],
  ['coronation-of-rama', 'Coronation of Rama', 'The Crown at Last', 'event', 'throne', 'royal', "His exile fulfilled, Rama was crowned king of Ayodhya amid universal rejoicing, beginning the reign remembered as the golden age."],
  ['rama-rajya', 'Rama Rajya', 'The Ideal Kingdom', 'concept', 'throne', 'dawn', "The legendary reign of Rama, a byword for perfect, just, and prosperous rule in which dharma flourished and all suffering ceased."],
  ['bhakti', 'Bhakti', "Hanuman's Devotion", 'concept', 'flute', 'flame', "The path of loving devotion embodied above all by Hanuman, whose selfless service to Rama became its eternal model."],
  ['lava', 'Lava', "Rama's Son", 'character', 'bow', 'dawn', "One of the twin sons of Rama and Sita, born in Valmiki's hermitage and taught the Ramayana, which he sang before his unknowing father."],
  ['kusha', 'Kusha', "Rama's Son", 'character', 'bow', 'dawn', "The other twin of Rama and Sita, raised by Valmiki and skilled in arms and song, who with his brother recited the epic of their own father."],
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
  JSON.stringify({ category: 'ramayana', name: 'Ramayana', questionsPerCard: 30, cards }, null, 2),
)
const by = {}
for (const c of cards) by[c.type] = (by[c.type] || 0) + 1
console.log(`Wrote ${cards.length} Ramayana cards →`, JSON.stringify(by))
