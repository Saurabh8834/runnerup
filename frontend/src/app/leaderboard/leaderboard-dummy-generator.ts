import type { LeaderboardEntry, ParticipantEntry } from "./leaderboard-client";

export const DIVERSE_INDIAN_RUNNERS = [
  { name: "Karan Oberoi", city: "Noida", state: "Uttar Pradesh" },
  { name: "Alok Srivastava", city: "Varanasi", state: "Uttar Pradesh" },
  { name: "Deepak Gokhale", city: "Kolhapur", state: "Maharashtra" },
  { name: "Radhika Dwivedi", city: "Prayagraj", state: "Uttar Pradesh" },
  { name: "Archana Pillai", city: "Alappuzha", state: "Kerala" },
  { name: "Pooja Choudhary", city: "Jaipur", state: "Rajasthan" },
  { name: "Manoj Deshpande", city: "Aurangabad", state: "Maharashtra" },
  { name: "Ajay Grewal", city: "Patiala", state: "Punjab" },
  { name: "Bhavesh Parekh", city: "Bhavnagar", state: "Gujarat" },
  { name: "Sameer Kulkarni", city: "Nashik", state: "Maharashtra" },
  { name: "Gaurav Tiwari", city: "Kanpur", state: "Uttar Pradesh" },
  { name: "Prateek Mehra", city: "Faridabad", state: "Haryana" },
  { name: "Rakesh Nanda", city: "Cuttack", state: "Odisha" },
  { name: "Shweta Ahuja", city: "Ambala", state: "Haryana" },
  { name: "Pankaj Vats", city: "Panipat", state: "Haryana" },
  { name: "Kabir Sethi", city: "Delhi NCR", state: "Delhi" },
  { name: "Ritu Patel", city: "Ahmedabad", state: "Gujarat" },
  { name: "Dev Malhotra", city: "Mumbai", state: "Maharashtra" },
  { name: "Aarav Sharma", city: "Bengaluru", state: "Karnataka" },
  { name: "Nisha Rawat", city: "Dehradun", state: "Uttarakhand" },
  { name: "Meera Joshi", city: "Pune", state: "Maharashtra" },
  { name: "Rohan Kapoor", city: "Chandigarh", state: "Punjab" },
  { name: "Ananya Iyer", city: "Chennai", state: "Tamil Nadu" },
  { name: "Isha Verma", city: "Jaipur", state: "Rajasthan" },
  { name: "Vikramaditya Rao", city: "Hyderabad", state: "Telangana" },
  { name: "Simran Kaur", city: "Amritsar", state: "Punjab" },
  { name: "Tanmay Deshmukh", city: "Nagpur", state: "Maharashtra" },
  { name: "Sneha Kulkarni", city: "Pune", state: "Maharashtra" },
  { name: "Aditya Banerjee", city: "Kolkata", state: "West Bengal" },
  { name: "Raghav Varma", city: "Lucknow", state: "Uttar Pradesh" },
  { name: "Siddharth Nair", city: "Kochi", state: "Kerala" },
  { name: "Neha Chawla", city: "Gurgaon", state: "Haryana" },
  { name: "Aayushi Gupta", city: "Indore", state: "Madhya Pradesh" },
  { name: "Harshvardhan Reddy", city: "Hyderabad", state: "Telangana" },
  { name: "Deepa Subramanian", city: "Bengaluru", state: "Karnataka" },
  { name: "Kriti Saxena", city: "Bhopal", state: "Madhya Pradesh" },
  { name: "Manish Joshi", city: "Shimla", state: "Himachal Pradesh" },
  { name: "Swati Hegde", city: "Mangaluru", state: "Karnataka" },
  { name: "Shreya Sen", city: "Kolkata", state: "West Bengal" },
  { name: "Tarun Bhatia", city: "Delhi NCR", state: "Delhi" },
  { name: "Divya Menon", city: "Thiruvananthapuram", state: "Kerala" },
  { name: "Rahul Pillai", city: "Coimbatore", state: "Tamil Nadu" },
  { name: "Namrata Shinde", city: "Mumbai", state: "Maharashtra" },
  { name: "Abhinav Jha", city: "Patna", state: "Bihar" },
  { name: "Priyanka Das", city: "Guwahati", state: "Assam" },
  { name: "Kavita Bisht", city: "Nainital", state: "Uttarakhand" },
  { name: "Varun Kaushik", city: "Ghaziabad", state: "Uttar Pradesh" },
  { name: "Ankita Roy", city: "Ranchi", state: "Jharkhand" },
  { name: "Naveen Choudhury", city: "Bhubaneswar", state: "Odisha" },
  { name: "Arjun Nambiar", city: "Kozhikode", state: "Kerala" },
  { name: "Pooja Hegde", city: "Mysuru", state: "Karnataka" },
  { name: "Kunal Chauhan", city: "Chandigarh", state: "Punjab" },
  { name: "Tanvi Bhatt", city: "Vadodara", state: "Gujarat" },
  { name: "Chetan Rathore", city: "Jodhpur", state: "Rajasthan" },
  { name: "Meghna Mukherjee", city: "Kolkata", state: "West Bengal" },
  { name: "Nikhil Solanki", city: "Surat", state: "Gujarat" },
  { name: "Yashvardhan Gill", city: "Ludhiana", state: "Punjab" },
  { name: "Sunita Grewal", city: "Jalandhar", state: "Punjab" },
  { name: "Kartik Balakrishnan", city: "Chennai", state: "Tamil Nadu" },
  { name: "Preeti Thakur", city: "Solan", state: "Himachal Pradesh" },
  { name: "Vivek Chatterjee", city: "Siliguri", state: "West Bengal" },
  { name: "Ruchi Pandey", city: "Gorakhpur", state: "Uttar Pradesh" },
  { name: "Mayank Trivedi", city: "Rajkot", state: "Gujarat" },
  { name: "Pallavi Shukla", city: "Gwalior", state: "Madhya Pradesh" },
  { name: "Riya Shenoy", city: "Udupi", state: "Karnataka" },
  { name: "Aniket Somani", city: "Udaipur", state: "Rajasthan" },
  { name: "Vandana Yadav", city: "Agra", state: "Uttar Pradesh" },
  { name: "Sandeep Warrier", city: "Thrissur", state: "Kerala" },
  { name: "Shilpa Mohanty", city: "Rourkela", state: "Odisha" },
  { name: "Saurabh Mishra", city: "Prayagraj", state: "Uttar Pradesh" },
  { name: "Rashmi Kothari", city: "Bikaner", state: "Rajasthan" },
  { name: "Sumit Bharadwaj", city: "Haridwar", state: "Uttarakhand" },
  { name: "Komal Barman", city: "Dibrugarh", state: "Assam" },
  { name: "Vijay Ranganathan", city: "Madurai", state: "Tamil Nadu" },
  { name: "Shalini Dixit", city: "Bareilly", state: "Uttar Pradesh" },
  { name: "Rajesh Singhania", city: "Raipur", state: "Chhattisgarh" },
  { name: "Sonali Patra", city: "Bhubaneswar", state: "Odisha" },
  { name: "Suman Sengupta", city: "Howrah", state: "West Bengal" },
  { name: "Aarti Vishwakarma", city: "Jabalpur", state: "Madhya Pradesh" },
  { name: "Tushar Naik", city: "Panaji", state: "Goa" },
  { name: "Sakshi Talwar", city: "Rohtak", state: "Haryana" },
  { name: "Harish Venkat", city: "Visakhapatnam", state: "Andhra Pradesh" },
  { name: "Nidhi Bhatnagar", city: "Meerut", state: "Uttar Pradesh" },
  { name: "Pranav Sundaram", city: "Salem", state: "Tamil Nadu" },
  { name: "Bhavna Mahajan", city: "Jammu", state: "Jammu & Kashmir" },
  { name: "Rishabh Goel", city: "Moradabad", state: "Uttar Pradesh" },
  { name: "Payal Somani", city: "Ajmer", state: "Rajasthan" },
  { name: "Chirag Doshi", city: "Jamnagar", state: "Gujarat" },
  { name: "Jyoti Dogra", city: "Dharamshala", state: "Himachal Pradesh" },
  { name: "Akshay Bhosle", city: "Satara", state: "Maharashtra" },
  { name: "Shivani Negi", city: "Rishikesh", state: "Uttarakhand" },
  { name: "Vishal Murthy", city: "Belagavi", state: "Karnataka" },
  { name: "Smriti Goswami", city: "Shillong", state: "Meghalaya" },
  { name: "Manisha Kadam", city: "Thane", state: "Maharashtra" },
  { name: "Sunny Lobo", city: "Margao", state: "Goa" },
  { name: "Swarnalata Jena", city: "Puri", state: "Odisha" },
  { name: "Aman Bindra", city: "Hoshiarpur", state: "Punjab" },
  { name: "Gayatri Swaminathan", city: "Tiruchirappalli", state: "Tamil Nadu" },
  { name: "Mohit Sangwan", city: "Hisar", state: "Haryana" },
  { name: "Kasturi Sarma", city: "Tezpur", state: "Assam" },
  { name: "Amit Bais", city: "Bilaspur", state: "Chhattisgarh" },
  { name: "Rohini Kulkarni", city: "Solapur", state: "Maharashtra" },
  { name: "Vikas Dhillon", city: "Bathinda", state: "Punjab" },
  { name: "Aparna Namboodiri", city: "Kollam", state: "Kerala" },
  { name: "Madhavi Latha", city: "Vijayawada", state: "Andhra Pradesh" },
  { name: "Hemant Rawal", city: "Ujjain", state: "Madhya Pradesh" },
  { name: "Nandini Ghosh", city: "Durgapur", state: "West Bengal" },
  { name: "Suresh Konduru", city: "Tirupati", state: "Andhra Pradesh" },
  { name: "Vasudha Iyengar", city: "Bengaluru", state: "Karnataka" },
  { name: "Lalit Mathur", city: "Alwar", state: "Rajasthan" },
];

function hashSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function parseKmNumber(distStr: string): number {
  if (!distStr) return 5;
  const lower = distStr.toLowerCase().trim();
  if (lower.includes("half") || lower.includes("21.1")) return 21.0975;
  if (lower.includes("full") || (lower.includes("marathon") && !lower.includes("half"))) return 42.195;
  const match = distStr.match(/([0-9]+(?:\.[0-9]+)?)/);
  if (match && match[1]) {
    const val = parseFloat(match[1]);
    if (!Number.isNaN(val) && val > 0) return val;
  }
  return 5;
}

export function getEventBibPrefix(eventSlug: string, eventTitle = ""): string {
  const s = eventSlug.toLowerCase();
  if (s.includes("cancer")) return "NCAD";
  if (s.includes("air-force") || s.includes("iaf")) return "IAF";
  if (s.includes("monsoon") || s.includes("mountain")) return "MMM";
  if (s.includes("himalayan") || s.includes("winter")) return "HWS";
  if (s.includes("endurance")) return "IER";
  if (s.includes("independence")) return "IDR";
  if (s.includes("spring") || s.includes("valley")) return "SVD";
  if (s.includes("holi")) return "HCVR";
  if (s.includes("new-year") || s.includes("night-miles")) return "NYNM";
  
  const words = eventTitle.replace(/[^a-zA-Z\s]/g, "").trim().split(/\s+/);
  if (words.length >= 2) {
    return words.map((w) => w[0].toUpperCase()).join("").slice(0, 4);
  }
  return "RU";
}

