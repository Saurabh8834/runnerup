const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://runnerup.in';

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SportsOrganization',
  name: 'RunnerUp',
  alternateName: ['RunnerUp India', 'RunnerUp Virtual Races'],
  url: SITE_URL,
  logo: `${SITE_URL}/logo-mark.svg`,
  image: `${SITE_URL}/og-image.png`,
  description:
    "India's premier GPS-verified virtual running events platform. Register with UPI, run anywhere with Strava or Garmin, earn heavy metal finisher medals, DRI-FIT t-shirts, and instant verified E-certificates.",
  sport: ['Running', 'Marathon', 'Trail Running', 'Cycling', 'Walking'],
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
  alternateName: 'RunnerUp - Virtual Running Events India',
  url: SITE_URL,
  description:
    'Join India’s top virtual running challenges, marathons, 5K, 10K, and 21K races. Run anywhere across India, submit GPS tracking proof, and receive authentic metal medals and digital certificates.',
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
      name: 'What is virtual running and how does RunnerUp work in India?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Virtual running allows you to run anywhere at your own pace and schedule. Register for any RunnerUp challenge, complete your chosen distance (1.5K, 5K, 10K, 21K) using any GPS tracking app (Strava, Garmin, Nike Run Club, Google Fit), and upload your activity screenshot on your runner dashboard. Once verified by our race arbiters, your official E-Certificate is generated instantly and your heavy physical finisher medal is dispatched to your doorstep.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which GPS running apps and smartwatches are accepted for race proof?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We accept all popular GPS running apps and smartwatches including Strava, Garmin Connect, Nike Run Club (NRC), Adidas Running, Apple Fitness / Apple Watch, Samsung Health, Google Fit, Coros, and Suunto. Outdoor GPS runs as well as treadmill console photos showing elapsed time and distance are accepted.',
      },
    },
    {
      '@type': 'Question',
      name: 'When and how will I receive my finisher medal and running kit?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Every finisher with approved GPS proof receives an authentic, heavy metal embossed finisher medal and premium race rewards. Kits are dispatched via tracked courier partners (Delhivery, India Post, Shiprocket) within 7-10 business days of result verification with SMS and tracking updates.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I get my official digital running certificate?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Your official certificate is generated automatically as soon as your run proof is approved. Each certificate features a verifiable QR code, unique certificate serial number, verified finish time, pace, and ranking.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can runners and walkers from any Indian city participate?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! RunnerUp welcomes runners, joggers, and walkers from all 28 states and union territories in India—including Mumbai, Delhi NCR, Bengaluru, Pune, Hyderabad, Chennai, Kolkata, Jaipur, Lucknow, and tier-2/tier-3 cities. We deliver medals to all 19,000+ Indian pincodes.',
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

