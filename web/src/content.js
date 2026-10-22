// Copy follows the design pictures in content/photos/saraPhotos/demoWebPhotos.
// Those files are a reference only. The site shows housPhotos.

export const photoBase = '/photos/saraPhotos/housPhotos/';

export function photo(file) {
  return `${photoBase}${encodeURIComponent(file)}`;
}

function shot(file, caption) {
  return { file, caption };
}

export const carousel = [
  shot('upstairesSideBedroom1.jpg', 'Slaapkamer 2'),
  shot('upstairesMainBedroom1.jpg', 'Slaapkamer 1 met inmaakkasten'),
  shot('upstairesKitchen1.jpg', 'Open keuken'),
  shot('upstairesKitchen2.jpg', 'Keuken'),
  shot('upstairesDiningTable1.jpg', 'Eetplaats'),
  shot('upstairesLivingRoom1.jpg', 'Sfeerhaard'),
  shot('upstairesBathroom1.jpg', 'Badkamer met inloopdouche'),
  shot('upstairesToilet1.jpg', 'Aparte toilet'),
  shot('downstairesLivingRoom1.jpg', 'Benedenverdieping'),
  shot('downstairesKitchen1.jpg', 'Keuken beneden'),
  shot('downstairesBedroom1.jpg', 'Slaapkamer met inbouwkasten'),
  shot('outsideHouse1.jpg', 'Het huis'),
  shot('outsideBalcony1.jpg', 'Boven terras'),
  shot('outsidePadio1.jpg', 'Tuinhuis'),
  shot('poolTable1.jpg', 'Garage met biljart'),
  shot('staires1.jpg', 'Trap'),
];

export const areaCards = [
  { to: '/huis/boven', label: 'Bovenverdiep', file: 'upstairesDiningTable1.jpg' },
  { to: '/huis/beneden', label: 'Benedenverdiep', file: 'downstairesLivingRoom1.jpg' },
  { to: '/huis/inkom', label: 'Inkom, Garage & lift', file: 'staires1.jpg' },
  { to: '/huis/tuin', label: 'Tuin', file: 'outsidePadio1.jpg' },
];

export const menuItems = [
  { to: '/huis/boven', label: 'Bovenverdiep' },
  { to: '/huis/beneden', label: 'Benedenverdiep' },
  { to: '/huis/inkom', label: 'Inkom, Garage & Lift' },
  { to: '/huis/tuin', label: 'Tuin' },
];

export const region = [
  'Geniet van wandelingen langs de pittoreske rivieroever van de Semois.',
  'Bezoek het prachtige kasteel van Bouillon voor een dosis geschiedenis en architectuur.',
  'Ontdek lokale ambachten en proef heerlijke streekgerechten in charmante dorpjes.',
];