export function isDummyEvent(slug: string): boolean {
  const s = slug.toLowerCase();
  return !s.includes("cancer") && !s.includes("air-force") && !s.includes("iaf");
}

export function generateClientDummyLeaderboard(
  eventSlug: string,
  eventTitle: string,
  distance: string,
  count = 60
): LeaderboardEntry[] {
  const km = parseKmNumber(distance);
  const seed = hashSeed(`${eventSlug}-${distance}`);
  const prefix = getEventBibPrefix(eventSlug, eventTitle);
  const cleanCode = distance.replace(/[^a-zA-Z0-9.]/g, "").toUpperCase() || "5K";

  const rosterCopy = [...DIVERSE_INDIAN_RUNNERS];
  const shuffled: typeof DIVERSE_INDIAN_RUNNERS = [];
  let currentSeed = seed;

  while (rosterCopy.length > 0 && shuffled.length < count) {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    const rndIndex = Math.floor((currentSeed / 233280) * rosterCopy.length);
    shuffled.push(rosterCopy.splice(rndIndex, 1)[0]);
  }

  let basePace = 220;
  if (km <= 2) basePace = 195;
  else if (km <= 3) basePace = 210;
  else if (km <= 5) basePace = 225;
  else if (km <= 10) basePace = 240;
  else if (km <= 15) basePace = 260;
  else if (km <= 21.1) basePace = 270;
  else if (km <= 25) basePace = 285;
  else basePace = 295;

  let currentFinishTime = Math.round(km * (basePace + (seed % 10)));

  return shuffled.map((runner, idx) => {
    if (idx > 0) {
      const stepSeed = (seed + idx * 37) % 100;
      const gapSec = idx < 5 ? 4 + (stepSeed % 8) : idx < 20 ? 7 + (stepSeed % 16) : 12 + (stepSeed % 28);
      currentFinishTime += gapSec;
    }

    const bibNum = 101 + idx;
    const bibNumber = `${prefix}-${cleanCode}-${String(bibNum).padStart(3, "0")}`;

    return {
      rank: idx + 1,
      runnerName: runner.name,
      city: runner.city,
      state: runner.state,
      distance,
      finishTimeSeconds: currentFinishTime,
      bibNumber,
      status: "Verified",
      isPadded: true,
      userId: `dummy-${eventSlug}-${idx}`,
      clerkId: null,
    };
  });
}

