const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://runnerup.in';

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SportsOrganization',
  name: 'RunnerUp',
  alternateName: [
    'RunnerUp India',
    'RunnerUp Virtual Marathon & Running Events India',
    'RunnerUp Virtual Races India',
    'RunnerUp Online Marathon Platform',
  ],
  url: SITE_URL,
  logo: `${SITE_URL}/logo-mark.svg`,
  image: `${SITE_URL}/og-image.png`,
  description:
    "India's leading GPS-verified virtual running and online marathon platform. Offering 1.5K, 3K, 5K, 10K, 21K Half Marathon, and ultra distance challenges. Runners earn authentic heavy metal 3D finisher medals, DRI-FIT performance t-shirts, and instant QR-verified digital certificates with 100% free doorstep delivery nationwide.",
  slogan: 'Run Anywhere. Your Pace. Your Proof.',
  sport: [
    'Running',
    'Marathon',
    'Half Marathon',
    '5K Virtual Run',
    '10K Virtual Run',
    '21K Virtual Marathon',
    'Trail Running',
    'Virtual Cycling Challenge',
    'Fitness Walking Challenge',
  ],
  knowsAbout: [
    'Virtual Marathons in India',
    'Virtual Running Events India 2026',
    '5K, 10K & 21K Half Marathon Virtual Races',
    'GPS Running Proof Verification (Strava, Garmin, Nike Run Club)',
    'Finisher Medals and Dri-Fit Running T-shirts',
    'Online Running Challenges & Fitness Contests',
    'Marathon Timing Certificates with QR Code',
    'Indian Running Community and National Leaderboards',
    'Virtual Runs for Beginners, Kids, and Families',
  ],
  sameAs: [
    'https://instagram.com/runnerupofficial',
    'https://facebook.com/runnerupofficial',
    'https://twitter.com/runnerup',
    'https://wa.me/917518418960',
  ],
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'IN',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: 'runnerupofficial@gmail.com',
    telephone: '+91-7518418960',
    areaServed: 'IN',
    availableLanguage: ['English', 'Hindi'],
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'RunnerUp',
  alternateName: 'RunnerUp - Virtual Running Events & Marathons India 2026',
  url: SITE_URL,
  description:
    'Join India’s top virtual running events, marathons, 5K, 10K, and 21K races. Run anywhere across India with Strava or Garmin, submit GPS tracking proof, and receive authentic heavy 3D metal medals, t-shirts, and verified digital certificates with free delivery.',
  inLanguage: 'en-IN',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/events?search={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

const homeFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is a virtual run / virtual marathon and how does RunnerUp work in India?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A virtual run or online marathon allows you to participate from any location across India—outdoors on roads/trails or indoors on a treadmill—at your own convenient pace and schedule. Register for any RunnerUp challenge, complete your chosen distance (1.5 km, 3 km, 5 km, 10 km, or 21 km Half Marathon) using any GPS tracking app (Strava, Garmin, Nike Run Club, Apple Fitness, Google Fit), and upload your activity screenshot on your runner dashboard. Once verified by our arbiters, your official verifiable E-Certificate is unlocked instantly and your physical heavy metal finisher medal and running kit are dispatched to your doorstep with free delivery.',
      },
    },
    {
      '@type': 'Question',
      name: 'What distances and running categories are available in RunnerUp virtual events?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We offer comprehensive distance categories for all fitness levels: 1.5 km and 3 km (Starter & Kids), 5 km / 5K (Fun Run & Beginners), 10 km / 10K (Endurance Challenge), and 21 km / 21K (Half Marathon), as well as Virtual Cycling and Walking challenges. Every category participant receives the full finisher rewards package.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do I get a real metal finisher medal, t-shirt, and certificate with my registration?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! Every finisher who uploads valid activity proof receives an authentic, heavy die-cast 3D embossed metal finisher medal, premium DRI-FIT event t-shirt, and official verifiable E-Certificate with QR verification. Physical kits are dispatched via express tracked courier with zero delivery charges across all 19,000+ Indian pincodes.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which GPS running apps and smartwatches are accepted for race verification?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We accept all standard GPS running apps and fitness trackers including Strava, Garmin Connect, Nike Run Club (NRC), Adidas Running, Apple Watch / Apple Fitness, Samsung Health, Google Fit, Coros, and Suunto. Treadmill runs are also accepted by sharing a clear photo of the treadmill console showing elapsed time and distance.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can beginners, kids, women, and families join RunnerUp virtual events?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, our virtual running events are beginner-friendly and open to everyone—including first-time joggers, kids, women runners, corporate teams, and families. You can complete your distance by running, jogging, or brisk walking at your own comfortable pace.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can runners from Delhi, Mumbai, Bengaluru, Pune, and other Indian cities participate?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! RunnerUp welcomes runners from all states and union territories in India—including Delhi NCR, Mumbai, Bengaluru, Pune, Hyderabad, Chennai, Kolkata, Ahmedabad, Jaipur, Chandigarh, Lucknow, Kochi, and tier-2/tier-3 cities. We deliver medals to all 19,000+ Indian pincodes with free express shipping.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I check upcoming virtual marathon events and race dates for 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can explore our upcoming virtual running events calendar on the RunnerUp Events page. We host monthly and seasonal virtual challenges with live registration, instant bib allocation, and national leaderboard rankings.',
      },
    },
  ],
};

export function StructuredData() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeFaqSchema) }}
      />
    </>
  );
}

