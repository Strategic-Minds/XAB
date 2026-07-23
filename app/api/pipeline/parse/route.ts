import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

const NICHE_DEFAULTS: Record<string, {
  services: string[];
  colors: [string, string];
  style: string;
  tagline: string;
  hero: string;
  subtext: string;
  cta: string;
}> = {
  epoxy_contractor: {
    services: ['Garage Floor Epoxy', 'Commercial Floors', 'Decorative Concrete', 'Metallic Epoxy', 'Flake Systems'],
    colors: ['#1a1a2e', '#f59e0b'],
    style: 'industrial',
    tagline: 'Transform Your Floors. Elevate Your Space.',
    hero: 'Premium Epoxy Flooring Solutions',
    subtext: "West Palm Beach's most trusted epoxy flooring contractor. Professional installation, lifetime results.",
    cta: 'Get a Free Quote',
  },
  concrete_contractor: {
    services: ['Stamped Concrete', 'Concrete Driveways', 'Patios & Walkways', 'Concrete Repair', 'Staining'],
    colors: ['#374151', '#10b981'],
    style: 'professional',
    tagline: 'Built to Last. Built to Impress.',
    hero: 'Expert Concrete Solutions',
    subtext: 'From driveways to decorative patios, we deliver lasting concrete results.',
    cta: 'Request an Estimate',
  },
  roofing: {
    services: ['Roof Replacement', 'Roof Repair', 'Flat Roofing', 'Shingle Roofing', 'Emergency Services'],
    colors: ['#1e3a5f', '#e74c3c'],
    style: 'professional',
    tagline: 'Protecting What Matters Most.',
    hero: 'Trusted Roofing Experts',
    subtext: 'Licensed, insured roofing contractors serving South Florida.',
    cta: 'Get a Free Inspection',
  },
  hvac: {
    services: ['AC Installation', 'AC Repair', 'Maintenance Plans', 'Duct Cleaning', 'Emergency Service'],
    colors: ['#0f4c81', '#00bcd4'],
    style: 'modern',
    tagline: 'Stay Cool. Stay Comfortable.',
    hero: 'South Florida HVAC Specialists',
    subtext: '24/7 air conditioning repair and installation services.',
    cta: 'Schedule Service',
  },
};

function detectNiche(command: string): string {
  const lower = command.toLowerCase();
  if (lower.includes('epoxy')) return 'epoxy_contractor';
  if (lower.includes('concrete')) return 'concrete_contractor';
  if (lower.includes('roof')) return 'roofing';
  if (lower.includes('hvac') || lower.includes('air conditioning') || lower.includes('ac')) return 'hvac';
  return 'epoxy_contractor';
}

function extractLocation(command: string): string {
  const patterns = [
    /in ([A-Z][a-zA-Z\s]+,?\s*[A-Z]{2})/i,
    /in ([A-Z][a-zA-Z\s]+ [A-Z][a-zA-Z]+)/i,
    /(?:for|near|serving) ([A-Z][a-zA-Z\s]+)/i,
  ];
  for (const p of patterns) {
    const m = command.match(p);
    if (m) return m[1].trim();
  }
  return 'South Florida';
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export async function POST(req: NextRequest) {
  try {
    const { command } = await req.json() as { command: string };
    if (!command) return NextResponse.json({ error: 'command is required' }, { status: 400 });

    const niche = detectNiche(command);
    const location = extractLocation(command);
    const defaults = NICHE_DEFAULTS[niche] ?? NICHE_DEFAULTS['epoxy_contractor'];

    // Use GPT-4o for richer extraction if key is available
    let parsed = {
      business_name: `${location} ${niche === 'epoxy_contractor' ? 'Epoxy' : 'Contractor'} Pros`,
      niche,
      location,
      slug: slugify(`${location}-${niche}`),
      tagline: defaults.tagline,
      primary_color: defaults.colors[0],
      secondary_color: defaults.colors[1],
      style: defaults.style,
      services: defaults.services,
      phone_placeholder: '(561) 555-0100',
      hero_headline: defaults.hero,
      hero_subtext: defaults.subtext.replace('West Palm Beach', location),
      cta_text: defaults.cta,
      image_prompt: `Professional ${niche.replace(/_/g, ' ')} business hero image for a contractor in ${location}. Show a before and after transformation of a high-end ${niche === 'epoxy_contractor' ? 'epoxy coated garage floor with metallic flakes, gleaming and polished' : 'concrete installation, pristine and professional'}. Modern composition, dramatic lighting, photorealistic quality. Dark background with gold accent lighting.`,
    };

    if (process.env.OPENAI_API_KEY) {
      const gptRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o',
          response_format: { type: 'json_object' },
          messages: [{
            role: 'system',
            content: 'You are a website brief generator. Given a plain text website request, extract and generate structured data. Return JSON with: business_name, niche, location, tagline, primary_color (hex), secondary_color (hex), style, services (array of 5), phone_placeholder, hero_headline, hero_subtext, cta_text, image_prompt. Be creative and industry-specific.'
          }, {
            role: 'user',
            content: command,
          }],
          max_tokens: 800,
        }),
      });
      if (gptRes.ok) {
        const gptData = await gptRes.json() as { choices: { message: { content: string } }[] };
        const gptParsed = JSON.parse(gptData.choices[0].message.content) as Partial<typeof parsed>;
        parsed = { ...parsed, ...gptParsed, slug: slugify(gptParsed.business_name ?? parsed.business_name) };
      }
    }

    return NextResponse.json({ success: true, parsed });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Parse failed';
    console.error('[pipeline/parse]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
