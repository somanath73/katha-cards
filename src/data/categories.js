// Each live category maps to a folder under public/data/<id>/ containing
// cards.json and questions/<cardId>.json. Adding a category = add an entry
// here, flip live to true, and drop its data folder in. No code changes.
export const CATEGORIES = [
  {
    id: 'mahabharat',
    name: 'Mahabharat',
    tagline: 'Heroes, vows and the war that ended an age',
    emblem: 'chakra',
    palette: 'royal',
    live: true,
  },
  {
    id: 'mythology',
    name: 'Indian Mythology',
    tagline: 'Gods, demons and the stories between',
    emblem: 'trident',
    palette: 'dusk',
    live: false,
  },
  {
    id: 'kings-kingdoms',
    name: 'Kings & Kingdoms',
    tagline: 'From Magadha to the Marathas',
    emblem: 'crown',
    palette: 'dawn',
    live: true,
  },
  {
    id: 'freedom-struggle',
    name: 'Freedom Struggle',
    tagline: 'The long road to 1947',
    emblem: 'fire',
    palette: 'flame',
    live: true,
  },
  {
    id: 'indian-politics',
    name: 'Indian Politics',
    tagline: 'The republic and its makers',
    emblem: 'scroll',
    palette: 'ocean',
    live: true,
  },
  {
    id: 'indian-cinema',
    name: 'Indian Cinema',
    tagline: 'A century of the silver screen',
    emblem: 'star',
    palette: 'forest',
    live: false,
  },
]
