"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Search,
  SlidersHorizontal,
  Mail,
  Building,
  MapPin,
  Users,
  Eye,
  Check,
  Send,
  Download,
  Database,
  Sparkles,
  RefreshCw,
  Building2,
  Trash2,
} from "lucide-react";

export interface Prospect {
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

const SEED_PROSPECTS: Prospect[] = [
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

export default function ProspectingClient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [sizeFilter, setSizeFilter] = useState<string>("all");
  const [locationSearch, setLocationFilter] = useState("");
  const [keywordSearch, setKeywordSearch] = useState("");
  const [sortBy, setSortBy] = useState<"aiScore" | "name" | "company">("aiScore");

  const [revealedEmails, setRevealedEmails] = useState<Record<string, boolean>>({});
  const [crmSaved, setCrmSaved] = useState<Record<string, boolean>>({});
  const [sequenceSaved, setSequenceSaved] = useState<Record<string, boolean>>({});

  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Prospect[]>(SEED_PROSPECTS);

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/prospecting/search?q=${encodeURIComponent(searchTerm)}&industry=${industryFilter}&size=${sizeFilter}&location=${encodeURIComponent(locationSearch)}&keywords=${encodeURIComponent(keywordSearch)}`
      );
      if (response.ok) {
        const data = await response.json();
        setResults(data.prospects || SEED_PROSPECTS);
      } else {
        setResults(SEED_PROSPECTS);
      }
    } catch {
      setResults(SEED_PROSPECTS);
    } finally {
      setIsSearching(false);
    }
  };

  const handleReset = () => {
    setSearchTerm("");
    setIndustryFilter("all");
    setSizeFilter("all");
    setLocationFilter("");
    setKeywordSearch("");
    setSortBy("aiScore");
    setResults(SEED_PROSPECTS);
  };

  const filteredAndSortedProspects = useMemo(() => {
    let temp = [...results];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      temp = temp.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          p.company.toLowerCase().includes(q)
      );
    }

    if (industryFilter && industryFilter !== "all") {
      temp = temp.filter((p) => p.industry === industryFilter);
    }

    if (sizeFilter && sizeFilter !== "all") {
      temp = temp.filter((p) => p.companySize === sizeFilter);
    }

    if (locationSearch) {
      const loc = locationSearch.toLowerCase();
      temp = temp.filter((p) => p.location.toLowerCase().includes(loc));
    }

    if (keywordSearch) {
      const kw = keywordSearch.toLowerCase();
      temp = temp.filter((p) =>
        p.keywords.some((k) => k.toLowerCase().includes(kw))
      );
    }

    temp.sort((a, b) => {
      if (sortBy === "aiScore") return b.aiScore - a.aiScore;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "company") return a.company.localeCompare(b.company);
      return 0;
    });

    return temp;
  }, [results, searchTerm, industryFilter, sizeFilter, locationSearch, keywordSearch, sortBy]);

  const toggleRevealEmail = (id: string) => {
    setRevealedEmails((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSaveCRM = (id: string) => {
    setCrmSaved((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAddSequence = (id: string) => {
    setSequenceSaved((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleBulkAddToSequence = () => {
    const nextSaved = { ...sequenceSaved };
    filteredAndSortedProspects.forEach((p) => {
      nextSaved[p.id] = true;
    });
    setSequenceSaved(nextSaved);
  };

  const handleExportCSV = () => {
    const headers = "Name,Title,Company,Industry,Company Size,Location,Email,Phone,AI Score,Keywords\n";
    const rows = filteredAndSortedProspects
      .map(
        (p) =>
          `"${p.name}","${p.title}","${p.company}","${p.industry}","${p.companySize}","${p.location}","${
            revealedEmails[p.id] ? p.email : "masked"
          }","${p.phone}",${p.aiScore},"${p.keywords.join("; ")}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `XAB_Prospects_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 80) return "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";
    return "text-amber-400 bg-amber-500/10 border-amber-500/20";
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-[#6366f1]" />
              <Badge variant="outline" className="bg-[#6366f1]/10 text-[#6366f1] border-[#6366f1]/20">
                PROSPECTING ENGINE
              </Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Lead & Contractor Prospecting</h1>
            <p className="text-sm text-neutral-400">
              Query high-value construction and floor finishing leads, powered by Apollo.io API and XAB Smart Matching.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
              onClick={handleExportCSV}
            >
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </Button>
            <Button
              className="bg-[#6366f1] text-white hover:bg-[#6366f1]/90"
              onClick={handleBulkAddToSequence}
            >
              <Send className="w-4 h-4 mr-2" /> Enroll All ({filteredAndSortedProspects.length})
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <Card className="lg:col-span-1 bg-white/[0.03] border-white/10 h-fit">
            <CardHeader className="p-4 border-b border-white/10 flex flex-row justify-between items-center">
              <CardTitle className="text-md font-semibold flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#6366f1]" /> Filters
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-neutral-400 hover:text-white text-xs h-7 px-2"
                onClick={handleReset}
              >
                Clear All
              </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-medium text-neutral-400">Industry</label>
                <Select value={industryFilter} onValueChange={(val) => setIndustryFilter(val)}>
                  <SelectTrigger className="w-full bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="All Industries" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-white/10 text-white">
                    <SelectItem value="all">All Industries</SelectItem>
                    <SelectItem value="Construction">Construction</SelectItem>
                    <SelectItem value="Flooring">Flooring</SelectItem>
                    <SelectItem value="Real Estate">Real Estate</SelectItem>
                    <SelectItem value="Contracting">Contracting</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-neutral-400">Company Size</label>
                <Select value={sizeFilter} onValueChange={(val) => setSizeFilter(val)}>
                  <SelectTrigger className="w-full bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="All Sizes" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-white/10 text-white">
                    <SelectItem value="all">All Sizes</SelectItem>
                    <SelectItem value="1-10">1-10 Employees</SelectItem>
                    <SelectItem value="11-50">11-50 Employees</SelectItem>
                    <SelectItem value="51-200">51-200 Employees</SelectItem>
                    <SelectItem value="200+">200+ Employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-neutral-400">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
                  <Input
                    placeholder="e.g. Dallas, TX"
                    className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-neutral-500"
                    value={locationSearch}
                    onChange={(e) => setLocationFilter(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-neutral-400">Keywords</label>
                <div className="relative">
                  <Database className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
                  <Input
                    placeholder="e.g. epoxy, alumni"
                    className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-neutral-500"
                    value={keywordSearch}
                    onChange={(e) => setKeywordSearch(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-3 space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/[0.02] p-4 rounded-xl border border-white/5">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Search name, job title, or company..."
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-neutral-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400 whitespace-nowrap">Sort:</span>
                  <Select
                    value={sortBy}
                    onValueChange={(val: "aiScore" | "name" | "company") => setSortBy(val)}
                  >
                    <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white text-xs h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-white/10 text-white">
                      <SelectItem value="aiScore">AI Score (Highest)</SelectItem>
                      <SelectItem value="name">Name A-Z</SelectItem>
                      <SelectItem value="company">Company A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="bg-[#6366f1] text-white hover:bg-[#6366f1]/90 h-9"
                  disabled={isSearching}
                  onClick={handleSearch}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isSearching ? "animate-spin" : ""}`} /> Query Apollo
                </Button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-400">
                Found <span className="font-semibold text-white">{filteredAndSortedProspects.length}</span> matching prospects
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAndSortedProspects.map((prospect) => (
                <Card
                  key={prospect.id}
                  className="bg-white/[0.02] border-white/5 hover:border-[#6366f1]/30 transition-all duration-200 overflow-hidden"
                >
                  <div className="p-5 flex flex-col justify-between h-full space-y-4">
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg text-white">{prospect.name}</h3>
                          <p className="text-xs text-neutral-400 mb-1">{prospect.title}</p>
                          <div className="flex items-center gap-1.5 text-xs text-neutral-300">
                            <Building2 className="w-3.5 h-3.5 text-neutral-500" />
                            <span>{prospect.company}</span>
                            <span className="text-neutral-600">•</span>
                            <span className="text-neutral-400">{prospect.companySize} emp</span>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={`font-semibold flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full ${getScoreColor(
                            prospect.aiScore
                          )}`}
                        >
                          <Sparkles className="w-3 h-3" /> Score {prospect.aiScore}
                        </Badge>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <Badge variant="secondary" className="bg-white/5 text-neutral-300 border-none text-[10px]">
                          {prospect.industry}
                        </Badge>
                        {prospect.keywords.slice(0, 3).map((kw) => (
                          <Badge
                            key={kw}
                            variant="outline"
                            className="text-[10px] text-neutral-400 border-white/5"
                          >
                            #{kw}
                          </Badge>
                        ))}
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/[0.03] space-y-2 text-xs">
                        <div className="flex items-center justify-between text-neutral-300">
                          <span className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-neutral-500" />
                            <span>
                              {revealedEmails[prospect.id]
                                ? prospect.email
                                : `${prospect.email.split("@")[0].substring(0, 3)}••••@${
                                    prospect.email.split("@")[1]
                                  }`}
                            </span>
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-[10px] text-[#6366f1] hover:text-[#6366f1]/80 hover:bg-[#6366f1]/10 gap-1"
                            onClick={() => toggleRevealEmail(prospect.id)}
                          >
                            <Eye className="w-3 h-3" />
                            {revealedEmails[prospect.id] ? "Hide" : "Reveal"}
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 text-neutral-300">
                          <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                          <span>{prospect.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className={`text-xs border-white/10 ${
                          crmSaved[prospect.id]
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-white/5 text-white hover:bg-white/10"
                        }`}
                        onClick={() => toggleSaveCRM(prospect.id)}
                      >
                        {crmSaved[prospect.id] ? (
                          <>
                            <Check className="w-3.5 h-3.5 mr-1" /> CRM Synced
                          </>
                        ) : (
                          "Save to CRM"
                        )}
                      </Button>
                      <Button
                        size="sm"
                        className={`text-xs text-white ${
                          sequenceSaved[prospect.id]
                            ? "bg-emerald-600 hover:bg-emerald-700"
                            : "bg-[#6366f1] hover:bg-[#6366f1]/90"
                        }`}
                        onClick={() => toggleAddSequence(prospect.id)}
                      >
                        {sequenceSaved[prospect.id] ? (
                          <>
                            <Check className="w-3.5 h-3.5 mr-1" /> Sequence Active
                          </>
                        ) : (
                          "Add to Sequence"
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