export const activityGroups = [
  {
    title: 'Leuke Activiteiten',
    id: 'activiteiten',
    items: [
      {
        icon: 'kayak',
        label: 'Kayaken',
        lines: [
          '* Kayaks zijn beschikbaar voor verhuur in de omgeving.',
          'Bij diverse verhuurbedrijven in de buurt.',
        ],
      },
      {
        icon: 'bike',
        label: 'VTT',
        lines: [
          '* Geniet van prachtige fietsroutes door de omgeving.',
          '* Huur mountainbikes voor avontuurlijke tochten in de buurt.',
          '* Verken pittoreske dorpjes per fiets op geasfalteerde wegen.',
        ],
      },
      {
        icon: 'hike',
        label: 'Wandelen',
        lines: [
          '* Diverse routes op verschillende niveaus beschikbaar voor wandelaars.',
          '* Wandelkaart voor de route aanwezig.',
          '* Ontdek de uitgestippelde wandelroutes voor een geweldige wandelervaring!',
        ],
      },
      {
        icon: 'fish',
        label: 'Vissen',
        lines: [
          'Vissen kan zowel in als uit het water, maar het is belangrijk om ervoor te zorgen dat je een visvergunning hebt. Deze vergunning kun je kopen.',
          'Zo ben je helemaal klaar voor de ultieme visbeleving!',
        ],
      },
      {
        icon: 'bowl',
        label: 'Bowlen',
        lines: [
          'Als het weer wat tegenvalt of je gewoon samen wilt genieten met familie of vrienden, is bowlen bij De Recrealle een leuke optie.',
        ],
      },
      {
        icon: 'golf',
        label: 'Mini Golf',
        lines: [
          'Altijd leuk bij zonnig weer om te mini golfen.',
          'Dit kan je doen bij een minigolfbaan bij de Recrealle.',
          'Mini golfen is een plezierige activiteit voor jong en oud.',
        ],
      },
    ],
  },
  {
    title: 'Buurtwinkel',
    items: [
      {
        icon: 'bread',
        label: 'Bakker',
        lines: [
          '* In het Dorp Alle-Sur-Semois is er een plaatselijke Bakker Boulangerie Delogne',
        ],
      },
      {
        icon: 'meat',
        label: 'Beenhouwerij',
        lines: [
          'In het dorp Alle-Sur-Semois heb je 2 beenhouwerijen.',
          '* Au Bon Jambon.',
          '* Boucherie Le Fumet Des Ardennes',
        ],
      },
      {
        icon: 'cart',
        label: 'Supermarkt',
        lines: [
          'In het Dorp Alle-Sur-Semois',
          'Kan je naar Spar om boodschappen.',
        ],
      },
    ],
  },
  {
    items: [
      {
        icon: 'cafe',
        label: 'Café',
        lines: [
          'In het Dorp Alle-Sur-Semois is er een gezellige café',
          '* Au Roy de la Bière',
          '* Aux Oies Sauvages',
        ],
      },
      {
        icon: 'dine',
        label: 'Restaurants',
        lines: [
          'In Mouzaive zelf heb je',
          '* Mon Manège a Toi.',
          'In het Dorp Alle-Sur-Semois zijn er verschillende eetgelegenheden',
        ],
      },
      {
        icon: 'pharmacy',
        label: 'Apotheker',
        lines: [
          'In het Dorp Alle-Sur-Semois is er een Apotheker',
          'Pharmacie Failia de la Semois',
        ],
      },
    ],
  },
  {
    items: [
      {
        icon: 'fuel',
        label: 'Benzinestation',
        lines: [
          'In het Dorp Chairière is er een benzinestation',
          'Station la Haizette',
        ],
      },
    ],
  },
];

