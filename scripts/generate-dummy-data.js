import { randomUUID } from "crypto";
import { writeFileSync, readdirSync } from "fs";
import { join } from "path";

const NUM_USERS = 200;
const NUM_BULLETINS = 200;
const TEMPLATE_IMAGE_COUNTS = { 0: 6, 1: 2, 2: 5, 3: 6 };

// Image UUIDs from imgs/supabase-files (filenames without extension)
const SUPABASE_IMAGES_DIR = join(process.cwd(), "imgs", "supabase-files");
function loadImagePool() {
  try {
    const files = readdirSync(SUPABASE_IMAGES_DIR);
    const uuids = files
      .filter((f) => /\.(jpeg|jpg|png|gif|webp)$/i.test(f))
      .map((f) => f.replace(/\.[^.]+$/, ""));
    if (uuids.length === 0) throw new Error("No image files found");
    return uuids;
  } catch (err) {
    console.error("Failed to load images from imgs/supabase-files:", err.message);
    process.exit(1);
  }
}

const firstNames = [
  "Maya", "Jordan", "Alex", "Sam", "Emma", "Riley", "Morgan", "Casey", "Quinn", "Avery",
  "James", "Olivia", "Liam", "Sophia", "Noah", "Isabella", "Ethan", "Mia", "Mason", "Charlotte",
  "Lucas", "Amelia", "Oliver", "Harper", "Elijah", "Evelyn", "Aiden", "Abigail", "Sebastian", "Emily",
  "Jackson", "Elizabeth", "Aria", "Scarlett", "Luna", "Chloe", "Ella", "Penelope", "Layla", "Zoey",
  "Nora", "Camila", "Hannah", "Lillian", "Addison", "Eleanor", "Natalie", "Lily", "Grace", "Violet",
  "Derek", "Tyler", "Brandon", "Jasmine", "Destiny", "Brianna", "Sierra", "Cheyenne", "Skyler", "Parker",
  "River", "Phoenix", "Blake", "Hayden", "Reese", "Sage", "Rowan", "Finley", "Dakota", "Remington",
  "Yuki", "Hiro", "Mei", "Wei", "Priya", "Arjun", "Zara", "Omar", "Layla", "Amir",
  "Sofia", "Diego", "Valentina", "Mateo", "Luciana", "Nicolas", "Elena", "Adrian", "Gabriela", "Daniel",
  "Marcus", "Jade", "Kennedy", "Taylor", "Reagan", "Cameron", "Payton", "Ellis", "Emery", "Kendall"
];

const lastNames = [
  "Chen", "Reese", "Torres", "Foster", "Wright", "Hayes", "Brooks", "Bell", "Murphy", "Rivera",
  "Cooper", "Richardson", "Cox", "Howard", "Ward", "Torres", "Peterson", "Gray", "Ramirez", "James",
  "Watson", "Brooks", "Kelly", "Sanders", "Price", "Bennett", "Wood", "Barnes", "Ross", "Henderson",
  "Coleman", "Jenkins", "Perry", "Powell", "Long", "Patterson", "Hughes", "Flores", "Washington", "Butler",
  "Simmons", "Foster", "Gonzales", "Bryant", "Alexander", "Russell", "Griffin", "Diaz", "Hayes", "Myers",
  "Kim", "Park", "Nguyen", "Tran", "Patel", "Sharma", "Singh", "Khan", "Ali", "Hassan",
  "Okonkwo", "Nkrumah", "Okafor", "Santos", "Silva", "Costa", "Oliveira", "Fischer", "Weber", "Mueller",
  "Novak", "Kowalski", "Nielsen", "Larsson", "Bergstrom", "Vasquez", "Rodriguez", "Martinez", "Garcia", "Lopez"
];

