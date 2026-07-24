"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  BookOpen, Box, ChevronRight, Menu, PackageCheck, Search, ShieldCheck,
  ShoppingCart, Sparkles, Star, Truck, UserRound, Wrench, X
} from "lucide-react";
import "./styles.css";

type Product = {
  id: string;
  name: string;
  price: number;
  unit: string;
  badge: string;
  image: string;
  category: string;
  rating: number;
  reviews: number;
};

const categories = [
  ["Floor Systems", "Epoxy, polyaspartic & urethane", "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=500&q=80"],
  ["Concrete Prep", "Grinders, blasters & tooling", "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=500&q=80"],
  ["Coatings", "Primers, topcoats & clear seals", "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=500&q=80"],
  ["Decorative Flakes", "Quartz, vinyl & metallics", "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=500&q=80"],
  ["Equipment", "Mixers, pumps & sprayers", "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=500&q=80"],
  ["Tools & Accessories", "Application tools & safety gear", "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=500&q=80"],
] as const;

const products: Product[] = [
  { id: "solids-kit", name: "NEP 100% Solids Epoxy Clear Coating Kit", price: 299, unit: "kit", badge: "Best Seller", image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=600&q=80", category: "Coatings", rating: 4.9, reviews: 128 },
  { id: "flake-domino", name: "Decorative Flake Blend Domino (1/4\")", price: 89, unit: "bag", badge: "Most Popular", image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=600&q=80", category: "Decorative Flakes", rating: 4.8, reviews: 96 },
  { id: "topcoat", name: "Polyaspartic Topcoat Fast Set, Low VOC", price: 249, unit: "kit", badge: "Top Rated", image: "https://images.unsplash.com/photo-1598300053650-b3546ea7d673?auto=format&fit=crop&w=600&q=80", category: "Coatings", rating: 4.9, reviews: 74 },
  { id: "sprayer", name: "Graco X7 Airless Sprayer Package", price: 1299, unit: "each", badge: "Contractor Pick", image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80", category: "Equipment", rating: 4.7, reviews: 61 },
];

const systems = ["Warehouse & Storage", "Garage & Residential", "Retail & Commercial", "Food & Beverage", "Outdoor & Specialty"];

export default function NationalEpoxyProsPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [quoteMessage, setQuoteMessage] = useState("");
  const [advisorMessage, setAdvisorMessage] = useState("");
  const [compare, setCompare] = useState<string[]>([]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? products.filter((p) => `${p.name} ${p.category}`.toLowerCase().includes(q)) : products;
  }, [search]);

  const cartCount = Object.values(cart).reduce((sum, count) => sum + count, 0);

  function submitQuote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") || "");
    if (!email.includes("@")) {
      setQuoteMessage("Enter a valid email address so we can prepare your quote.");
      return;
    }
    setQuoteMessage("Quote request received. A project specialist will follow up shortly.");
    event.currentTarget.reset();
  }

  function submitAdvisor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const project = String(data.get("project") || "garage floor");
    const environment = String(data.get("environment") || "residential");
    setAdvisorMessage(`Recommended for your ${project}: diamond-grind preparation, moisture-tolerant primer, 100% solids epoxy base coat, decorative flake broadcast, and UV-stable polyaspartic topcoat for ${environment} conditions. Final selection must be verified for job-site conditions and manufacturer requirements.`);
  }

  function addToCart(id: string) {
    setCart((current) => ({ ...current, [id]: (current[id] || 0) + 1 }));
  }

  function toggleCompare(id: string) {
    setCompare((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 4 ? [...current, id] : current);
  }

  return (
    <main className="nep-shell">
      <header className="nep-header">
        <a href="#top" className="nep-logo" aria-label="National Epoxy Pros home">
          <span className="nep-mark">N</span>
          <span><strong>NATIONAL<br />EPOXY PROS</strong><small>FLOORS. BUILT NATIONWIDE.</small></span>
        </a>
        <form className="nep-search" onSubmit={(e) => e.preventDefault()}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products, systems, equipment, and more..." aria-label="Search products" />
          <button aria-label="Run product search"><Search size={20} /></button>
        </form>
        <nav className="nep-utility" aria-label="Utility navigation">
          <a href="#quote"><PackageCheck size={18} />Quick Order</a>
          <a href="#projects"><Box size={18} />Track Order</a>
          <a href="#training"><BookOpen size={18} />Resources</a>
          <a href="#account"><UserRound size={18} />Sign In</a>
          <a className="gold-button small" href="#quote">Get a Free Quote</a>
        </nav>
        <button className="nep-mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="Toggle navigation">{menuOpen ? <X /> : <Menu />}</button>
      </header>

      <nav className={`nep-category-nav ${menuOpen ? "open" : ""}`} aria-label="Product navigation">
        <a href="#categories"><Menu size={17} /> Shop All Categories</a>
        {categories.slice(0, 5).map(([name]) => <a href={`#${name.toLowerCase().replaceAll(" ", "-")}`} key={name}>{name}</a>)}
        <a href="#training">Training</a><a href="#brands">Brands</a><a className="clearance" href="#clearance">Clearance</a>
        <a href="#cart" className="cart-link"><ShoppingCart size={18} /> My Cart <b>{cartCount}</b></a>
      </nav>

      <section className="nep-hero" id="top">
        <div className="nep-hero-copy">
          <h1>The Products.<br />The Intelligence.<br />The Advantage.</h1>
          <h2>Everything You Need to Build Better.</h2>
          <p>Premium epoxy systems, expert-recommended products, and AI-powered tools that help contractors deliver floors that last.</p>
          <div className="nep-actions"><a href="#products" className="gold-button"><ShoppingCart size={18} />Shop Best Sellers</a><a href="#systems" className="outline-button">Explore Floor Systems</a></div>
        </div>
        <div className="nep-trust-row">
          <span><PackageCheck />ORDER BY 2PM CST<small>Ships Today</small></span>
          <span><Truck />NATIONWIDE DELIVERY<small>Fast & Reliable</small></span>
          <span><UserRound />EXPERT SUPPORT<small>Real People. Real Help.</small></span>
          <span><ShieldCheck />PREMIUM QUALITY<small>Products You Can Trust</small></span>
        </div>
      </section>

      <aside className="nep-quote-card" id="quote">
        <h2><Sparkles /> Get Your Free Quote</h2><p>Fast. Easy. No Obligation.</p>
        <form onSubmit={submitQuote} noValidate>
          <select name="work" aria-label="What are you working on?" required><option value="">What are you working on?</option><option>New floor installation</option><option>Floor restoration</option><option>Contractor supply order</option></select>
          <select name="type" aria-label="Project type" required><option value="">Project Type</option><option>Garage & Residential</option><option>Warehouse & Storage</option><option>Retail & Commercial</option></select>
          <input name="squareFootage" inputMode="numeric" placeholder="Square Footage" aria-label="Square footage" required />
          <input name="email" type="email" placeholder="Email Address" aria-label="Email address" required />
          <button className="gold-button" type="submit">Get My Quote <ChevronRight size={17} /></button>
        </form>
        <small>🔒 Secure. Private. Never shared.</small>
        {quoteMessage && <p className="form-message" role="status">{quoteMessage}</p>}
      </aside>

      <section className="nep-main-grid">
        <div>
          <section id="categories" className="nep-section">
            <div className="section-heading"><h2>Shop by Category</h2><a href="#products">View all categories →</a></div>
            <div className="category-grid">{categories.map(([name, description, image]) => <a className="category-card" id={name.toLowerCase().replaceAll(" ", "-")} href="#products" key={name}><img src={image} alt="" /><span><strong>{name}</strong><small>{description}</small></span></a>)}</div>
          </section>

          <section id="products" className="nep-section">
            <div className="section-heading"><h2>Top Selling Products</h2><span>{filteredProducts.length} products</span></div>
            <div className="product-grid">{filteredProducts.map((product) => <article className="product-card" key={product.id}>
              <span className="product-badge">{product.badge}</span><img src={product.image} alt={product.name} />
              <h3>{product.name}</h3><div className="rating"><Star fill="currentColor" size={15} /> {product.rating} <small>({product.reviews})</small></div>
              <p className="price">${product.price.toLocaleString()} <small>/ {product.unit}</small></p>
              <button onClick={() => addToCart(product.id)} className="gold-button">Add to Cart</button>
              <label className="compare-check"><input type="checkbox" checked={compare.includes(product.id)} onChange={() => toggleCompare(product.id)} /> Compare</label>
            </article>)}</div>
          </section>

          <section className="nep-section package-section"><div className="section-heading"><h2>Equipment Packages</h2><a href="#quote">View all packages →</a></div><div className="package-grid">{[
            ["Starter Contractor Package", "$2,450", "Everything you need to get started."],
            ["Pro Production Package", "$4,995", "Built for productivity and performance."],
            ["Industrial Complete Package", "$8,750", "All-in-one. Professional grade."],
          ].map(([name, price, copy]) => <article key={name}><Wrench /><h3>{name}</h3><p>{copy}</p><strong>{price}</strong><a href="#quote" className="gold-button">Request Package</a></article>)}</div></section>

          <section className="nep-section compare-section" id="compare"><div className="section-heading"><h2>Compare Products</h2><span>{compare.length}/4 selected</span></div><div className="compare-grid">{compare.length ? compare.map((id) => { const p = products.find((item) => item.id === id)!; return <article key={id}><img src={p.image} alt="" /><strong>{p.name}</strong><span>${p.price}</span><small>Professional system component</small></article>; }) : <p>Select up to four products above to compare price, cure time, finish, UV stability, chemical resistance and recommended environment.</p>}</div></section>
        </div>

        <aside className="nep-sidebar">
          <section className="side-card advisor-card"><h2>AI Product Advisor <span>Beta</span></h2><p>Get personalized product recommendations in seconds.</p><form onSubmit={submitAdvisor}><input name="project" placeholder="What type of project?" required /><input name="environment" placeholder="What's the environment like?" required /><input name="timeline" placeholder="What's your timeline?" /><button className="gold-button">Start Recommendation</button></form>{advisorMessage && <p className="advisor-result" role="status">{advisorMessage}</p>}</section>
          <section className="side-card" id="projects"><div className="section-heading"><h2>My Projects</h2><a href="#projects">View all →</a></div><strong>Westfield Distribution Center</strong><p>42,750 sq ft • Active</p><div className="project-price">Est. Total <b>$24,870.00</b></div><progress max="100" value="60">60%</progress><small>Demonstration project data</small></section>
          <section className="side-card" id="systems"><div className="section-heading"><h2>Shop by System</h2></div>{systems.map((system) => <a className="system-link" href="#products" key={system}><span><strong>{system}</strong><small>Purpose-built flooring systems</small></span><ChevronRight /></a>)}</section>
          <section className="side-card" id="training"><div className="section-heading"><h2>Training & Resources</h2></div><h3>Hands-on Training. Real Results.</h3><ul><li>In-person training</li><li>Online courses</li><li>Certification programs</li><li>Product guides & data sheets</li></ul><a href="#training" className="gold-button">Explore Training</a></section>
          <section className="support-card"><strong>Need Help? Call Our Experts.</strong><a href="tel:+18883767976">(888) epoxy-pro</a><small>Mon–Fri: 7am–7pm CST</small><a className="gold-button" href="tel:+18883767976">Call Now</a></section>
        </aside>
      </section>

      <section className="nep-proof-strip">{[["15+ Years", "Industry Experience"], ["25,000+", "Contractors Served"], ["Premium Products", "Tested & Proven"], ["Expert Support", "Real People. Real Help."], ["100% Satisfaction", "Quality Commitment"], ["Secure Checkout", "Shop with Confidence"]].map(([title, copy]) => <span key={title}><ShieldCheck /><strong>{title}</strong><small>{copy}</small></span>)}</section>

      <footer className="nep-footer"><div className="nep-logo footer-logo"><span className="nep-mark">N</span><span><strong>NATIONAL<br />EPOXY PROS</strong><small>FLOORS. BUILT NATIONWIDE.</small></span></div><div><h3>Quick Links</h3><a href="#top">Home</a><a href="#systems">Floor Systems</a><a href="#products">Coatings</a><a href="#training">Training</a></div><div><h3>Resources</h3><a href="#training">Product Guides</a><a href="#training">Tech Data Sheets</a><a href="#training">Case Studies</a><a href="#quote">Financing</a></div><div><h3>Customer Service</h3><a href="tel:+18883767976">(888) epoxy-pro</a><a href="mailto:support@nationalepoxypros.com">support@nationalepoxypros.com</a><a href="#terms">Terms & Warranty</a></div><div><h3>Follow Us</h3><p>4.9 ★★★★★</p><small>Demonstration review indicator</small></div></footer>
    </main>
  );
}
