export type Continent =
  | "Europe"
  | "Asia"
  | "Africa"
  | "North America"
  | "South America"
  | "Oceania"
  | "Antarctica";

export const CONTINENTS: readonly Continent[] = [
  "Europe",
  "Asia",
  "Africa",
  "North America",
  "South America",
  "Oceania",
  "Antarctica",
] as const;

export const INHABITED_CONTINENTS: readonly Continent[] = [
  "Europe",
  "Asia",
  "Africa",
  "North America",
  "South America",
  "Oceania",
] as const;

/** ISO alpha-2 country codes of visited countries. */
export const VISITED_ALPHA2_CODES = [
  "at",
  "au",
  "bg",
  "cy",
  "cz",
  "de",
  "es",
  "fr",
  "gb",
  "gr",
  "hu",
  "ie",
  "it",
  "jp",
  "ma",
  "nl",
  "pl",
  "pt",
  "ro",
  "sm",
  "us",
  "va",
  "za",
] as const;

/** Maps ISO 3166-1 numeric codes (zero-padded 3 digits) to alpha-2 for visited countries. */
export const VISITED_NUMERIC_TO_ALPHA2: Readonly<Record<string, string>> = {
  "040": "AT", // Austria
  "036": "AU", // Australia
  "100": "BG", // Bulgaria
  "196": "CY", // Cyprus
  "203": "CZ", // Czechia
  "276": "DE", // Germany
  "724": "ES", // Spain
  "250": "FR", // France
  "826": "GB", // United Kingdom
  "300": "GR", // Greece
  "348": "HU", // Hungary
  "372": "IE", // Ireland
  "380": "IT", // Italy
  "392": "JP", // Japan
  "504": "MA", // Morocco
  "528": "NL", // Netherlands
  "616": "PL", // Poland
  "620": "PT", // Portugal
  "642": "RO", // Romania
  "674": "SM", // San Marino
  "840": "US", // United States
  "336": "VA", // Vatican City
  "710": "ZA", // South Africa
};

/**
 * In Natural Earth 50m, Ashmore and Cartier Is. shares numeric id "036" with Australia.
 * Exclude territory duplicates from inheriting Australia's visited status.
 */
export const VISITED_EXCLUDED_RAW_NAMES = new Set([
  "Ashmore and Cartier Is.",
]);

/** Clean display names overriding abbreviated Natural Earth labels. */
export const DISPLAY_NAME_OVERRIDES: Readonly<Record<string, string>> = {
  "United States of America": "United States",
  Vatican: "Vatican City",
  "Bosnia and Herz.": "Bosnia and Herzegovina",
  "Central African Rep.": "Central African Republic",
  "Dem. Rep. Congo": "Democratic Republic of the Congo",
  "Dominican Rep.": "Dominican Republic",
  "Eq. Guinea": "Equatorial Guinea",
  "S. Sudan": "South Sudan",
  "W. Sahara": "Western Sahara",
  "N. Cyprus": "Northern Cyprus",
  "Macedonia": "North Macedonia",
  "Solomon Is.": "Solomon Islands",
  "Marshall Is.": "Marshall Islands",
  "Falkland Is.": "Falkland Islands",
  "Cayman Is.": "Cayman Islands",
  "Cook Is.": "Cook Islands",
  "Faeroe Is.": "Faroe Islands",
  "Pitcairn Is.": "Pitcairn Islands",
  "British Virgin Is.": "British Virgin Islands",
  "U.S. Virgin Is.": "U.S. Virgin Islands",
  "Turks and Caicos Is.": "Turks and Caicos Islands",
  "N. Mariana Is.": "Northern Mariana Islands",
  "Wallis and Futuna Is.": "Wallis and Futuna",
  "Fr. Polynesia": "French Polynesia",
  "Fr. S. Antarctic Lands": "French Southern Territories",
  "Br. Indian Ocean Ter.": "British Indian Ocean Territory",
  "S. Geo. and the Is.": "South Georgia and the South Sandwich Islands",
  "Heard I. and McDonald Is.": "Heard Island and McDonald Islands",
  "Antigua and Barb.": "Antigua and Barbuda",
  "St. Kitts and Nevis": "Saint Kitts and Nevis",
  "St. Vin. and Gren.": "Saint Vincent and the Grenadines",
  "St. Pierre and Miquelon": "Saint Pierre and Miquelon",
  "St-Barthélemy": "Saint Barthélemy",
  "St-Martin": "Saint Martin",
};

