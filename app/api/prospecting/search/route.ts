import { NextResponse } from "next/server";

export interface ApolloProspect {
  id: string;
  name: string;
  title: string;
  company: string;
  industry: "Construction" | "Flooring" | "Real Estate" | "Contracting";
  companySize: "1-10" | "11-50" | "51-200" | "200+";
  location: string;
  email: string;
  phone: string;
  aiScore: number;
  keywords: string[];
}

const SEED_DATA: ApolloProspect[] = [
  {
    id: "1",
    name: "Marcus Vance",
    title: "VP of Field Operations",
    company: "Apex Flooring Solutions",
    industry: "Flooring",
    companySize: "11-50",
    location: "Atlanta, GA",
    email: "marcus.vance@apexflooring.com",
    phone: "+1 (404) 555-0192",
    aiScore: 94,
    keywords: ["epoxy", "commercial", "project manager", "alumni"],
  },
  {
    id: "2",
    name: "Sarah Jenkins",
    title: "Senior Project Manager",
    company: "Precision Concrete & Epoxy",
    industry: "Contracting",
    companySize: "1-10",
    location: "Dallas, TX",
    email: "sjenkins@precisionconcrete.com",
    phone: "+1 (214) 555-8831",
    aiScore: 89,
    keywords: ["epoxy", "polished", "alumni", "dallas"],
  },
  {
    id: "3",
    name: "Robert Chen",
    title: "Director of Procurement",
    company: "Metro Commercial Builders",
    industry: "Construction",
    companySize: "51-200",
    location: "Chicago, IL",
    email: "r.chen@metrobuilders.org",
    phone: "+1 (312) 555-4022",
    aiScore: 85,
    keywords: ["procurement", "commercial", "estimator"],
  },
  {
    id: "4",
    name: "Amanda Ross",
    title: "Managing Partner",
    company: "Ross & Co. Real Estate",
    industry: "Real Estate",
    companySize: "11-50",
    location: "Miami, FL",
    email: "amanda@rossrealestate.com",
    phone: "+1 (305) 555-9011",
    aiScore: 91,
    keywords: ["development", "luxury", "alumni", "multifamily"],
  },
  {
    id: "5",
    name: "Thomas Miller",
    title: "General Manager",
    company: "Tri-State Epoxy Coatings",
    industry: "Flooring",
    companySize: "1-10",
    location: "Philadelphia, PA",
    email: "tmiller@tristateepoxy.net",
    phone: "+1 (215) 555-7162",
    aiScore: 97,
    keywords: ["epoxy", "polyaspartic", "warm-lead"],
  },
  {
    id: "6",
    name: "Elena Rostova",
    title: "VP of Asset Management",
    company: "Vanguard Realty Trust",
    industry: "Real Estate",
    companySize: "200+",
    location: "New York, NY",
    email: "e.rostova@vanguardrealty.com",
    phone: "+1 (212) 555-3091",
    aiScore: 78,
    keywords: ["asset manager", "portfolio", "real estate"],
  },
  {
    id: "7",
    name: "David Karr",
    title: "CEO & Founder",
    company: "Karr Flooring Contracting",
    industry: "Contracting",
    companySize: "11-50",
    location: "Denver, CO",
    email: "david@karrflooring.com",
    phone: "+1 (303) 555-0453",
    aiScore: 92,
    keywords: ["epoxy", "residential", "alumni"],
  },
  {
    id: "8",
    name: "Jameson O'Connor",
    title: "Chief Estimator",
    company: "Summit Structural Group",
    industry: "Construction",
    companySize: "51-200",
    location: "Seattle, WA",
    email: "joconnor@summitstructural.com",
    phone: "+1 (206) 555-1290",
    aiScore: 82,
    keywords: ["estimator", "concrete", "commercial"],
  },
  {
    id: "9",
    name: "Melissa Vance",
    title: "Regional Sales Director",
    company: "Pacific Coast Contracting",
    industry: "Contracting",
    companySize: "51-200",
    location: "Los Angeles, CA",
    email: "mvance@pacificcontracting.com",
    phone: "+1 (310) 555-6672",
    aiScore: 88,
    keywords: ["alumni", "coatings", "sales"],
  },
  {
    id: "10",
    name: "Frank Castillo",
    title: "Lead Epoxy Installer",
    company: "Castillo Custom Floors",
    industry: "Flooring",
    companySize: "1-10",
    location: "Phoenix, AZ",
    email: "frank@castillocustomfloors.com",
    phone: "+1 (602) 555-9121",
    aiScore: 95,
    keywords: ["epoxy", "polished", "residential"],
  },
  {
    id: "11",
    name: "Claire Beaumont",
    title: "Director of Development",
    company: "Beacon Hill Developers",
    industry: "Real Estate",
    companySize: "11-50",
    location: "Boston, MA",
    email: "c.beaumont@beaconhilldev.com",
    phone: "+1 (617) 555-8022",
    aiScore: 86,
    keywords: ["development", "luxury", "boston"],
  },
  {
    id: "12",
    name: "Derrick Ward",
    title: "Principal Architect",
    company: "Ward & Partners Architects",
    industry: "Construction",
    companySize: "11-50",
    location: "San Francisco, CA",
    email: "derrick@wardpartners.com",
    phone: "+1 (415) 555-4309",
    aiScore: 81,
    keywords: ["architect", "polished", "sustainability"],
  },
  {
    id: "13",
    name: "Grace Peterson",
    title: "Marketing Coordinator",
    company: "Horizon Homes & Realty",
    industry: "Real Estate",
    companySize: "1-10",
    location: "Austin, TX",
    email: "grace@horizonhomesrealty.com",
    phone: "+1 (512) 555-1123",
    aiScore: 73,
    keywords: ["residential", "marketing", "austin"],
  },
  {
    id: "14",
    name: "Victor Martinez",
    title: "Senior Superintendent",
    company: "Lone Star General Contractors",
    industry: "Contracting",
    companySize: "51-200",
    location: "Houston, TX",
    email: "v.martinez@lonestargc.net",
    phone: "+1 (713) 555-6677",
    aiScore: 90,
    keywords: ["superintendent", "industrial", "safety"],
  },
  {
    id: "15",
    name: "Samantha Wright",
    title: "Operations Director",
    company: "Elite Decorative Coatings",
    industry: "Flooring",
    companySize: "1-10",
    location: "Charlotte, NC",
    email: "samantha@elitecoatings.com",
    phone: "+1 (704) 555-0012",
    aiScore: 96,
    keywords: ["epoxy", "polyaspartic", "alumni", "charlotte"],
  },
  {
    id: "16",
    name: "Kurt Wagner",
    title: "General Contractor",
    company: "Wagner Construction Corp",
    industry: "Construction",
    companySize: "11-50",
    location: "Milwaukee, WI",
    email: "kurt@wagnerconstruction.com",
    phone: "+1 (414) 555-2244",
    aiScore: 84,
    keywords: ["remodel", "estimator", "alumni"],
  },
  {
    id: "17",
    name: "Danielle Carter",
    title: "Commercial Property Manager",
    company: "Carter Real Estate Holdings",
    industry: "Real Estate",
    companySize: "51-200",
    location: "Orlando, FL",
    email: "danielle@carterholding.com",
    phone: "+1 (407) 555-9080",
    aiScore: 80,
    keywords: ["property manager", "commercial", "retail"],
  },
  {
    id: "18",
    name: "Brad Sterling",
    title: "VP of Quality Control",
    company: "Sterling Industrial Floors",
    industry: "Flooring",
    companySize: "11-50",
    location: "Detroit, MI",
    email: "bsterling@sterlingindustrial.com",
    phone: "+1 (313) 555-1100",
    aiScore: 93,
    keywords: ["epoxy", "industrial", "warranty"],
  },
  {
    id: "19",
    name: "Nadia Malik",
    title: "Purchasing Estimator",
    company: "Pinnacle High-Rise Group",
    industry: "Construction",
    companySize: "200+",
    location: "Seattle, WA",
    email: "n.malik@pinnaclehighrise.com",
    phone: "+1 (206) 555-8844",
    aiScore: 83,
    keywords: ["estimator", "multifamily", "procurement"],
  },
  {
    id: "20",
    name: "Owen Campbell",
    title: "Director of Facilities",
    company: "Metro Contracting & Maintenance",
    industry: "Contracting",
    companySize: "51-200",
    location: "Nashville, TN",
    email: "owen.campbell@metrofac.com",
    phone: "+1 (615) 555-3399",
    aiScore: 87,
    keywords: ["facilities", "preventative", "safety"],
  },
];

