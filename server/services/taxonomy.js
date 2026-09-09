// 35-item Configurable Issue Taxonomy with Multilingual keywords (English + Tamil)
export const ISSUE_TAXONOMY = [
  {
    id: 1,
    name: "Water supply interruption",
    keywords: ["water supply", "no water", "tap dry", "water shortage", "தண்ணீர் வரவில்லை", "குடிநீர் நிறுத்தம்"],
    defaultDepartment: "Water Department",
    defaultSeverity: "HIGH",
    slaHours: 24,
    jurisdiction: "Local Water Supply and Sewerage Board",
    asset: "Municipal water distribution main"
  },
  {
    id: 2,
    name: "Drinking water quality",
    keywords: ["water contamination", "dirty water", "smelly water", "yellow water", "குடிநீர் தரம்", "கழிவுநீர் கலந்த குடிநீர்"],
    defaultDepartment: "Water Department",
    defaultSeverity: "CRITICAL",
    slaHours: 12,
    jurisdiction: "Public Health and Water Quality Division",
    asset: "Potable water treatment and distribution network"
  },
  {
    id: 3,
    name: "Water leakage",
    keywords: ["pipeline leak", "water pipe burst", "water wasting", "குழாய் உடைப்பு", "தண்ணீர் கசிவு"],
    defaultDepartment: "Water Department",
    defaultSeverity: "MEDIUM",
    slaHours: 24,
    jurisdiction: "Local Water Supply and Sewerage Board",
    asset: "Distribution pipeline conduit"
  },
  {
    id: 4,
    name: "Drainage blockage",
    keywords: ["drain blocked", "drainage clogged", "stormwater drain clogged", "வடிகால் அடைப்பு", "சாக்கடை அடைப்பு"],
    defaultDepartment: "Drainage Department",
    defaultSeverity: "HIGH",
    slaHours: 24,
    jurisdiction: "Municipal Stormwater & Sullage Division",
    asset: "Stormwater and local culvert infrastructure"
  },
  {
    id: 5,
    name: "Sewage overflow",
    keywords: ["sewage", "sewage overflow", "manhole overflow", "foul water", "cesspool", "கழிவுநீர்", "சாக்கடை நீர்", "கழிவுநீர் தேங்கி", "கழிவு நீர் பெருக்கெடுத்து"],
    defaultDepartment: "Drainage Department",
    defaultSeverity: "HIGH",
    slaHours: 24,
    jurisdiction: "Municipal Public Health & Drainage Division",
    asset: "Underground sewerage system and trunk mains"
  },
  {
    id: 6,
    name: "Flooding / waterlogging",
    keywords: ["flooding", "waterlogged", "water stagnation", "submerged", "வெள்ளம்", "தண்ணீர் தேக்கம்"],
    defaultDepartment: "Drainage Department",
    defaultSeverity: "HIGH",
    slaHours: 12,
    jurisdiction: "Disaster Mitigation & Drainage Command",
    asset: "Major stormwater discharge canals"
  },
  {
    id: 7,
    name: "Road pothole",
    keywords: ["pothole", "crater on road", "deep hole", "பள்ளம்", "குண்டும் குழியும்"],
    defaultDepartment: "Roads Department",
    defaultSeverity: "MEDIUM",
    slaHours: 48,
    jurisdiction: "Highways & Urban Roads Engineering Division",
    asset: "Asphalt carriage road surface"
  },
  {
    id: 8,
    name: "Road surface damage",
    keywords: ["damaged road", "road broken", "surface eroded", "road cracked", "road collapsed", "சாலை சேதமடைந்துள்ளது", "சாலை சேதம்", "சாலை உடைந்து"],
    defaultDepartment: "Roads Department",
    defaultSeverity: "HIGH",
    slaHours: 48,
    jurisdiction: "Highways & Urban Roads Engineering Division",
    asset: "Bituminous road pavement & sub-base foundation"
  },
  {
    id: 9,
    name: "Broken bridge",
    keywords: ["bridge broken", "flyover damaged", "culvert collapsed", "பாலம் சேதம்"],
    defaultDepartment: "Roads Department",
    defaultSeverity: "CRITICAL",
    slaHours: 12,
    jurisdiction: "Special Bridges & Infrastructure Wing",
    asset: "Bridge girder and approach structure"
  },
  {
    id: 10,
    name: "Traffic obstruction",
    keywords: ["traffic blocked", "traffic jam", "road blocked", "vehicles stuck", "போக்குவரத்து பாதிப்பு", "போக்குவரத்து நெரிசல்"],
    defaultDepartment: "Roads Department",
    defaultSeverity: "HIGH",
    slaHours: 6,
    jurisdiction: "Traffic Engineering and Transit Management Wing",
    asset: "Right-of-way vehicular corridor"
  },
  {
    id: 11,
    name: "Streetlight failure",
    keywords: ["streetlight", "street lights", "light not working", "dark street", "lamp post broken", "தெருவிளக்கு", "தெருவிளக்குகளும்", "விளக்கு எரியவில்லை"],
    defaultDepartment: "Electrical Department",
    defaultSeverity: "MEDIUM",
    slaHours: 24,
    jurisdiction: "Municipal Electrical Distribution Wing",
    asset: "Public LED luminaire and streetlight pole infrastructure"
  },
  {
    id: 12,
    name: "Electrical infrastructure issue",
    keywords: ["transformer sparking", "hanging wire", "loose wire", "electric shock risk", "மின்சார கம்பி", "மின் விபத்து ஆபத்து"],
    defaultDepartment: "Electrical Department",
    defaultSeverity: "CRITICAL",
    slaHours: 4,
    jurisdiction: "State Electricity Distribution Corporation",
    asset: "High-voltage distribution cable and step-down transformer"
  },
  {
    id: 13,
    name: "Garbage accumulation",
    keywords: ["garbage", "trash pile", "dumped waste", "waste not cleared", "குப்பை", "குப்பை குவியல்", "குப்பை தேக்கம்"],
    defaultDepartment: "Sanitation Department",
    defaultSeverity: "MEDIUM",
    slaHours: 24,
    jurisdiction: "Solid Waste Management Authority",
    asset: "Public curbside collection enclosure"
  },
  {
    id: 14,
    name: "Waste collection failure",
    keywords: ["sanitation truck missed", "door to door waste", "garbage vehicle not arrived", "குப்பை வண்டி வரவில்லை"],
    defaultDepartment: "Sanitation Department",
    defaultSeverity: "LOW",
    slaHours: 36,
    jurisdiction: "Solid Waste Management Authority",
    asset: "Municipal primary collection fleet"
  },
  {
    id: 15,
    name: "Illegal dumping",
    keywords: ["illegal dumping", "commercial waste dumped", "debris dumped on street", "சட்டவிரோத குப்பை கொட்டுதல்"],
    defaultDepartment: "Sanitation Department",
    defaultSeverity: "MEDIUM",
    slaHours: 24,
    jurisdiction: "Environmental Vigilance & Public Health Enforcement",
    asset: "Public land easement"
  },
  {
    id: 16,
    name: "Public sanitation issue",
    keywords: ["open defecation", "unhygienic", "stench", "துப்புரவு குறைபாடு", "சுகாதார சீர்கேடு"],
    defaultDepartment: "Sanitation Department",
    defaultSeverity: "MEDIUM",
    slaHours: 24,
    jurisdiction: "Urban Sanitation & Public Hygiene Unit",
    asset: "Sanitary perimeter zone"
  },
  {
    id: 17,
    name: "Public toilet issue",
    keywords: ["public toilet dirty", "no water in toilet", "toilet locked", "கழிப்பறை வசதி இன்மை"],
    defaultDepartment: "Sanitation Department",
    defaultSeverity: "MEDIUM",
    slaHours: 12,
    jurisdiction: "Public Amenities Maintenance Directorate",
    asset: "Community sanitation complex"
  },
  {
    id: 18,
    name: "Mosquito/vector breeding risk",
    keywords: ["mosquito", "dengue risk", "larvae breeding", "stagnant dirty puddle", "கொசு தொல்லை", "டெங்கு கொசு"],
    defaultDepartment: "Health Department",
    defaultSeverity: "HIGH",
    slaHours: 24,
    jurisdiction: "Vector Control & Public Health Preventive Medicine",
    asset: "Epidemiological surveillance sector"
  },
  {
    id: 19,
    name: "Public health concern",
    keywords: ["disease outbreak", "epidemic symptom", "dead rodent", "தொற்றுநோய் ஆபத்து"],
    defaultDepartment: "Health Department",
    defaultSeverity: "CRITICAL",
    slaHours: 6,
    jurisdiction: "City Health Officer & Epidemiological Cell",
    asset: "Municipal health catchment area"
  },
  {
    id: 20,
    name: "Damaged public infrastructure",
    keywords: ["broken railing", "bus shelter damaged", "collapsed divider", "பொது கட்டமைப்பு சேதம்"],
    defaultDepartment: "Roads Department",
    defaultSeverity: "MEDIUM",
    slaHours: 48,
    jurisdiction: "Public Works Department",
    asset: "Civic transit amenity"
  },
  {
    id: 21,
    name: "Encroachment",
    keywords: ["footpath encroachment", "illegal structure", "hawker blocking road", "ஆக்கிரமிப்பு"],
    defaultDepartment: "Town Planning Department",
    defaultSeverity: "MEDIUM",
    slaHours: 72,
    jurisdiction: "Revenue & Town Planning Enforcement Wing",
    asset: "Public pedestrian right-of-way"
  },
  {
    id: 22,
    name: "Footpath damage",
    keywords: ["broken pavement", "footpath missing tiles", "pedestrian pathway broken", "நடைபாதை சேதம்"],
    defaultDepartment: "Roads Department",
    defaultSeverity: "LOW",
    slaHours: 72,
    jurisdiction: "Pedestrian Infrastructure Wing",
    asset: "Urban pedestrian pathway"
  },
  {
    id: 23,
    name: "Broken traffic signal",
    keywords: ["traffic light dead", "signal blinking red", "pedestrian signal broken", "போக்குவரத்து சிக்னல் பழுது"],
    defaultDepartment: "Electrical Department",
    defaultSeverity: "HIGH",
    slaHours: 6,
    jurisdiction: "Traffic Signal Automation & Electrical Control",
    asset: "Automated traffic signaling junction"
  },
  {
    id: 24,
    name: "Public transport issue",
    keywords: ["bus stopped running", "bus stand demolished", "பேருந்து நிறுத்தம் குறைபாடு"],
    defaultDepartment: "Transport Department",
    defaultSeverity: "LOW",
    slaHours: 48,
    jurisdiction: "Metropolitan Transport Corporation",
    asset: "Transit route network"
  },
  {
    id: 25,
    name: "Noise pollution",
    keywords: ["loudspeaker violation", "industrial noise night", "ஒலி மாசுபாடு"],
    defaultDepartment: "Environment Department",
    defaultSeverity: "LOW",
    slaHours: 24,
    jurisdiction: "Pollution Control Board & Local Police Liaison",
    asset: "Ambient acoustic regulatory zone"
  },
  {
    id: 26,
    name: "Air pollution",
    keywords: ["toxic smoke", "burning waste", "fumes", "காற்று மாசுபாடு"],
    defaultDepartment: "Environment Department",
    defaultSeverity: "HIGH",
    slaHours: 12,
    jurisdiction: "Air Quality Monitoring & Compliance Cell",
    asset: "Urban airshed monitoring grid"
  },
  {
    id: 27,
    name: "Environmental pollution",
    keywords: ["lake contaminated", "chemical discharge in canal", "சுற்றுச்சூழல் மாசுபாடு"],
    defaultDepartment: "Environment Department",
    defaultSeverity: "CRITICAL",
    slaHours: 12,
    jurisdiction: "State Pollution Control Board",
    asset: "Natural waterbody & wetland basin"
  },
  {
    id: 28,
    name: "Tree-related public safety issue",
    keywords: ["tree branch fallen", "uprooted tree", "tree threatening wire", "மரம் விழுந்தது", "மரக்கிளை ஆபத்து"],
    defaultDepartment: "Parks & Horticulture Department",
    defaultSeverity: "HIGH",
    slaHours: 12,
    jurisdiction: "Parks and Green Space Management",
    asset: "Municipal roadside arboriculture"
  },
  {
    id: 29,
    name: "Stray animal issue",
    keywords: ["rabid dog", "cattle blocking road", "stray menace", "தெரு நாய் தொல்லை"],
    defaultDepartment: "Veterinary & Animal Welfare Department",
    defaultSeverity: "MEDIUM",
    slaHours: 24,
    jurisdiction: "Veterinary Public Health & Animal Control",
    asset: "Animal welfare containment zone"
  },
  {
    id: 30,
    name: "School/public building infrastructure issue",
    keywords: ["school compound collapsed", "public hall roof leak", "பள்ளி கட்டிடம் சேதம்"],
    defaultDepartment: "Public Works Department",
    defaultSeverity: "HIGH",
    slaHours: 24,
    jurisdiction: "Education and Civic Architecture Division",
    asset: "Government municipal educational facility"
  },
  {
    id: 31,
    name: "Fire/emergency infrastructure issue",
    keywords: ["fire hydrant broken", "emergency access blocked", "தீயணைப்பு வசதி குறைபாடு"],
    defaultDepartment: "Fire & Rescue Services",
    defaultSeverity: "CRITICAL",
    slaHours: 4,
    jurisdiction: "Fire & Rescue Services Command",
    asset: "Public pressurized fire hydrant outlet"
  },
  {
    id: 32,
    name: "Sewage contamination",
    keywords: ["sewage entering drinking line", "toxic cesspool entering school", "கழிவுநீர் கலப்பு"],
    defaultDepartment: "Drainage Department",
    defaultSeverity: "CRITICAL",
    slaHours: 8,
    jurisdiction: "Inter-departmental Rapid Response Health & Drainage Wing",
    asset: "Contaminated residential water table"
  },
  {
    id: 33,
    name: "Construction-related civic issue",
    keywords: ["unbarricaded trench", "construction dust blocking road", "கட்டுமான குப்பைகள்"],
    defaultDepartment: "Town Planning Department",
    defaultSeverity: "MEDIUM",
    slaHours: 48,
    jurisdiction: "Building Enforcement & Safety Inspection",
    asset: "Approved urban construction site"
  },
  {
    id: 34,
    name: "Storm/rain damage",
    keywords: ["cyclone damage", "heavy rainfall damage", "roof blown off", "மழை வெள்ள சேதம்"],
    defaultDepartment: "Disaster Management Cell",
    defaultSeverity: "CRITICAL",
    slaHours: 6,
    jurisdiction: "City Emergency Operations Center",
    asset: "Citywide disaster recovery zone"
  },
  {
    id: 35,
    name: "OTHER / HUMAN_REVIEW_REQUIRED",
    keywords: ["unknown issue", "general complaint", "unclassified"],
    defaultDepartment: "Public Grievance Redressal Cell",
    defaultSeverity: "MEDIUM",
    slaHours: 48,
    jurisdiction: "Citizen Ombudsman & Grievance Directorate",
    asset: "Unclassified public property asset"
  }
];
