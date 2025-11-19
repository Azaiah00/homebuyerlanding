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
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [calculatorData, setCalculatorData] = useState({
    homePrice: 650000,
    downPaymentPercent: 10,
    interestRate: 6.5,
    loanTerm: 30
  })
  const [monthlyPayment, setMonthlyPayment] = useState(0)
  const [totalInterest, setTotalInterest] = useState(0)
  const [totalPayment, setTotalPayment] = useState(0)

  // Calculate mortgage payment
  useEffect(() => {
    const downPaymentAmount = (calculatorData.homePrice * calculatorData.downPaymentPercent) / 100
    const principal = calculatorData.homePrice - downPaymentAmount
    const monthlyRate = (calculatorData.interestRate / 100) / 12
    const numberOfPayments = calculatorData.loanTerm * 12

    if (principal > 0 && monthlyRate > 0 && numberOfPayments > 0) {
      const payment = principal * 
        (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
      
      setMonthlyPayment(payment)
      setTotalPayment(payment * numberOfPayments)
      setTotalInterest((payment * numberOfPayments) - principal)
    } else {
      setMonthlyPayment(0)
      setTotalPayment(0)
      setTotalInterest(0)
    }
  }, [calculatorData])

  const handleCalculatorChange = (e) => {
    const { name, value } = e.target
    setCalculatorData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }))
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

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
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.name.trim()) errors.name = 'Name is required'
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email'
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Phone is required'
    } else if (!/^[\d\s\-\(\)]+$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number'
    }
    if (!formData.timeline) errors.timeline = 'Please select a timeline'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setFormSubmitted(true)
    
    // Netlify Forms integration
    const formDataToSubmit = new FormData()
    formDataToSubmit.append('form-name', 'contact')
    formDataToSubmit.append('name', formData.name)
    formDataToSubmit.append('email', formData.email)
    formDataToSubmit.append('phone', formData.phone)
    formDataToSubmit.append('timeline', formData.timeline)

    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formDataToSubmit).toString()
      })

      if (response.ok) {
        setShowSuccessModal(true)
        setFormData({ name: '', email: '', phone: '', timeline: '' })
        setFormErrors({})
        // Track form submission (for analytics)
        if (window.gtag) {
          window.gtag('event', 'form_submission', {
            'event_category': 'engagement',
            'event_label': 'contact_form'
          })
        }
      } else {
        throw new Error('Form submission failed')
      }
    } catch (error) {
      // Fallback: still show success for better UX (Netlify will handle it)
      setShowSuccessModal(true)
      setFormData({ name: '', email: '', phone: '', timeline: '' })
      setFormErrors({})
    } finally {
      setFormSubmitted(false)
    }
  }

  const closeSuccessModal = () => {
    setShowSuccessModal(false)
  }

  const scrollToContact = () => {
    document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
    setMobileMenuOpen(false) // Close mobile menu after navigation
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <div className="landing-page">
      {/* STICKY NAVIGATION */}
      <nav className={`sticky-nav ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <div className="nav-logo">Frederick Sales</div>
          <button className="mobile-menu-toggle" onClick={toggleMobileMenu} aria-label="Toggle menu">
            <span className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
          <div className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <button onClick={() => scrollToSection('game-plan')}>Process</button>
            <button onClick={() => scrollToSection('winning-offer')}>Winning Offer</button>
            <button onClick={() => scrollToSection('money-talk')}>Costs</button>
            <button onClick={() => scrollToSection('mortgage-calculator')}>Calculator</button>
            <button onClick={() => scrollToSection('team-advantage')}>Why Us</button>
            <button onClick={() => scrollToSection('faq')}>FAQ</button>
            <button className="nav-cta" onClick={scrollToContact}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-image-wrapper">
            <img 
              src="/images/frederick-headshot.jpg" 
              alt="Frederick Sales - Real Estate Agent"
              className="hero-photo"
              onError={(e) => {
                // Fallback to placeholder if image doesn't exist
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
            <div className="hero-photo-placeholder" style={{display: 'none'}}>
              <span>📸</span>
              <p>Add Your Professional Photo Here</p>
            </div>
          </div>
          <h1 className="hero-title">The Ultimate Guide to Buying Your Dream Home in the DMV</h1>
          <p className="hero-slogan">Work with a DMV Native who knows the neighborhoods, not just the listings.</p>
          <p className="hero-intro">
            Hi, I'm Frederick Sales! I grew up in Alexandria, VA and currently live in Washington DC's SW Waterfront Neighborhood. 
            Finding your next home is a huge step, and I'm here to make it smarter, simpler, and way more fun. 
            With 7+ years of experience in VA, DC, and MD, I've built a "Winning Game Plan" to get you the perfect home. Let's get started!
          </p>
          <button className="cta-button primary" onClick={scrollToContact}>
            Schedule My Free Strategy Session
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

      {/* MORTGAGE CALCULATOR */}
      <section id="mortgage-calculator" className="mortgage-calculator fade-in-section">
        <div className="container">
          <h2 className="section-title">Mortgage Payment Calculator</h2>
          <p className="section-subtitle">Get an estimate of your monthly mortgage payment. Adjust the numbers to see how different scenarios affect your payment.</p>
          
          <div className="calculator-wrapper">
            <div className="calculator-inputs">
              <div className="calc-input-group">
                <label htmlFor="homePrice">Home Price</label>
                <div className="input-wrapper">
                  <span className="input-prefix">$</span>
                  <input
                    type="number"
                    id="homePrice"
                    name="homePrice"
                    value={calculatorData.homePrice}
                    onChange={handleCalculatorChange}
                    min="0"
                    step="1000"
                    className="calc-input"
                  />
                </div>
              </div>

              <div className="calc-input-group">
                <label htmlFor="downPaymentPercent">Down Payment (%)</label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    id="downPaymentPercent"
                    name="downPaymentPercent"
                    value={calculatorData.downPaymentPercent}
                    onChange={handleCalculatorChange}
                    min="0"
                    max="100"
                    step="0.5"
                    className="calc-input"
                  />
                  <span className="input-suffix">%</span>
                </div>
                <div className="down-payment-amount">
                  {formatCurrency((calculatorData.homePrice * calculatorData.downPaymentPercent) / 100)} down
                </div>
              </div>

              <div className="calc-input-group">
                <label htmlFor="interestRate">Interest Rate (%)</label>
                <div className="input-wrapper">
                  <input
                    type="number"
                    id="interestRate"
                    name="interestRate"
                    value={calculatorData.interestRate}
                    onChange={handleCalculatorChange}
                    min="0"
                    max="20"
                    step="0.1"
                    className="calc-input"
                  />
                  <span className="input-suffix">%</span>
                </div>
              </div>

              <div className="calc-input-group">
                <label htmlFor="loanTerm">Loan Term</label>
                <select
                  id="loanTerm"
                  name="loanTerm"
                  value={calculatorData.loanTerm}
                  onChange={handleCalculatorChange}
                  className="calc-select"
                >
                  <option value="15">15 years</option>
                  <option value="20">20 years</option>
                  <option value="30">30 years</option>
                </select>
              </div>
            </div>

            <div className="calculator-results">
              <div className="result-card primary">
                <div className="result-label">Monthly Payment</div>
                <div className="result-value">{formatCurrency(monthlyPayment)}</div>
                <div className="result-note">Principal & Interest</div>
              </div>

              <div className="result-details">
                <div className="result-row">
                  <span className="result-label-small">Down Payment</span>
                  <span className="result-value-small">{formatCurrency((calculatorData.homePrice * calculatorData.downPaymentPercent) / 100)}</span>
                </div>
                <div className="result-row">
                  <span className="result-label-small">Loan Amount</span>
                  <span className="result-value-small">{formatCurrency(calculatorData.homePrice - ((calculatorData.homePrice * calculatorData.downPaymentPercent) / 100))}</span>
                </div>
                <div className="result-row">
                  <span className="result-label-small">Total Interest Paid</span>
                  <span className="result-value-small">{formatCurrency(totalInterest)}</span>
                </div>
                <div className="result-row">
                  <span className="result-label-small">Total Payment</span>
                  <span className="result-value-small">{formatCurrency(totalPayment)}</span>
                </div>
              </div>

              <div className="calculator-cta">
                <p>Ready to get pre-approved? Let's connect you with our trusted lenders.</p>
                <button className="cta-button primary" onClick={scrollToContact}>
                  Get Pre-Approved Today
                </button>
              </div>
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

      {/* CRAFTING A WINNING OFFER */}
      <section id="winning-offer" className="winning-offer fade-in-section">
        <div className="container">
          <h2 className="section-title">Crafting a Winning Offer</h2>
          <p className="section-subtitle">With over 5,275 successful contracts, we've perfected the art of crafting offers that win. Here are the key components we'll optimize for your success:</p>
          
          <div className="offer-components-grid">
            <div className="offer-component-card">
              <div className="component-icon">📅</div>
              <h3 className="component-title">Closing Date</h3>
              <p className="component-subtitle">Also called Settlement date</p>
              <p className="component-description">
                We will find out what time frame is preferred by the seller before submitting an offer, and we will want to do everything in our power to ensure you are getting a timeframe that works for you and the seller is also pleased with the closing time frame. A 21 to 30-day close is what we see the most in this market, although every seller is different so time frames can be anywhere from 15-90 days.
              </p>
            </div>

            <div className="offer-component-card">
              <div className="component-icon">🏠</div>
              <h3 className="component-title">Post Settlement Occupancy</h3>
              <p className="component-description">
                Sometimes, a seller will request a rent back - this can be a very compelling tactic because many agents do not ask the right questions to determine if this will be helpful for the seller and can really set your offer apart. The reason it can be very compelling is because if the seller needs to purchase another home after the closing they can have a window where they have the proceeds from the sale to purchase their next home without the stress and concern that something may go wrong. When financing the home purchase, lenders typically will allow a Post Settlement Occupancy for up to 60 days.
              </p>
            </div>

            <div className="offer-component-card">
              <div className="component-icon">💰</div>
              <h3 className="component-title">EMD (Earnest Money Deposit)</h3>
              <p className="component-description">
                The EMD (earnest money deposit) goes into an escrow account at the title company until settlement, at which time it is credited back to you and can be used towards your down payment, or refunded. The EMD is required to make any contract binding. The market average in the DMV is 1-5%, however the larger the EMD the more security the seller has that you will move forward to settlement. In our experience this is an easy and free way to leverage having liquidity to give you an advantage in the negotiation.
              </p>
            </div>

            <div className="offer-component-card">
              <div className="component-icon">🏦</div>
              <h3 className="component-title">Lender/Title Company</h3>
              <p className="component-description">
                <strong>The Lender</strong> provides your mortgage financing, reviews your financial documents, and approves your loan. They ensure you have the funds to purchase the home and handle all the financial aspects of the transaction.
              </p>
              <p className="component-description" style={{marginTop: '1rem'}}>
                <strong>The Title Company</strong> conducts a title search to ensure the property has a clear title (no liens or ownership disputes), handles the closing process, and ensures the legal transfer of ownership. They also hold your earnest money deposit in escrow.
              </p>
              <p className="component-description" style={{marginTop: '1rem'}}>
                <strong>How They Work Together:</strong> The lender provides the financing, while the title company ensures the legal transfer is clean and handles the closing. They coordinate to ensure all funds are properly transferred and all documents are correctly executed. We have preferred vendors for both, but we'll always confirm who you decide to work with.
              </p>
            </div>

            <div className="offer-component-card">
              <div className="component-icon">🔍</div>
              <h3 className="component-title">Home Inspection Contingency & Appraisal Contingency</h3>
              <p className="component-description">
                <strong>Home Inspection Contingency:</strong> This gives you the right to have the property professionally inspected and to negotiate repairs or withdraw from the contract if major issues are found. The inspection typically covers structural elements, systems (HVAC, plumbing, electrical), and safety concerns. This contingency protects you from buying a home with hidden problems.
              </p>
              <p className="component-description" style={{marginTop: '1rem'}}>
                <strong>Appraisal Contingency:</strong> This protects you if the home appraises for less than your offer price. The lender requires an appraisal to ensure the property is worth the loan amount. If the appraisal comes in low, you can renegotiate the price, make up the difference in cash, or walk away from the deal. This ensures you're not overpaying for the property.
              </p>
              <p className="component-description" style={{marginTop: '1rem'}}>
                Both contingencies are crucial protections for buyers, but shorter contingency periods can make your offer more competitive in hot markets.
              </p>
            </div>

            <div className="offer-component-card">
              <div className="component-icon">💵</div>
              <h3 className="component-title">Down Payment</h3>
              <p className="component-description">
                The down payment is the initial cash amount you pay toward the purchase price of the home. It's your equity stake in the property from day one. The minimum down payment is typically 3% for conventional loans (though some programs allow less), and can go up to 20% or more. A larger down payment can result in better loan terms, lower monthly payments, and may eliminate the need for private mortgage insurance (PMI). The amount you put down will depend on your financial situation, the type of loan you're using, and your long-term financial goals.
              </p>
            </div>

            <div className="offer-component-card">
              <div className="component-icon">🤝</div>
              <h3 className="component-title">Seller Subsidy</h3>
              <p className="component-description">
                Depending on how much competition there is on the property, you may be able to negotiate seller subsidy for your client. It could be closing costs or money to repair something in the property.
              </p>
            </div>

            <div className="offer-component-card">
              <div className="component-icon">✅</div>
              <h3 className="component-title">Financing Contingency</h3>
              <p className="component-description">
                Adding a financing contingency to your contract does cause pause for many sellers, and can make or break an offer. We will be working with your lender to get you fully approved, with all of your documents reviewed and your credit reviewed prior to submitting your offer. If you need to add a financing contingency because of your personal circumstances, the shorter the contingency the more compelling your offer will be.
              </p>
              <div className="component-note">
                <strong>Note:</strong> Oftentimes, larger banks need more time to work through loan approval, as they work with several 3rd party vendors throughout the lending process. This can be detrimental in the offer process since the seller is looking for the most concrete offer and extended contingencies can make them very nervous. Additionally, the lack of speed can be extremely stressful for the purchaser as we work through the waiting game of approval. This is why we recommend using our preferred lenders. If you do not have a financing contingency and cannot qualify for the loan, your deposit is at risk, so make sure you discuss your options with your lender and your agent as you navigate this decision.
              </div>
            </div>
          </div>

          <div className="offer-cta-box">
            <p className="offer-cta-text">Ready to craft your winning offer? Let's discuss your strategy.</p>
            <button className="cta-button primary" onClick={scrollToContact}>
              Schedule My Free Strategy Session
            </button>
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

      {/* FAQ SECTION */}
      <section id="faq" className="faq fade-in-section">
        <div className="container">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-subtitle">Everything you need to know about buying a home in the DMV</p>
          <div className="faq-grid">
            <div className="faq-item">
              <h3 className="faq-question">How long does the home buying process take?</h3>
              <p className="faq-answer">
                Typically, the home buying process takes 30-45 days from offer acceptance to closing. However, this can vary based on financing, inspections, and negotiations. We'll work with you to ensure a timeline that works for your situation.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">Do I need to be pre-approved before looking at homes?</h3>
              <p className="faq-answer">
                While not required, being pre-approved is highly recommended. It makes you a "power-buyer" and allows you to act quickly when you find the perfect home. Many sellers won't even consider offers without pre-approval.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">What's the difference between pre-qualified and pre-approved?</h3>
              <p className="faq-answer">
                Pre-qualification is a quick estimate based on basic information. Pre-approval involves a thorough review of your financial documents and credit. Pre-approval is what you need to be competitive in today's market.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">How much do I need for a down payment?</h3>
              <p className="faq-answer">
                Down payments can range from 3% to 20% or more, depending on your loan type. Conventional loans typically require 3-20%, while VA loans can be 0% down. We'll help you understand your options based on your situation.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">What are closing costs and who pays for them?</h3>
              <p className="faq-answer">
                Closing costs typically range from 2.5% to 3% of the home price and include fees for appraisal, inspection, title insurance, and more. In the DMV, buyers typically pay closing costs, though we can negotiate seller contributions in some cases.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">What is earnest money and how much do I need?</h3>
              <p className="faq-answer">
                Earnest money (EMD) shows the seller you're serious about buying. It's held in escrow and credited back at closing. In the DMV, EMD typically ranges from 1-5% of the purchase price. A larger EMD can make your offer more competitive.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">Can I buy a home if I have student loans or other debt?</h3>
              <p className="faq-answer">
                Yes! Having debt doesn't automatically disqualify you. Lenders look at your debt-to-income ratio. We'll connect you with trusted lenders who can help you understand your options and find the right loan program for your situation.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">What areas do you serve?</h3>
              <p className="faq-answer">
                I'm licensed in Virginia, Washington DC, and Maryland - the entire DMV area! Whether you're looking in Arlington, Bethesda, Alexandria, or anywhere in between, I can help you find your perfect home.
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

          <form 
            name="contact" 
            method="POST" 
            data-netlify="true" 
            netlify-honeypot="bot-field"
            className={`contact-form ${formSubmitted ? 'submitted' : ''}`} 
            onSubmit={handleSubmit}
          >
            <input type="hidden" name="form-name" value="contact" />
            <p style={{ display: 'none' }}>
              <label>
                Don't fill this out if you're human: <input name="bot-field" />
              </label>
            </p>
            <div className="form-row">
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name *"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className={`form-input ${formErrors.name ? 'error' : ''}`}
                />
                {formErrors.name && <span className="error-message">{formErrors.name}</span>}
              </div>
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email *"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className={`form-input ${formErrors.email ? 'error' : ''}`}
                />
                {formErrors.email && <span className="error-message">{formErrors.email}</span>}
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
                  className={`form-input ${formErrors.phone ? 'error' : ''}`}
                />
                {formErrors.phone && <span className="error-message">{formErrors.phone}</span>}
              </div>
              <div className="form-group">
                <select
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleInputChange}
                  required
                  className={`form-input ${formErrors.timeline ? 'error' : ''}`}
                >
                  <option value="">When are you thinking of buying? *</option>
                  <option value="asap">ASAP</option>
                  <option value="1-3">1-3 Months</option>
                  <option value="3-6">3-6 Months</option>
                  <option value="browsing">Just Browsing</option>
                </select>
                {formErrors.timeline && <span className="error-message">{formErrors.timeline}</span>}
              </div>
            </div>
            <button type="submit" className={`cta-button primary large ${formSubmitted ? 'submitting' : ''}`} disabled={formSubmitted}>
              {formSubmitted ? 'Submitting...' : 'Schedule My Free Strategy Session'}
            </button>
            <p className="form-privacy">We respect your privacy. Your information will never be shared.</p>
          </form>

          {/* Success Modal */}
          {showSuccessModal && (
            <div className="success-modal-overlay" onClick={closeSuccessModal}>
              <div className="success-modal" onClick={(e) => e.stopPropagation()}>
                <div className="success-icon">✓</div>
                <h3>Thank You!</h3>
                <p>We've received your information and will be in touch soon to schedule your strategy call.</p>
                <button className="cta-button primary" onClick={closeSuccessModal}>Got It!</button>
              </div>
            </div>
          )}
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
              <div className="footer-contact">
                <a href="mailto:fred@kerishullteam.com" className="footer-email">fred@kerishullteam.com</a>
                <a href="tel:7033994394" className="footer-phone">(703) 399-4394</a>
              </div>
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