export const areas = {
  boven: {
    title: 'Bovenverdiep',
    subtitle: 'Knusse warme gezellige bovenverdieping',
    groups: [
      {
        title: 'Open keuken:',
        items: [
          'Frigo',
          'Diepvriezer',
          'Oven',
          'Microgolf',
          'Vaatwasser',
          'Koffiezet Senseo Switch',
          'Eierkoker',
          'Water koker',
          'Broodrooster',
        ],
      },
      { title: 'Eetplaats:', items: ['Voorzien voor 8 personen'] },
      { title: 'Sfeervolle haard' },
      { title: 'Zithoek', items: ['Tv Proximus'] },
      { title: '2 Comfortabele tweepersoonskamers met inmaakkasten' },
      { title: 'Badkamer met inloopdouche' },
      { title: 'Apart toilet.' },
      { title: 'Zonnig terras voor ontspanning en genieten van de buitenlucht' },
    ],
    photos: [
      shot('upstairesKitchen1.jpg', 'Keuken'),
      shot('upstairesKitchen2.jpg', 'Open keuken'),
      shot('upstairesDiningTable1.jpg', 'Eetplaats'),
      shot('upstairesDiningTable2.jpg', 'Eetplaats voorzien voor 8 personen'),
      shot('upstairesDiningTable3.jpg', 'Eetplaats'),
      shot('upstairesLivingRoom1.jpg', 'Sfeerhaard'),
      shot('upstairesLivingRoom2.jpg', 'Gezellige zithoek'),
      shot('upstairesLivingRoom3.jpg', 'Zithoek'),
      shot('upstairesLivingRoom4.jpg', 'Zithoek'),
      shot('upstairesMainBedroom1.jpg', 'Slaapkamer 1 met inmaakkasten'),
      shot('upstairesMainBedroom2.jpg', 'Slaapkamer 1'),
      shot('upstairesSideBedroom1.jpg', 'Slaapkamer 2'),
      shot('upstairesSideBedroom2.jpg', 'Slaapkamer 2'),
      shot('upstairesSideBedroom3.jpg', 'Slaapkamer 2'),
      shot('upstairesBathroom1.jpg', 'Badkamer met inloopdouche'),
      shot('upstairesBathroom2.jpg', 'Badkamer'),
      shot('upstairesToilet1.jpg', 'Aparte toilet'),
      shot('outsideBalcony1.jpg', 'Zonnig terras'),
    ],
  },
  beneden: {
    title: 'Benedenverdiep',
    subtitle: 'Gezellige benedenverdieping',
    groups: [
      {
        title: 'Open keuken',
        items: [
          'Frigo',
          'Oven',
          'Vaatwasser',
          'Koffiezet Senseo Switch',
          'Eierkoker',
          'Broodrooster',
          'Water koker',
        ],
      },
      { title: 'Eetplaats:', items: ['Voorzien voor 4 personen'] },
      {
        title: 'Zithoek:',
        items: [
          'Hoekzetel die kan omgebouwd worden tot een Slaapbank voor 2 personen.',
          'TV met digibox Proximus',
        ],
      },
      { title: '1 Comfortabele tweepersoonskamer met inbouwkasten' },
      { title: 'Badkamer met inloopdouche en toilet' },
      {
        title: 'Zonnig terras:',
        items: ['Om heerlijk te ontspannen en van de buitenlucht te genieten.'],
      },
    ],
    photos: [
      shot('downstairesKitchen1.jpg', 'Open keuken'),
      shot('downstairesKitchen2.jpg', 'Keuken'),
      shot('downstairesLivingRoom1.jpg', 'Zithoek'),
      shot('downstairesLivingroom2.jpg', 'Zithoek'),
      shot('downstairesLicingroom3.jpg', 'Zithoek'),
      shot('downstairesBedroom1.jpg', 'Slaapkamer met inbouwkasten'),
      shot('downstairesBedroom2.jpg', 'Slaapkamer'),
      shot('downstairesBathroom1.jpg', 'Badkamer'),
      shot('downstairesBathroom2.jpg', 'Badkamer'),
      shot('outsideDownstairesBalcony1.jpg', 'Zonnig terras'),
    ],
  },
  inkom: {
    title: 'Inkomhal, Garage & Lift',
    groups: [
      { title: 'Inkomhal', items: ['Schoenkast'] },
      {
        title: 'Garage',
        items: [
          'Wasmachine',
          'Droogkast',
          'diepvriezer',
          'Kapstokken voor de jassen',
          'Zitbank om gemakkelijk je schoenen aan te doen.',
          'Tab Biljard',
        ],
      },
    ],
    photos: [
      shot('staires1.jpg', 'Trap'),
      shot('staires2.jpg', 'Trap'),
      shot('poolTable1.jpg', 'Biljart, wasmachine en droogkast'),
      shot('poolTable2.jpg', 'Biljart'),
    ],
  },
  tuin: {
    title: 'Tuin',
    paragraphs: [
      'Je kan op ieder moment genieten van onze tuin.',
      'Je staat op en je kan genieten op onze boven terras van de zon. even relaxen op onze beneden terras en s\'avond een heerlijke aperitief met de avond zon aan het tuinhuis.',
    ],
    photos: [
      shot('outsidePadio1.jpg', 'Tuinhuis'),
      shot('outsideBalcony1.jpg', 'Boven terras'),
      shot('outsideBalcony2.jpg', 'Boven terras'),
      shot('outsideDownstairesBalcony1.jpg', 'Beneden terras'),
      shot('outsideHouse1.jpg', 'Het huis'),
      shot('outsideHoude2.jpg', 'Buitenkant'),
      shot('outsideHoude3.jpg', 'Buitenkant'),
      shot('outsideHoude4.jpg', 'Buitenkant'),
      shot('outsideChargingCable1.jpg', 'Laadpunt'),
    ],
  },
};