/** Common English, Italian, and abbreviation aliases for smooth search. */
export const SEARCH_ALIASES: Readonly<Record<string, readonly string[]>> = {
  "040": ["AT", "Österreich"],
  "036": ["AU", "Aussie"],
  "100": ["BG"],
  "196": ["CY", "Cipro"],
  "203": ["CZ", "Czech Republic", "Repubblica Ceca"],
  "276": ["DE", "Germania", "Deutschland"],
  "724": ["ES", "Spagna", "España"],
  "250": ["FR", "Francia"],
  "826": ["GB", "UK", "Great Britain", "Britain", "England", "Regno Unito"],
  "300": ["GR", "Grecia", "Hellas"],
  "348": ["HU", "Ungheria", "Magyarország"],
  "372": ["IE", "Irlanda", "Éire"],
  "380": ["IT", "Italia"],
  "392": ["JP", "Giappone", "Nippon", "Nihon"],
  "504": ["MA", "Marocco"],
  "528": ["NL", "Holland", "Paesi Bassi", "Olanda"],
  "616": ["PL", "Polonia", "Polska"],
  "620": ["PT", "Portogallo"],
  "642": ["RO", "România"],
  "674": ["SM", "Repubblica di San Marino"],
  "840": ["US", "USA", "America", "United States of America", "Stati Uniti"],
  "336": ["VA", "Vatican", "Holy See", "Città del Vaticano", "Vaticano"],
  "710": ["ZA", "Sudafrica"],
  "756": ["CH", "Svizzera", "Schweiz", "Suisse"],
  "156": ["CN", "Cina"],
  "076": ["BR", "Brasile", "Brasil"],
  "124": ["CA"],
  "484": ["MX", "Messico", "México"],
  "643": ["RU"],
  "356": ["IN"],
  "410": ["KR", "Corea del Sud", "Korea"],
  "554": ["NZ", "Nuova Zelanda"],
  "578": ["NO", "Norvegia"],
  "752": ["SE", "Svezia"],
  "246": ["FI", "Finlandia"],
  "208": ["DK", "Danimarca"],
  "056": ["BE", "Belgio"],
  "191": ["HR", "Croazia"],
  "792": ["TR", "Türkiye", "Turchia"],
  "818": ["EG", "Egitto"],
  "032": ["AR"],
  "764": ["TH", "Tailandia"],
};

/** Microstates that receive dedicated luminous 3D beacons and expanded hit targets. */
export const MICROSTATE_NUMERIC_IDS = new Set([
  "674", // San Marino
  "336", // Vatican City
  "492", // Monaco
  "020", // Andorra
  "438", // Liechtenstein
  "470", // Malta
  "702", // Singapore
]);

/** Curated focus coordinates & camera distances for countries with overseas territories or wide spans. */
export const FOCUS_OVERRIDES: Readonly<
  Record<string, { lat: number; lon: number; distance?: number }>
> = {
  "250": { lat: 46.6, lon: 2.3, distance: 2.05 }, // France (mainland, not Guiana)
  "840": { lat: 39.5, lon: -98.35, distance: 2.65 }, // United States (contiguous)
  "643": { lat: 61.5, lon: 95.0, distance: 3.0 }, // Russia
  "036": { lat: -25.3, lon: 133.8, distance: 2.65 }, // Australia
  "528": { lat: 52.2, lon: 5.3, distance: 1.85 }, // Netherlands (mainland)
  "724": { lat: 40.2, lon: -3.7, distance: 2.05 }, // Spain
  "620": { lat: 39.6, lon: -8.0, distance: 1.95 }, // Portugal
  "826": { lat: 54.4, lon: -2.6, distance: 2.0 }, // United Kingdom
  "380": { lat: 42.5, lon: 12.6, distance: 2.0 }, // Italy
  "674": { lat: 43.9424, lon: 12.4578, distance: 1.58 }, // San Marino
  "336": { lat: 41.9029, lon: 12.4534, distance: 1.58 }, // Vatican City
  "196": { lat: 35.1264, lon: 33.4299, distance: 1.75 }, // Cyprus
  "392": { lat: 36.2, lon: 138.25, distance: 2.15 }, // Japan
  "710": { lat: -29.0, lon: 24.5, distance: 2.25 }, // South Africa
  "578": { lat: 64.5, lon: 11.5, distance: 2.2 }, // Norway
  "208": { lat: 56.1, lon: 10.0, distance: 1.9 }, // Denmark
  "554": { lat: -41.5, lon: 172.5, distance: 2.25 }, // New Zealand
  "124": { lat: 56.1, lon: -106.3, distance: 2.85 }, // Canada
  "156": { lat: 35.8, lon: 104.2, distance: 2.7 }, // China
  "076": { lat: -14.2, lon: -51.9, distance: 2.65 }, // Brazil
  "360": { lat: -2.2, lon: 118.0, distance: 2.55 }, // Indonesia
  "152": { lat: -35.7, lon: -71.5, distance: 2.5 }, // Chile
  "242": { lat: -17.8, lon: 178.0, distance: 1.95 }, // Fiji
  "296": { lat: 1.87, lon: -157.36, distance: 2.0 }, // Kiribati
};