const streets = [
  "Oak St", "Maple Ave", "Cedar Ln", "Pine Rd", "Elm Dr", "Birch Way", "Willow Blvd", "Ash St",
  "Main St", "Park Ave", "Lake Dr", "Hill Rd", "Valley View", "Sunset Blvd", "River Rd", "Forest Ln",
  "Washington St", "Lincoln Ave", "Jefferson Dr", "Franklin Way", "Highland Ave", "Broadway", "First St", "Fifth Ave"
];

const cityStates = [
  "Portland OR", "Asheville NC", "Austin TX", "Nashville TN", "Denver CO", "Minneapolis MN",
  "Seattle WA", "Boston MA", "San Diego CA", "Chicago IL", "Atlanta GA", "Phoenix AZ",
  "Miami FL", "Philadelphia PA", "Detroit MI", "Columbus OH", "Charlotte NC", "Indianapolis IN",
  "San Francisco CA", "Brooklyn NY", "Oakland CA", "Tucson AZ", "Albuquerque NM", "Boise ID",
  "Boulder CO", "Burlington VT", "Madison WI", "Ann Arbor MI", "Salt Lake City UT", "Raleigh NC"
];

function uuid() {
  return randomUUID();
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function phoneNumber(used) {
  let n;
  do {
    const area = 200 + Math.floor(Math.random() * 800);
    const rest = String(1000000 + Math.floor(Math.random() * 9000000));
    n = `+1${area}${rest}`;
  } while (used.has(n));
  used.add(n);
  return n;
}

function csvEscape(val) {
  const s = String(val ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

// Build pool of image UUIDs from supabase-files (reused across users/bulletins)
const imagePool = loadImagePool();

// Blurb snippets for variety (under 230 chars when combined)
const blurbParts = [
  "This month was a whirlwind. ", "Quiet but meaningful. ", "So much happened. ",
  "Focus on the small joys. ", "Big changes ahead. ", "Grateful for every day. ",
  "Spent a lot of time outdoors. ", "Caught up with old friends. ", "Work kept me busy. ",
  "Tried something new every week. ", "Family time was the highlight. ", "Travel and home in balance. "
];

function randomBlurb() {
  const parts = [pick(blurbParts), pick(blurbParts)];
  let s = parts.join("").trim();
  while (s.length < 100 && Math.random() > 0.5) {
    s += " " + pick(blurbParts).trim();
  }
  return s.slice(0, 230);
}

// Calendar note snippets
const noteSnippets = [
  "Coffee with a friend", "Gym in the morning", "Team standup", "Dinner with family",
  "Doctor appointment", "Grocery run", "Book club", "Walk in the park", "Video call with Mom",
  "Dentist", "Oil change", "Concert downtown", "Brunch plans", "Flight to Chicago",
  "Birthday party", "Yoga class", "Meeting at 3pm", "Lunch with Sarah", "Pick up dry cleaning",
  "Movie night", "Garden work", "Dog park", "Kids soccer game", "Haircut at 2pm"
];

function randomMarch2026Date() {
  const day = 1 + Math.floor(Math.random() * 31);
  const hour = 8 + Math.floor(Math.random() * 12);
  const min = Math.random() > 0.5 ? 0 : 30;
  return `2026-03-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}:00.000Z`;
}

function fourSavedNotes() {
  const used = new Set();
  const notes = [];
  while (notes.length < 4) {
    const date = randomMarch2026Date();
    const note = pick(noteSnippets);
    if (used.has(date)) continue;
    used.add(date);
    notes.push({ date, note });
  }
  notes.sort((a, b) => a.date.localeCompare(b.date));
  return notes;
}

// Shuffle array
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const usedPhones = new Set();
const users = [];
const bulletins = [];
const bulletinIdsByPhone = new Map();

for (let i = 0; i < NUM_USERS; i++) {
  const id = uuid();
  const phone = phoneNumber(usedPhones);
  const bulletinId = uuid();
  bulletinIdsByPhone.set(phone, bulletinId);

  const numImages = 2 + Math.floor(Math.random() * 6);
  const imageIds = shuffle(imagePool).slice(0, numImages).join(";");

  users.push({
    id,
    created_at: "2026-02-01T10:00:00.000Z",
    first_name: pick(firstNames),
    last_name: pick(lastNames),
    images: imageIds,
    bulletins: bulletinId,
    phone_number: phone,
    saved_notes: "[]",
    created_user_id: id,
    address: `${Math.floor(Math.random() * 9999) + 1} ${pick(streets)}, ${pick(cityStates)}`,
    recipients: "",
    connections: null, // set below after phoneList exists
    onboarding_completed: "true",
  });
}

const phoneList = users.map((u) => u.phone_number);
// Each user gets 5 or 6 connections = other users' phone numbers, no self, no duplicates
for (const u of users) {
  const otherPhones = phoneList.filter((p) => p !== u.phone_number);
  const numConnections = 5 + Math.floor(Math.random() * 2); // 5 or 6
  u.connections = shuffle(otherPhones).slice(0, numConnections);
}
const shuffledPhones = shuffle(phoneList);

for (let i = 0; i < NUM_BULLETINS; i++) {
  const template = Math.floor(Math.random() * 4);
  const count = TEMPLATE_IMAGE_COUNTS[template];
  const imageIds = shuffle(imagePool).slice(0, count).join(";");
  const owner = shuffledPhones[i];

  bulletins.push({
    id: bulletinIdsByPhone.get(owner),
    created_at: `2026-02-0${1 + (i % 6)} ${10 + (i % 10)}:${(i % 60).toString().padStart(2, "0")}:00.000000+00`,
    images: imageIds,
    blurb: randomBlurb(),
    owner: owner,
    month: String(1 + (i % 12)),
    saved_notes: fourSavedNotes(),
    template,
  });
}

function csvEscapeSavedNotes(notes) {
  return csvEscape(JSON.stringify(notes));
}

// Output images as JSON array of strings for DB array column
function imagesToJsonArray(semicolonSeparated) {
  const arr = semicolonSeparated ? semicolonSeparated.split(";").filter(Boolean) : [];
  return csvEscape(JSON.stringify(arr));
}

// Output connections as JSON array of strings for DB array column
function connectionsToJsonArray(connectionsArray) {
  return csvEscape(JSON.stringify(connectionsArray ?? []));
}

const userHeader = "id,created_at,first_name,last_name,images,bulletins,phone_number,saved_notes,created_user_id,address,recipients,connections,onboarding_completed";
const userRows = users.map((u) =>
  [
    u.id,
    u.created_at,
    u.first_name,
    u.last_name,
    imagesToJsonArray(u.images),
    u.bulletins,
    u.phone_number,
    csvEscape(u.saved_notes),
    u.created_user_id,
    csvEscape(u.address),
    u.recipients,
    connectionsToJsonArray(u.connections),
    u.onboarding_completed,
  ].join(",")
);

const bulletinHeader = "id,created_at,images,blurb,owner,month,saved_notes,template";
const bulletinRowsFinal = bulletins.map((b) =>
  [
    b.id,
    csvEscape(b.created_at),
    imagesToJsonArray(b.images),
    csvEscape(b.blurb),
    b.owner,
    b.month,
    csvEscapeSavedNotes(b.saved_notes),
    b.template,
  ].join(",")
);

writeFileSync(
  "dummyUsers200.csv",
  [userHeader, ...userRows].join("\n")
);

writeFileSync(
  "dummyBulletins200.csv",
  [bulletinHeader, ...bulletinRowsFinal].join("\n")
);

writeFileSync(
  "phone_numbers.json",
  JSON.stringify(phoneList, null, 2)
);

console.log("Wrote dummyUsers200.csv, dummyBulletins200.csv, phone_numbers.json");
console.log("Users:", NUM_USERS, "Bulletins:", NUM_BULLETINS, "Phones:", phoneList.length);