interface ApolloResponsePerson {
  first_name: string;
  last_name: string;
  title: string;
  email: string;
  organization: {
    name: string;
  };
}

interface ApolloResponse {
  people?: ApolloResponsePerson[];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const industry = searchParams.get("industry") || "all";
    const size = searchParams.get("size") || "all";
    const location = searchParams.get("location") || "";
    const keywords = searchParams.get("keywords") || "";

    const apolloApiKey = process.env.APOLLO_API_KEY;

    if (apolloApiKey && apolloApiKey !== "7ZhslsSEloTb5NbwQMWX_g") {
      try {
        const apolloResponse = await fetch("https://api.apollo.io/v1/mixed_people/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
          body: JSON.stringify({
            api_key: apolloApiKey,
            q_keywords: q || keywords || "epoxy, flooring, contractor",
            person_locations: location ? [location] : undefined,
          }),
        });

        if (apolloResponse.ok) {
          const apolloData = (await apolloResponse.json()) as ApolloResponse;
          if (apolloData.people && apolloData.people.length > 0) {
            const parsedProspects: ApolloProspect[] = apolloData.people.map((person, idx) => ({
              id: `apollo-${idx}-${Date.now()}`,
              name: `${person.first_name || ""} ${person.last_name || ""}`.trim() || "Anonymous Prospect",
              title: person.title || "Contractor Partner",
              company: person.organization?.name || "Independent Specialist",
              industry: "Flooring",
              companySize: "11-50",
              location: location || "USA",
              email: person.email || "contact@unverified-apollo.com",
              phone: "+1 (555) 019-9988",
              aiScore: 90 - idx * 2,
              keywords: (q || keywords || "epoxy, flooring").split(",").map((k) => k.trim()),
            }));
            return NextResponse.json({ source: "apollo", prospects: parsedProspects });
          }
        }
      } catch (err) {
        console.error("Apollo API fetching error, falling back to seed data:", err);
      }
    }

    let filtered = [...SEED_DATA];

    if (q) {
      const lowerQ = q.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(lowerQ) ||
          p.title.toLowerCase().includes(lowerQ) ||
          p.company.toLowerCase().includes(lowerQ)
      );
    }

    if (industry !== "all") {
      filtered = filtered.filter((p) => p.industry === industry);
    }

    if (size !== "all") {
      filtered = filtered.filter((p) => p.companySize === size);
    }

    if (location) {
      const lowerLoc = location.toLowerCase();
      filtered = filtered.filter((p) => p.location.toLowerCase().includes(lowerLoc));
    }

    if (keywords) {
      const lowerKw = keywords.toLowerCase();
      filtered = filtered.filter((p) =>
        p.keywords.some((k) => k.toLowerCase().includes(lowerKw))
      );
    }

    return NextResponse.json({ source: "fallback_seed_data", prospects: filtered });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
