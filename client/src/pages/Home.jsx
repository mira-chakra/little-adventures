import { Link } from 'react-router';
import { ArrowRight, ArrowUpRight, Clock3, Compass, Heart, Sparkles, WandSparkles } from 'lucide-react';
export default function Home(){return <>
  <section className="hero"><div className="shell hero-grid"><div className="hero-copy">
    <div className="eyebrow">✳ YOUR NEXT MEMORY IS CLOSER THAN YOU THINK</div>
    <h1>Small plans.<br/><em>Big memories.</em></h1>
    <p>Stuck wondering what to do? Discover little adventures around Lebanon that fit your mood, your budget, and your free time.</p>
    <div className="hero-actions"><Link className="button button-primary" to="/explore">Explore adventures <ArrowUpRight size={18}/></Link><Link className="button button-quiet" to="/pick-for-me">Pick one for me <ArrowRight size={18}/></Link></div>
    <div className="hero-caption"><span className="avatar-stack">✺ ✳ ♡</span><span>Made for students, daydreamers and weekend explorers.</span></div>
  </div><div className="hero-art" role="img" aria-label="An illustrated Lebanese mountain landscape with warm sunshine"><div className="sun"/><div className="mountain mountain-back"/><div className="mountain mountain-front"/><div className="land land-back"/><div className="land land-front"/><div className="trip-stamp"><span>✦</span> ADVENTURE IS OUT THERE</div><div className="art-badge">MADE FOR<br/><strong>LEBANON</strong> ♥</div></div></div></section>
  <section className="shell below"><div className="below-lead"><span className="eyebrow">THE LITTLE ADVENTURES WAY</span><h2>Less scrolling.<br/><em>More exploring.</em></h2><p>Good plans don't need a big budget. Just the right idea.</p></div><div className="feature-grid">
    <div className="feature"><span className="feature-icon"><WandSparkles size={22}/></span><h3>Find your vibe</h3><p>Discover activities that match how you want to feel.</p></div>
    <div className="feature"><span className="feature-icon"><Clock3 size={22}/></span><h3>Fit your schedule</h3><p>From a quick coffee break to a whole day out.</p></div>
    <div className="feature"><span className="feature-icon"><Heart size={22}/></span><h3>Save for later</h3><p>Collect the adventures you want to try next.</p></div>
  </div></section>
  <section className="banner-section"><div className="shell banner-inner"><div><span className="eyebrow">CAN'T DECIDE?</span><h2>Let the little moments find you.</h2><p>Tell us your budget, mood and available time. Our simple matching rules do the rest.</p></div><Link className="button button-light" to="/pick-for-me">Surprise me <Sparkles size={18}/></Link></div></section>
  <section className="shell trust-note"><Compass size={17}/> Local suggestions for Lebanon · Costs are estimates, not live prices · Check access and conditions before visiting.</section>
</>}