export function generateClientDummyRoster(
  eventSlug: string,
  eventTitle: string,
  distance: string,
  count = 75
): ParticipantEntry[] {
  const km = parseKmNumber(distance);
  const seed = hashSeed(`${eventSlug}-${distance}-roster`);
  const prefix = getEventBibPrefix(eventSlug, eventTitle);
  const cleanCode = distance.replace(/[^a-zA-Z0-9.]/g, "").toUpperCase() || "5K";

  const rosterCopy = [...DIVERSE_INDIAN_RUNNERS];
  const shuffled: typeof DIVERSE_INDIAN_RUNNERS = [];
  let currentSeed = seed;

  while (rosterCopy.length > 0 && shuffled.length < count) {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    const rndIndex = Math.floor((currentSeed / 233280) * rosterCopy.length);
    shuffled.push(rosterCopy.splice(rndIndex, 1)[0]);
  }

  return shuffled.map((runner, idx) => {
    const bibNum = 1001 + idx;
    const bibNumber = `${prefix}-${cleanCode}-${bibNum}`;
    const paceSpread = 230 + ((seed + idx * 13) % 90);
    const finishTimeSeconds = Math.round(km * paceSpread);

    return {
      rosterNumber: idx + 1,
      runnerName: runner.name,
      city: runner.city,
      state: runner.state,
      distance,
      bibNumber,
      status: "Verified Finisher",
      proofStatus: "APPROVED",
      registrationStatus: "CONFIRMED",
      registeredAt: new Date(Date.now() - (idx + 1) * 3600000 * 4).toISOString(),
      finishTimeSeconds,
      userId: `dummy-roster-${eventSlug}-${idx}`,
      clerkId: null,
    };
  });
}