/** Complete continent lookup by Natural Earth raw country name. */
export const CONTINENT_BY_RAW_NAME: Readonly<Record<string, Continent>> = {
  // Europe
  Albania: "Europe",
  Andorra: "Europe",
  Austria: "Europe",
  Belarus: "Europe",
  Belgium: "Europe",
  "Bosnia and Herz.": "Europe",
  Bulgaria: "Europe",
  Croatia: "Europe",
  Cyprus: "Europe",
  Czechia: "Europe",
  Denmark: "Europe",
  Estonia: "Europe",
  "Faeroe Is.": "Europe",
  Finland: "Europe",
  France: "Europe",
  Germany: "Europe",
  Greece: "Europe",
  Guernsey: "Europe",
  Hungary: "Europe",
  Iceland: "Europe",
  Ireland: "Europe",
  "Isle of Man": "Europe",
  Italy: "Europe",
  Jersey: "Europe",
  Kosovo: "Europe",
  Latvia: "Europe",
  Liechtenstein: "Europe",
  Lithuania: "Europe",
  Luxembourg: "Europe",
  Macedonia: "Europe",
  Malta: "Europe",
  Moldova: "Europe",
  Monaco: "Europe",
  Montenegro: "Europe",
  "N. Cyprus": "Europe",
  Netherlands: "Europe",
  Norway: "Europe",
  Poland: "Europe",
  Portugal: "Europe",
  Romania: "Europe",
  Russia: "Europe",
  "San Marino": "Europe",
  Serbia: "Europe",
  Slovakia: "Europe",
  Slovenia: "Europe",
  Spain: "Europe",
  Sweden: "Europe",
  Switzerland: "Europe",
  Ukraine: "Europe",
  "United Kingdom": "Europe",
  Vatican: "Europe",
  Åland: "Europe",

  // Asia
  Afghanistan: "Asia",
  Armenia: "Asia",
  Azerbaijan: "Asia",
  Bahrain: "Asia",
  Bangladesh: "Asia",
  Bhutan: "Asia",
  "Br. Indian Ocean Ter.": "Asia",
  Brunei: "Asia",
  Cambodia: "Asia",
  China: "Asia",
  Georgia: "Asia",
  "Hong Kong": "Asia",
  India: "Asia",
  "Indian Ocean Ter.": "Asia",
  Indonesia: "Asia",
  Iran: "Asia",
  Iraq: "Asia",
  Israel: "Asia",
  Japan: "Asia",
  Jordan: "Asia",
  Kazakhstan: "Asia",
  Kuwait: "Asia",
  Kyrgyzstan: "Asia",
  Laos: "Asia",
  Lebanon: "Asia",
  Macao: "Asia",
  Malaysia: "Asia",
  Maldives: "Asia",
  Mongolia: "Asia",
  Myanmar: "Asia",
  Nepal: "Asia",
  "North Korea": "Asia",
  Oman: "Asia",
  Pakistan: "Asia",
  Palestine: "Asia",
  Philippines: "Asia",
  Qatar: "Asia",
  "Saudi Arabia": "Asia",
  "Siachen Glacier": "Asia",
  Singapore: "Asia",
  "South Korea": "Asia",
  "Sri Lanka": "Asia",
  Syria: "Asia",
  Taiwan: "Asia",
  Tajikistan: "Asia",
  Thailand: "Asia",
  "Timor-Leste": "Asia",
  Turkey: "Asia",
  Turkmenistan: "Asia",
  "United Arab Emirates": "Asia",
  Uzbekistan: "Asia",
  Vietnam: "Asia",
  Yemen: "Asia",

  // Africa
  Algeria: "Africa",
  Angola: "Africa",
  Benin: "Africa",
  Botswana: "Africa",
  "Burkina Faso": "Africa",
  Burundi: "Africa",
  "Cabo Verde": "Africa",
  Cameroon: "Africa",
  "Central African Rep.": "Africa",
  Chad: "Africa",
  Comoros: "Africa",
  Congo: "Africa",
  "Côte d'Ivoire": "Africa",
  "Dem. Rep. Congo": "Africa",
  Djibouti: "Africa",
  Egypt: "Africa",
  "Eq. Guinea": "Africa",
  Eritrea: "Africa",
  eSwatini: "Africa",
  Ethiopia: "Africa",
  Gabon: "Africa",
  Gambia: "Africa",
  Ghana: "Africa",
  Guinea: "Africa",
  "Guinea-Bissau": "Africa",
  Kenya: "Africa",
  Lesotho: "Africa",
  Liberia: "Africa",
  Libya: "Africa",
  Madagascar: "Africa",
  Malawi: "Africa",
  Mali: "Africa",
  Mauritania: "Africa",
  Mauritius: "Africa",
  Morocco: "Africa",
  Mozambique: "Africa",
  Namibia: "Africa",
  Niger: "Africa",
  Nigeria: "Africa",
  Rwanda: "Africa",
  "Saint Helena": "Africa",
  "São Tomé and Principe": "Africa",
  Senegal: "Africa",
  Seychelles: "Africa",
  "Sierra Leone": "Africa",
  Somalia: "Africa",
  Somaliland: "Africa",
  "South Africa": "Africa",
  "S. Sudan": "Africa",
  Sudan: "Africa",
  Tanzania: "Africa",
  Togo: "Africa",
  Tunisia: "Africa",
  Uganda: "Africa",
  "W. Sahara": "Africa",
  Zambia: "Africa",
  Zimbabwe: "Africa",

  // North America
  Anguilla: "North America",
  "Antigua and Barb.": "North America",
  Aruba: "North America",
  Bahamas: "North America",
  Barbados: "North America",
  Belize: "North America",
  Bermuda: "North America",
  "British Virgin Is.": "North America",
  Canada: "North America",
  "Cayman Is.": "North America",
  "Costa Rica": "North America",
  Cuba: "North America",
  Curaçao: "North America",
  Dominica: "North America",
  "Dominican Rep.": "North America",
  "El Salvador": "North America",
  Greenland: "North America",
  Grenada: "North America",
  Guatemala: "North America",
  Haiti: "North America",
  Honduras: "North America",
  Jamaica: "North America",
  Mexico: "North America",
  Montserrat: "North America",
  Nicaragua: "North America",
  Panama: "North America",
  "Puerto Rico": "North America",
  "Saint Lucia": "North America",
  "Sint Maarten": "North America",
  "St-Barthélemy": "North America",
  "St-Martin": "North America",
  "St. Kitts and Nevis": "North America",
  "St. Pierre and Miquelon": "North America",
  "St. Vin. and Gren.": "North America",
  "Trinidad and Tobago": "North America",
  "Turks and Caicos Is.": "North America",
  "U.S. Virgin Is.": "North America",
  "United States of America": "North America",

  // South America
  Argentina: "South America",
  Bolivia: "South America",
  Brazil: "South America",
  Chile: "South America",
  Colombia: "South America",
  Ecuador: "South America",
  "Falkland Is.": "South America",
  Guyana: "South America",
  Paraguay: "South America",
  Peru: "South America",
  Suriname: "South America",
  Uruguay: "South America",
  Venezuela: "South America",

  // Oceania
  "American Samoa": "Oceania",
  "Ashmore and Cartier Is.": "Oceania",
  Australia: "Oceania",
  "Cook Is.": "Oceania",
  Fiji: "Oceania",
  "Fr. Polynesia": "Oceania",
  Guam: "Oceania",
  Kiribati: "Oceania",
  "Marshall Is.": "Oceania",
  Micronesia: "Oceania",
  "N. Mariana Is.": "Oceania",
  Nauru: "Oceania",
  "New Caledonia": "Oceania",
  "New Zealand": "Oceania",
  Niue: "Oceania",
  "Norfolk Island": "Oceania",
  Palau: "Oceania",
  "Papua New Guinea": "Oceania",
  "Pitcairn Is.": "Oceania",
  Samoa: "Oceania",
  "Solomon Is.": "Oceania",
  Tonga: "Oceania",
  Vanuatu: "Oceania",
  "Wallis and Futuna Is.": "Oceania",

  // Antarctica
  Antarctica: "Antarctica",
  "Fr. S. Antarctic Lands": "Antarctica",
  "Heard I. and McDonald Is.": "Antarctica",
  "S. Geo. and the Is.": "Antarctica",
};
