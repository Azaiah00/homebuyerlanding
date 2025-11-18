import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    timeline: ''
  })
  const [isScrolled, setIsScrolled] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }

    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    // Observe all sections
    const sections = document.querySelectorAll('.fade-in-section')
    sections.forEach((section) => observer.observe(section))

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      observer.disconnect()
    }
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setFormSubmitted(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setFormSubmitted(true)
    // In production, this would submit to a backend
    setTimeout(() => {
      alert('Thank you! We\'ll be in touch soon to schedule your strategy call.')
      setFormData({ name: '', email: '', phone: '', timeline: '' })
      setFormSubmitted(false)
    }, 300)
  }

  const scrollToContact = () => {
    document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="landing-page">
      {/* STICKY NAVIGATION */}
      <nav className={`sticky-nav ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <div className="nav-logo">Frederick Sales</div>
          <div className="nav-links">
            <button onClick={() => scrollToSection('game-plan')}>Process</button>
            <button onClick={() => scrollToSection('money-talk')}>Costs</button>
            <button onClick={() => scrollToSection('team-advantage')}>Why Us</button>
            <button className="nav-cta" onClick={scrollToContact}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">The Ultimate Guide to Buying Your Dream Home in the DMV</h1>
          <h2 className="hero-subtitle">From "Just Looking" to "Just Moved In" with Frederick Sales & the KS Team</h2>
          <p className="hero-intro">
            Hi, I'm Frederick Sales! Finding your next home is a huge step, and I'm here to make it smarter, simpler, and way more fun. 
            With 7+ years of experience in VA, DC, and MD, I've built a "Winning Game Plan" to get you the perfect home. Let's get started!
          </p>
          <button className="cta-button primary" onClick={scrollToContact}>
            Let's Find My Home!
          </button>
        </div>
      </section>

      {/* SECTION 1: WINNING GAME PLAN */}
      <section id="game-plan" className="game-plan fade-in-section">
        <div className="container">
          <h2 className="section-title">Our 4-Step Winning Game Plan</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3 className="step-title">Get "Power-Buyer" Ready</h3>
              <p className="step-description">
                It all starts here. We'll connect you with our trusted local lenders to get you fully Pre-Approved 
                (not just Pre-Qualified!). This makes you a 'power-buyer' and sets you up to win from day one.
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3 className="step-title">The "Priority Access" Hunt</h3>
              <p className="step-description">
                This is the fun part! We'll set you up with real-time MLS alerts (not 24-hour-delayed Zillow data) 
                AND give you access to our exclusive 'Priority Access' list of off-market homes you can't find online.
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3 className="step-title">Craft the Winning Offer</h3>
              <p className="step-description">
                Found 'the one'? Now we put our experience to work. The KS Team has negotiated over 5,275 contracts. 
                We know how to craft an offer that wins, even in a tough market.
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h3 className="step-title">Close, Get Your Keys & Party!</h3>
              <p className="step-description">
                We're with you every step of the way, from contract to closing. And to celebrate? 
                We'll even help throw your housewarming party! Welcome to the family.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: MONEY TALK */}
      <section id="money-talk" className="money-talk fade-in-section">
        <div className="container">
          <h2 className="section-title">Money Talk (No Jargon, We Promise)</h2>
          <p className="section-subtitle">No surprises. Here's what to expect financially.</p>
          <div className="money-grid">
            <div className="money-card">
              <h3 className="money-card-title">Pre-Qualified vs. Pre-Approved</h3>
              <div className="comparison-item">
                <div className="comparison-badge">7 Mins</div>
                <h4>Pre-Qualified</h4>
                <p>A quick, 7-minute chat to understand your comfort zone. Free, no-obligation.</p>
              </div>
              <div className="comparison-item featured">
                <div className="comparison-badge">The Real Deal</div>
                <h4>Pre-Approved</h4>
                <p>This is the one you want. It's a thorough qualification with document verification. This makes you a serious buyer and lets us act fast.</p>
              </div>
            </div>
            <div className="money-card">
              <h3 className="money-card-title">What to Budget For</h3>
              <p className="money-card-subtitle">Here's a simple breakdown of your potential costs. We'll walk you through every line item.</p>
              <ul className="cost-list">
                <li>
                  <span className="cost-icon">💰</span>
                  <div>
                    <strong>Down Payment</strong>
                    <span>3%+</span>
                  </div>
                </li>
                <li>
                  <span className="cost-icon">💵</span>
                  <div>
                    <strong>Earnest Money Deposit (EMD)</strong>
                    <span>3%+</span>
                  </div>
                </li>
                <li>
                  <span className="cost-icon">🔍</span>
                  <div>
                    <strong>Home Inspection</strong>
                    <span>~$350 - $750</span>
                  </div>
                </li>
                <li>
                  <span className="cost-icon">📊</span>
                  <div>
                    <strong>Appraisal</strong>
                    <span>~$400 - $600+</span>
                  </div>
                </li>
                <li>
                  <span className="cost-icon">📝</span>
                  <div>
                    <strong>Closing Costs</strong>
                    <span>~2.5% - 3%</span>
                  </div>
                </li>
                <li>
                  <span className="cost-icon">✅</span>
                  <div>
                    <strong>Buyer's Commission</strong>
                    <span>Typically paid by the Seller</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: PRIORITY ACCESS */}
      <section className="priority-access fade-in-section">
        <div className="container">
          <h2 className="section-title">Your Secret Weapon: The Priority Access Program</h2>
          <div className="priority-content">
            <div className="priority-visual">
              <div className="house-icon locked">🏠</div>
              <div className="arrow">→</div>
              <div className="house-icon unlocked">🏠</div>
            </div>
            <p className="priority-text">
              Why limit your search to what's on Zillow? As a KS Team client, you get exclusive access to homes NOT listed 
              anywhere online. We find these 'hidden gems' through our massive seller database, agent referral network, and 
              targeted marketing. You get first dibs!
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 4: WEALTH BUILDING */}
      <section className="wealth-building fade-in-section">
        <div className="container">
          <h2 className="section-title">This Isn't Just a Home. It's Your Biggest Wealth-Builder.</h2>
          <p className="section-subtitle">See how you earn appreciation on the total value of your home, not just your down payment.</p>
          <div className="wealth-example">
            <h3 className="wealth-example-title">The Power of "Leveraged Returns"</h3>
            <div className="wealth-scenario">
              <div className="scenario-item">
                <span className="scenario-label">House Price:</span>
                <span className="scenario-value">$650,000</span>
              </div>
              <div className="scenario-item">
                <span className="scenario-label">Your 10% Down Payment:</span>
                <span className="scenario-value">$65,000</span>
              </div>
            </div>
            <div className="roi-cards">
              <div className="roi-card">
                <div className="roi-period">IN 5 YEARS</div>
                <div className="roi-amount">$120,250</div>
                <div className="roi-label">Total Net Gain</div>
                <div className="roi-percentage">ROI: 185%</div>
              </div>
              <div className="roi-card">
                <div className="roi-period">IN 10 YEARS</div>
                <div className="roi-amount">$261,300</div>
                <div className="roi-label">Total Net Gain</div>
                <div className="roi-percentage">ROI: 402%</div>
              </div>
              <div className="roi-card">
                <div className="roi-period">IN 20 YEARS</div>
                <div className="roi-amount">$620,100</div>
                <div className="roi-label">Total Net Gain</div>
                <div className="roi-percentage">ROI: 954%</div>
              </div>
            </div>
            <p className="wealth-takeaway">
              This is why more wealth is created in real estate than any other sector. You're not just paying a mortgage—you're paying yourself.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 5: KS TEAM ADVANTAGE */}
      <section id="team-advantage" className="team-advantage fade-in-section">
        <div className="container">
          <h2 className="section-title">Why Work With Me & The KS Team?</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">5,275+</div>
              <div className="stat-label">Families Helped</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">$5 BILLION+</div>
              <div className="stat-label">In Team Sales</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">TOP TEAM</div>
              <div className="stat-label">In the DMV Since 2008</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">OFF-MARKET</div>
              <div className="stat-label">Priority Access Program</div>
            </div>
          </div>
          <p className="team-text">
            You're not just hiring me, Frederick Sales; you're hiring the entire KS Team. We have the track record, 
            the resources, and the market intel to ensure you win.
          </p>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="testimonials fade-in-section">
        <div className="container">
          <h2 className="section-title">What Our Clients Say</h2>
          <p className="section-subtitle">Don't just take our word for it—hear from families we've helped find their dream homes.</p>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">
                "Frederick made our homebuying journey so smooth! His Priority Access program helped us find our perfect home before it even hit the market. We couldn't be happier!"
              </p>
              <div className="testimonial-author">
                <strong>Sarah & Mike Johnson</strong>
                <span>Arlington, VA</span>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">
                "The KS Team's negotiation skills are incredible. They saved us thousands and got us the home we wanted in a competitive market. Highly recommend!"
              </p>
              <div className="testimonial-author">
                <strong>David Chen</strong>
                <span>Bethesda, MD</span>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">
                "From pre-approval to closing, Frederick and his team were with us every step. The housewarming party was the cherry on top! We're part of the family now."
              </p>
              <div className="testimonial-author">
                <strong>Jennifer Martinez</strong>
                <span>Washington, DC</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: WELCOME TO THE FAMILY */}
      <section className="family fade-in-section">
        <div className="container">
          <h2 className="section-title">Our Relationship Doesn't End at Closing</h2>
          <p className="section-subtitle">When you work with us, you become part of our real estate family.</p>
          <div className="family-grid">
            <div className="family-card">
              <div className="family-icon">🔧</div>
              <h3 className="family-title">Your Vendor Source</h3>
              <p className="family-description">
                Need a great plumber, painter, or contractor? Our trusted vendor list is now your list.
              </p>
            </div>
            <div className="family-card">
              <div className="family-icon">🎉</div>
              <h3 className="family-title">Fun Client Events</h3>
              <p className="family-description">
                You're invited! Get exclusive invitations to our annual Nats game, fall family fun day, brunch with Santa, and more.
              </p>
            </div>
            <div className="family-card">
              <div className="family-icon">❤️</div>
              <h3 className="family-title">We Give Back Together</h3>
              <p className="family-description">
                We love the DMV. For every referral we receive, we donate $250 to charities like Habitat for Humanity, 
                St. Jude's, and Meals on Wheels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section id="contact-section" className="contact-cta">
        <div className="container">
          <h2 className="section-title">Ready to Start Your Home Search?</h2>
          <p className="cta-quote">"All we ask from you is your loyalty. In return, you get our 100% commitment and expertise."</p>
          <p className="section-subtitle">Let's set up a 15-minute, no-obligation buyer strategy call. No pressure, just a great conversation about your goals.</p>
          
          {/* Trust Badges */}
          <div className="trust-badges">
            <div className="trust-badge">
              <span className="badge-icon">✓</span>
              <span>Licensed in VA, DC & MD</span>
            </div>
            <div className="trust-badge">
              <span className="badge-icon">✓</span>
              <span>7+ Years Experience</span>
            </div>
            <div className="trust-badge">
              <span className="badge-icon">✓</span>
              <span>5,275+ Families Helped</span>
            </div>
          </div>

          <form className={`contact-form ${formSubmitted ? 'submitted' : ''}`} onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name *"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email *"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Your Phone *"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <select
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                >
                  <option value="">When are you thinking of buying? *</option>
                  <option value="asap">ASAP</option>
                  <option value="1-3">1-3 Months</option>
                  <option value="3-6">3-6 Months</option>
                  <option value="browsing">Just Browsing</option>
                </select>
              </div>
            </div>
            <button type="submit" className={`cta-button primary large ${formSubmitted ? 'submitting' : ''}`}>
              {formSubmitted ? '✓ Submitted!' : 'Schedule My Strategy Call!'}
            </button>
            <p className="form-privacy">We respect your privacy. Your information will never be shared.</p>
          </form>
        </div>
      </section>

      {/* FLOATING CTA BUTTON */}
      {isScrolled && (
        <button className="floating-cta" onClick={scrollToContact} aria-label="Get Started">
          <span>Get Started</span>
          <span className="floating-arrow">↑</span>
        </button>
      )}

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-info">
              <p className="footer-name">Frederick Sales | Realtor®</p>
              <p className="footer-license">Licensed in VA, DC, & MD</p>
            </div>
            <div className="footer-logos">
              <div className="logo-placeholder">eXp Realty</div>
              <div className="logo-placeholder">KS Team</div>
            </div>
            <p className="footer-eho">Equal Housing Opportunity</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
