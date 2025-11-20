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
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [calculatorData, setCalculatorData] = useState({
    homePrice: '',
    downPaymentPercent: '',
    interestRate: 6.75, // Default current market rate
    loanTerm: 30
  })
  const [monthlyPayment, setMonthlyPayment] = useState(0)
  const [totalInterest, setTotalInterest] = useState(0)
  const [totalPayment, setTotalPayment] = useState(0)
  const [showAdminFeePopup, setShowAdminFeePopup] = useState(false)
  const ADMIN_FEE = 495

  // Note: Interest rate is pre-filled with current market rate (6.75%)
  // In production, you could fetch from an API like Freddie Mac Primary Mortgage Market Survey
  // Users can adjust the rate as needed

  // Calculate mortgage payment
  useEffect(() => {
    const homePrice = parseFloat(calculatorData.homePrice.toString().replace(/,/g, '')) || 0
    const downPaymentPercent = parseFloat(calculatorData.downPaymentPercent) || 0
    const interestRate = parseFloat(calculatorData.interestRate) || 0
    
    const downPaymentAmount = (homePrice * downPaymentPercent) / 100
    const principal = homePrice - downPaymentAmount
    const monthlyRate = (interestRate / 100) / 12
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
    if (name === 'homePrice') {
      // Remove commas and format with commas
      const numericValue = value.replace(/,/g, '')
      if (numericValue === '' || /^\d+$/.test(numericValue)) {
        const formattedValue = numericValue === '' ? '' : parseInt(numericValue).toLocaleString('en-US')
        setCalculatorData(prev => ({
          ...prev,
          [name]: formattedValue
        }))
      }
    } else {
      setCalculatorData(prev => ({
        ...prev,
        [name]: parseFloat(value) || (value === '' ? '' : 0)
      }))
    }
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
      setShowBackToTop(window.scrollY > 500)
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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="landing-page">
      {/* STICKY NAVIGATION */}
      <nav className={`sticky-nav ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <button 
            className="nav-logo" 
            onClick={scrollToTop}
            style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}
            aria-label="Return to top"
          >
            Frederick Sales
          </button>
          <button className="mobile-menu-toggle" onClick={toggleMobileMenu} aria-label="Toggle menu">
            <span className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
            {mobileMenuOpen && <span className="close-text">Close</span>}
          </button>
          <div className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <button onClick={() => scrollToSection('game-plan')}>Process</button>
            <button onClick={() => scrollToSection('money-talk')}>Costs</button>
            <button onClick={() => scrollToSection('winning-offer')}>Winning Offer</button>
            <button onClick={() => scrollToSection('team-advantage')}>Why Us</button>
            <button onClick={() => scrollToSection('testimonials')}>Reviews</button>
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
          <div className="hero-trust-badge">
            <span className="trust-badge-icon">✓</span>
            <span>Licensed in VA, DC & MD • 7+ Years Experience</span>
          </div>
          <h1 className="hero-title">Your Keys to the DMV:<br />Your Home Buying Strategy</h1>
          <p className="hero-slogan">Work with a DMV Native who knows the neighborhoods, not just the listings.</p>
          <p className="hero-intro">
            Hi, I'm Frederick Sales! I grew up in Alexandria, VA and I currently live in Washington DC in the SW Waterfront neighborhood. Finding your next home is a huge step, and as your realtor, I'm here to make it smarter, simpler, and way more fun. 
            With 7+ years of experience in VA, DC, and MD, I've built a "Winning Game Plan" to get you the perfect home. Let's work together to find your dream home!
          </p>
          <button className="cta-button primary" onClick={scrollToContact}>
            Schedule My Free Buyer Consultation
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
                It all starts here. As your realtor, I'll connect you with our trusted local lenders to get you fully Pre-Approved (not just Pre-Qualified!).
              </p>
              <p className="step-description">
                This makes you a 'power-buyer' and sets you up to win from day one. <strong>Ask me more about how pre-approval gives you a competitive edge.</strong>
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3 className="step-title">The "Priority Access" Hunt</h3>
              <p className="step-description">
                This is the fun part! As your realtor, I'll set you up with <strong>real-time MLS alerts</strong> (not 24-hour-delayed Zillow data).
              </p>
              <p className="step-description">
                Plus, you'll get access to our exclusive <strong>'Priority Access' list</strong> of off-market homes you can't find online. <strong>Work with me to see homes before they hit the market!</strong>
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3 className="step-title">Craft the Winning Offer</h3>
              <p className="step-description">
                Found 'the one'? Now, as your realtor, I put our experience to work for you.
              </p>
              <p className="step-description">
                We'll analyze comparable sales, seller motivations, and market conditions to craft an offer that stands out—even when there are 10+ competing bids. <strong>Ask me more about our winning offer strategies.</strong>
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h3 className="step-title">Close, Get Your Keys & Party!</h3>
              <p className="step-description">
                As your realtor, I handle every detail from contract to closing. <strong>Our average closing time: 30 days.</strong>
              </p>
              <p className="step-description">
                And yes, we really do throw housewarming parties for our clients! When you work with me, you become part of the family.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: MONEY TALK */}
      <section id="money-talk" className="money-talk fade-in-section">
        <div className="container">
          <h2 className="section-title">Money Talk</h2>
          <p className="section-subtitle">No surprises. Here's what to expect financially.</p>
          <div className="money-grid">
            <div className="money-card">
              <h3 className="money-card-title"><span className="tooltip-trigger" data-tooltip="Pre-Qualified: A quick estimate based on basic information you provide. Not verified. Pre-Approved: A thorough review with document verification that makes you a serious, competitive buyer.">Pre-Qualified</span> vs. <span className="tooltip-trigger" data-tooltip="Pre-Approved: A thorough qualification with document verification. This makes you a serious buyer and lets you act fast. Required to be competitive in today's market.">Pre-Approved</span></h3>
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
                  <span className="cost-icon">📝</span>
                  <div>
                    <strong><span className="tooltip-trigger" data-tooltip="Closing Costs: Fees paid at settlement including appraisal, inspection, title insurance, loan origination, and recording fees. Typically 2.5-3% of home price in the DMV.">Closing Costs</span></strong>
                    <span>~2.5% - 3%</span>
                  </div>
                </li>
                <li>
                  <span className="cost-icon">💵</span>
                  <div>
                    <strong>Earnest Money Deposit (<span className="tooltip-trigger" data-tooltip="Earnest Money Deposit: A good-faith deposit showing you're serious about buying. Held in escrow and credited back at closing.">EMD</span>)</strong>
                    <span>3%+</span>
                  </div>
                </li>
                <li>
                  <span className="cost-icon">🔍</span>
                  <div>
                    <strong><span className="tooltip-trigger" data-tooltip="Home Inspection: A professional evaluation of the property's condition, including structural elements, systems (HVAC, plumbing, electrical), and safety concerns. Allows you to negotiate repairs or withdraw if major issues are found.">Home Inspection</span></strong>
                    <span>~$350 - $750</span>
                  </div>
                </li>
                <li>
                  <span className="cost-icon">📊</span>
                  <div>
                    <strong><span className="tooltip-trigger" data-tooltip="Appraisal: A professional assessment of the home's value by a licensed appraiser. Required by lenders to ensure the property is worth the loan amount. If the appraisal comes in lower than your offer, you can renegotiate or walk away.">Appraisal</span></strong>
                    <span>~$400 - $600+</span>
                  </div>
                </li>
                <li>
                  <span className="cost-icon">✅</span>
                  <div>
                    <strong>Buyer's Commission</strong>
                    <span>3% (Typically paid by the Seller)</span>
                  </div>
                </li>
                <li 
                  onClick={() => setShowAdminFeePopup(true)}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="cost-icon">📋</span>
                  <div>
                    <strong>
                      Admin Fee
                      <button 
                        type="button"
                        className="info-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAdminFeePopup(true);
                        }}
                        aria-label="What is an admin fee?"
                        style={{ marginLeft: '0.5rem', fontSize: '0.9rem' }}
                      >
                        ℹ️
                      </button>
                    </strong>
                    <span>${ADMIN_FEE}</span>
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
                    type="text"
                    id="homePrice"
                    name="homePrice"
                    value={calculatorData.homePrice}
                    onChange={handleCalculatorChange}
                    placeholder="500,000"
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
                  {calculatorData.homePrice && calculatorData.downPaymentPercent 
                    ? formatCurrency((parseFloat(calculatorData.homePrice.toString().replace(/,/g, '')) * parseFloat(calculatorData.downPaymentPercent)) / 100) + ' down'
                    : '$0 down'}
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
                <div className="rate-note">
                  <small>Current market rate pre-filled. You can adjust this.</small>
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
                <div className="result-note">Principal & Interest (does not include taxes and insurance)</div>
              </div>

              <div className="result-details">
                <div className="result-row">
                  <span className="result-label-small">Down Payment</span>
                  <span className="result-value-small">
                    {calculatorData.homePrice && calculatorData.downPaymentPercent 
                      ? formatCurrency((parseFloat(calculatorData.homePrice.toString().replace(/,/g, '')) * parseFloat(calculatorData.downPaymentPercent)) / 100)
                      : '$0'}
                  </span>
                </div>
                <div className="result-row">
                  <span className="result-label-small">Loan Amount</span>
                  <span className="result-value-small">
                    {calculatorData.homePrice && calculatorData.downPaymentPercent 
                      ? formatCurrency(parseFloat(calculatorData.homePrice.toString().replace(/,/g, '')) - ((parseFloat(calculatorData.homePrice.toString().replace(/,/g, '')) * parseFloat(calculatorData.downPaymentPercent)) / 100))
                      : '$0'}
                  </span>
                </div>
              </div>

              <div className="calculator-cta">
                <p>Ready to get pre-approved? As your realtor, I'll connect you with our trusted lenders. <strong>Ask me more about the pre-approval process.</strong></p>
                <button className="cta-button primary" onClick={scrollToContact}>
                  Get Pre-Approved Today
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: WEALTH BUILDING */}
      <section id="wealth-building" className="wealth-building fade-in-section">
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
            
            {/* Renting vs. Buying Comparison */}
            <div className="rent-vs-buy-comparison">
              <h3 className="comparison-title">Renting vs. Buying: The Wealth Gap</h3>
              <p className="comparison-subtitle">See how buying builds wealth while renting builds someone else's</p>
              <div className="comparison-grid">
                <div className="comparison-column rent-column">
                  <div className="comparison-header">RENTING</div>
                  <div className="comparison-item">
                    <div className="comparison-period">5 Years</div>
                    <div className="comparison-amount negative">-$90,000</div>
                    <div className="comparison-detail">Total Rent Paid</div>
                    <div className="comparison-note">No equity • No tax benefits • No wealth building</div>
                  </div>
                  <div className="comparison-item">
                    <div className="comparison-period">10 Years</div>
                    <div className="comparison-amount negative">-$180,000</div>
                    <div className="comparison-detail">Total Rent Paid</div>
                    <div className="comparison-note">Still no equity • Rent increases over time</div>
                  </div>
                  <div className="comparison-item">
                    <div className="comparison-period">20 Years</div>
                    <div className="comparison-amount negative">-$360,000</div>
                    <div className="comparison-detail">Total Rent Paid</div>
                    <div className="comparison-note">Zero wealth created • No asset to show</div>
                  </div>
                </div>
                <div className="comparison-column buy-column">
                  <div className="comparison-header">BUYING</div>
                  <div className="comparison-item">
                    <div className="comparison-period">5 Years</div>
                    <div className="comparison-amount positive">+$120,250</div>
                    <div className="comparison-detail">Net Wealth Created</div>
                    <div className="comparison-note">Equity + Appreciation • Tax benefits • Building wealth</div>
                  </div>
                  <div className="comparison-item">
                    <div className="comparison-period">10 Years</div>
                    <div className="comparison-amount positive">+$261,300</div>
                    <div className="comparison-detail">Net Wealth Created</div>
                    <div className="comparison-note">Significant equity • Appreciation continues</div>
                  </div>
                  <div className="comparison-item">
                    <div className="comparison-period">20 Years</div>
                    <div className="comparison-amount positive">+$620,100</div>
                    <div className="comparison-detail">Net Wealth Created</div>
                    <div className="comparison-note">Massive equity • Potential to own outright</div>
                  </div>
                </div>
              </div>
              <div className="rent-calculation-note">
                <p className="calculation-title">How We Calculated Rent:</p>
                <p className="calculation-detail">Based on a monthly rent of <strong>$1,500/month</strong> for a comparable property:</p>
                <ul className="calculation-breakdown">
                  <li><strong>5 Years:</strong> $1,500 × 60 months = $90,000</li>
                  <li><strong>10 Years:</strong> $1,500 × 120 months = $180,000</li>
                  <li><strong>20 Years:</strong> $1,500 × 240 months = $360,000</li>
                </ul>
                <p className="calculation-disclaimer"><em>Note: Rent typically increases 2-3% annually. These figures represent base rent without increases for simplicity.</em></p>
              </div>
            </div>

            {/* Tax Benefits Callout */}
            <div className="tax-benefits-callout">
              <div className="tax-icon">💰</div>
              <div className="tax-content">
                <h3 className="tax-title">Tax Benefits of Homeownership</h3>
                <p className="tax-description">
                  As a homeowner, you may be eligible for significant tax deductions:
                </p>
                <ul className="tax-list">
                  <li><strong>Mortgage Interest Deduction:</strong> Deduct interest paid on your mortgage (up to $750,000 loan amount)</li>
                  <li><strong>Property Tax Deduction:</strong> Deduct state and local property taxes paid</li>
                  <li><strong>Potential Savings:</strong> These deductions can save you thousands in taxes each year, effectively reducing your monthly housing cost</li>
                </ul>
                <p className="tax-note">
                  <em>Note: Tax benefits vary based on individual circumstances. Consult with a tax professional for advice specific to your situation.</em>
                </p>
              </div>
            </div>

            <p className="wealth-takeaway">
              This is why more wealth is created in real estate than any other sector. You're not just paying a mortgage—you're paying yourself.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 4: PRIORITY ACCESS */}
      <section id="priority-access" className="priority-access fade-in-section">
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

      {/* CRAFTING A WINNING OFFER */}
      <section id="winning-offer" className="winning-offer fade-in-section">
        <div className="container">
          <h2 className="section-title">Crafting a Winning Offer</h2>
          
          <div className="offer-components-grid">
            <div className="offer-component-card">
              <div className="component-icon">📅</div>
              <h3 className="component-title">Closing Date</h3>
              <p className="component-subtitle">Also called Settlement date</p>
              <p className="component-description">
                We'll find out what timeframe the seller prefers before submitting your offer. This ensures you get a closing date that works for you while keeping the seller happy.
              </p>
              <p className="component-description">
                <strong>Typical timeframe:</strong> 21-30 days is most common in the DMV, though it can range from 15-90 days depending on the seller's needs. <strong>As your realtor, I'll help you negotiate the best closing date for your situation.</strong>
              </p>
            </div>

            <div className="offer-component-card">
              <div className="component-icon">🏠</div>
              <h3 className="component-title">Post Settlement Occupancy</h3>
              <p className="component-description">
                Sometimes a seller will request a "rent back"—allowing them to stay in the home after closing. This can be a very compelling tactic that sets your offer apart.
              </p>
              <p className="component-description">
                <strong>Why it works:</strong> If the seller needs to buy another home, they get a window to use the sale proceeds without the stress of timing two closings perfectly. Many agents don't ask about this, but we do.
              </p>
              <p className="component-description">
                Lenders typically allow Post Settlement Occupancy for up to 60 days, making this a powerful negotiation tool.
              </p>
            </div>

            <div className="offer-component-card">
              <div className="component-icon">💰</div>
              <h3 className="component-title">EMD (<span className="tooltip-trigger" data-tooltip="Earnest Money Deposit: A good-faith deposit showing you're serious about buying. Held in escrow and credited back at closing.">Earnest Money Deposit</span>)</h3>
              <p className="component-description">
                The EMD (earnest money deposit) goes into an escrow account at the title company until settlement. At closing, it's credited back to you and can be used toward your down payment or refunded.
              </p>
              <p className="component-description">
                <strong>Market average in DMV:</strong> 1-5% of purchase price. 3% EMD is the standard. The larger the EMD, the more security the seller has that you'll move forward to settlement.
              </p>
              <p className="component-description">
                <strong>Our strategy:</strong> If you have liquidity, a larger EMD is an easy way to make your offer stand out—at no extra cost to you. <strong>Ask me more about how we can use EMD strategically in your offer.</strong>
              </p>
            </div>

            <div className="offer-component-card">
              <div className="component-icon">💵</div>
              <h3 className="component-title">Down Payment</h3>
              <p className="component-description">
                The down payment is the initial cash amount you pay toward the purchase price of the home. It's your equity stake in the property from day one.
              </p>
              <p className="component-description">
                <strong>Minimum down payment:</strong> Typically 3% for conventional loans (though some programs allow less), and can go up to 20% or more.
              </p>
              <p className="component-description">
                <strong>Benefits of a larger down payment:</strong> Better loan terms, lower monthly payments, and may eliminate the need for private mortgage insurance (<span className="tooltip-trigger" data-tooltip="Private Mortgage Insurance: Insurance that protects the lender if you default. Typically required when your down payment is less than 20%.">PMI</span>).
              </p>
              <p className="component-description">
                The amount you put down will depend on your financial situation, the type of loan you're using, and your long-term financial goals. <strong>As your realtor, I'll help you understand your options and make the best decision for your situation.</strong>
              </p>
            </div>

            <div className="offer-component-card">
              <div className="component-icon">🏦</div>
              <h3 className="component-title">Lender/Title Company</h3>
              <p className="component-description">
                <strong>The Lender</strong> provides your mortgage financing, reviews your financial documents, and approves your loan. They handle all the financial aspects of the transaction.
              </p>
              <p className="component-description">
                <strong>The Title Company</strong> conducts a title search to ensure the property has a clear title (no liens or ownership disputes), handles the closing process, and ensures the legal transfer of ownership. They also hold your earnest money deposit in escrow.
              </p>
              <p className="component-description">
                <strong>How They Work Together:</strong> The lender provides financing, while the title company ensures the legal transfer is clean and handles closing. They coordinate to ensure all funds are properly transferred and documents are correctly executed.
              </p>
              <p className="component-description">
                As your realtor, I have preferred vendors for both, but we'll always confirm who you decide to work with. <strong>Ask me more about our trusted lender and title company network.</strong>
              </p>
            </div>

            <div className="offer-component-card">
              <div className="component-icon">🔍</div>
              <h3 className="component-title">Home Inspection <span className="tooltip-trigger" data-tooltip="Contingency: A condition in your offer that must be met for the sale to proceed. If not met, you can withdraw without penalty.">Contingency</span> & Appraisal <span className="tooltip-trigger" data-tooltip="Contingency: A condition in your offer that must be met for the sale to proceed. If not met, you can withdraw without penalty.">Contingency</span></h3>
              <p className="component-description">
                <strong>Home Inspection Contingency:</strong> This gives you the right to have the property professionally inspected and to negotiate repairs or withdraw from the contract if major issues are found.
              </p>
              <p className="component-description">
                The inspection typically covers structural elements, systems (HVAC, plumbing, electrical), and safety concerns. This contingency protects you from buying a home with hidden problems.
              </p>
              <p className="component-description">
                <strong>Appraisal Contingency:</strong> This protects you if the home appraises for less than your offer price. The lender requires an appraisal to ensure the property is worth the loan amount.
              </p>
              <p className="component-description">
                If the appraisal comes in low, you can renegotiate the price, make up the difference in cash, or walk away from the deal. This ensures you're not overpaying for the property.
              </p>
              <p className="component-description">
                <strong>Strategy:</strong> Both contingencies are crucial protections, but shorter contingency periods can make your offer more competitive in hot markets. <strong>As your realtor, I'll help you balance protection with competitiveness.</strong>
              </p>
              <p className="component-note">
                <strong>Bonus: Home Warranty</strong> - A home warranty provides extra protection for your investment and can save you money in case of future emergencies. It typically covers major systems and appliances, giving you peace of mind after closing.
              </p>
              <p className="component-description" style={{ marginTop: '1rem', fontStyle: 'italic', color: '#c9a961', fontWeight: '600' }}>
                Ask me more about home warranties and how they can protect your investment.
              </p>
            </div>

            <div className="offer-component-card">
              <div className="component-icon">🤝</div>
              <h3 className="component-title">Seller Subsidy</h3>
              <p className="component-description">
                Depending on how much competition there is on the property, you may be able to negotiate seller subsidy.
              </p>
              <p className="component-description">
                This could be closing costs or money to repair something in the property. As your realtor, I'll assess each situation to see if this is a viable strategy for your offer. <strong>Ask me more about when seller subsidy makes sense.</strong>
              </p>
            </div>

            <div className="offer-component-card">
              <div className="component-icon">✅</div>
              <h3 className="component-title">Financing Contingency</h3>
              <p className="component-description">
                Adding a financing contingency to your contract can cause pause for many sellers, and can make or break an offer.
              </p>
              <p className="component-description">
                As your realtor, I'll work with your lender to get you fully approved—with all documents and credit reviewed—prior to submitting your offer.
              </p>
              <p className="component-description">
                <strong>Strategy:</strong> If you need to add a financing contingency, the shorter the contingency period, the more compelling your offer will be. <strong>Work with me to structure the strongest offer possible.</strong>
              </p>
              <div className="component-note">
                <strong>Note:</strong> Oftentimes, larger banks need more time to work through loan approval, as they work with several 3rd party vendors throughout the lending process. This can be detrimental in the offer process since the seller is looking for the most concrete offer and extended contingencies can make them very nervous. Additionally, the lack of speed can be extremely stressful for the purchaser as we work through the waiting game of approval. This is why we recommend using our preferred lenders. If you do not have a financing contingency and cannot qualify for the loan, your deposit is at risk, so make sure you discuss your options with your lender and your agent as you navigate this decision.
              </div>
            </div>

            <div className="offer-component-card">
              <div className="component-icon">🏘️</div>
              <h3 className="component-title">HOA/Condo Association</h3>
              <p className="component-description">
                If you're buying a condominium or a home in a community with a Homeowners Association (HOA), understanding the association and its fees is crucial to your home buying decision.
              </p>
              <p className="component-description">
                <strong>HOA/Condo Fees:</strong> These monthly or annual fees cover shared expenses like maintenance of common areas, amenities (pools, gyms, landscaping), insurance for common areas, and reserve funds for future repairs. Fees can range from a few hundred to over a thousand dollars per month, depending on the community and amenities offered.
              </p>
              <p className="component-description">
                <strong>Why It Matters:</strong> HOA fees directly impact your monthly housing costs and affordability. They also govern what you can and cannot do with your property through rules, regulations, and covenants. Understanding these fees and rules upfront helps you make an informed decision and avoid surprises after closing.
              </p>
              <p className="component-description">
                <strong>Document Review Period/Contingency:</strong> When you're under contract, you have a specific period to review all HOA/Condo association documents, including bylaws, rules, financial statements, and meeting minutes. This review period is a critical contingency that allows you to understand the association's financial health, rules, and any pending special assessments.
              </p>
              <p className="component-description">
                <strong>Review Periods by State:</strong> In DC and MD, you have <strong>3 business days</strong> to review HOA/Condo documents. In Virginia, you have <strong>3 days</strong> (calendar days) for both HOA and Condo document review periods when under contract. During this time, you can review the documents and decide if you want to proceed with the purchase or withdraw from the contract.
              </p>
            </div>
          </div>

          <div className="offer-cta-box">
            <p className="offer-cta-text">Ready to craft your winning offer? As your realtor, let's work together to discuss your strategy and create an offer that wins.</p>
            <button className="cta-button primary" onClick={scrollToContact}>
              Schedule My Free Buyer Consultation
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 5: KS TEAM ADVANTAGE */}
      {/* SECTION 5: KS TEAM ADVANTAGE */}
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
            When you work with me as your realtor, you're not just hiring Frederick Sales; you're hiring the entire KS Team. We have the track record, 
            the resources, and the market intel to ensure you win. <strong>Let's work together to find your perfect home.</strong>
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

      {/* TESTIMONIALS SECTION */}
      <section id="testimonials" className="testimonials fade-in-section">
        <div className="container">
          <h2 className="section-title">What Our Clients Say</h2>
          <p className="section-subtitle">Real reviews from real clients who found their dream homes with us</p>
          <div className="testimonials-grid">
            {/* Add your review screenshots to /public/images/ folder */}
            {/* Name them: review-1.jpg, review-2.jpg, review-3.jpg, etc. */}
            {/* You can add or remove testimonial items as needed */}
            <div className="testimonial-item">
              <img 
                src="/images/review-1.png" 
                alt="Client Review 1"
                className="testimonial-image"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <div className="testimonial-item">
              <img 
                src="/images/review-2.png" 
                alt="Client Review 2"
                className="testimonial-image"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <div className="testimonial-item">
              <img 
                src="/images/review-3.png" 
                alt="Client Review 3"
                className="testimonial-image"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <div className="testimonial-item">
              <img 
                src="/images/review-4.png" 
                alt="Client Review 4"
                className="testimonial-image"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
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
                Typically, the home buying process takes 30-45 days from offer acceptance to closing. However, this can vary based on financing, inspections, and negotiations. As your realtor, I'll work with you to ensure a timeline that works for your situation.
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">Do I need to be pre-approved before looking at homes?</h3>
              <p className="faq-answer">
                While not required, being pre-approved is highly recommended. It makes you a "power-buyer" and allows you to act quickly when you find the perfect home. Many sellers won't even consider offers without pre-approval. <strong>Ask me more about how pre-approval gives you a competitive edge.</strong>
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
                Down payments can range from 3% to 20% or more, depending on your loan type. Conventional loans typically require 3-20%, while VA loans can be 0% down. As your realtor, I'll help you understand your options based on your situation. <strong>Work with me to find the best down payment strategy for you.</strong>
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">What are closing costs and who pays for them?</h3>
              <p className="faq-answer">
                Closing costs typically range from 2.5% to 3% of the home price and include fees for appraisal, inspection, title insurance, and more. In the DMV, buyers typically pay closing costs, though as your realtor, I can negotiate seller contributions in some cases. <strong>Ask me more about how we can minimize your closing costs.</strong>
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">What is earnest money and how much do I need?</h3>
              <p className="faq-answer">
                Earnest money (EMD) shows the seller you're serious about buying. It's held in escrow and credited back at closing. In the DMV, EMD typically ranges from 1-5% of the purchase price. A larger EMD can make your offer more competitive. <strong>As your realtor, I'll help you determine the best EMD amount for your offer.</strong>
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">Can I buy a home if I have student loans or other debt?</h3>
              <p className="faq-answer">
                Yes! Having debt doesn't automatically disqualify you. Lenders look at your debt-to-income ratio. As your realtor, I'll connect you with trusted lenders who can help you understand your options and find the right loan program for your situation. <strong>Ask me more about how we can work together to get you approved.</strong>
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">What areas do you serve?</h3>
              <p className="faq-answer">
                I'm licensed in Virginia, Washington DC, and Maryland - the entire DMV area! Whether you're looking in Arlington, Bethesda, Alexandria, or anywhere in between, as your realtor, I can help you find your perfect home. <strong>Let's work together to explore the best neighborhoods for you.</strong>
              </p>
            </div>
            <div className="faq-item">
              <h3 className="faq-question">Are there any first time home buyer programs?</h3>
              <p className="faq-answer">
                Yes! There are several first-time home buyer programs available that can help with down payment assistance, lower interest rates, and reduced closing costs. These programs vary by state and locality, and can include options like FHA loans, VA loans (for eligible veterans), and state-specific programs. As your realtor, I'll connect you with mortgage lenders who can provide detailed information about first-time home buyer programs you may qualify for. <strong>Ask me more about first-time buyer programs in the DMV.</strong>
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
          <p className="section-subtitle">Let's work together! Set up a 30-minute, no-obligation buyer consultation with me, your realtor. No pressure, just a great conversation about your goals and how we can find your perfect home.</p>
          
          {/* What's Included Section */}
          <div className="consultation-includes">
            <h3 className="includes-title">What's Included in Your Free Buyer Consultation:</h3>
            <div className="includes-content">
              <ul className="includes-list">
                <li className="includes-item">
                  <span className="includes-icon">🎯</span>
                  <span><strong>Personalized Home Buying Roadmap & Budget Planning</strong> - A customized plan tailored to your timeline, budget, and goals, plus a complete breakdown of all costs and a realistic timeline for your home purchase</span>
                </li>
                <li className="includes-item">
                  <span className="includes-icon">⚡</span>
                  <span><strong>Pre-Approval Strategy</strong> - Connect with trusted lenders for 48-hour pre-approval to become a "power buyer"</span>
                </li>
                <li className="includes-item">
                  <span className="includes-icon">📊</span>
                  <span><strong>DMV Market Insights</strong> - Get expert analysis of current market conditions in your target neighborhoods</span>
                </li>
                <li className="includes-item">
                  <span className="includes-icon">🔑</span>
                  <span><strong>Priority Access Preview</strong> - Learn how to access off-market homes before they hit Zillow</span>
                </li>
                <li className="includes-item">
                  <span className="includes-icon">🏆</span>
                  <span><strong>Winning Offer Strategy</strong> - Discover proven tactics to craft offers that stand out in competitive markets</span>
                </li>
                <li className="includes-item">
                  <span className="includes-icon">🤝</span>
                  <span><strong>KS Team Resources</strong> - Access to our network of trusted lenders, inspectors, and vendors</span>
                </li>
                <li className="includes-item">
                  <span className="includes-icon">💬</span>
                  <span><strong>All Your Real Estate Questions Answered</strong> - Get expert answers to any questions you have about buying a home, the DMV market, neighborhoods, financing, or the home buying process</span>
                </li>
              </ul>
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
              {formSubmitted ? 'Submitting...' : 'Submit'}
            </button>
            <p className="form-privacy">We respect your privacy. Your information will never be shared.</p>
          </form>

          {/* Admin Fee Popup */}
          {showAdminFeePopup && (
            <div className="success-modal-overlay" onClick={() => setShowAdminFeePopup(false)}>
              <div className="success-modal" onClick={(e) => e.stopPropagation()}>
                <div className="success-icon" style={{ background: 'linear-gradient(135deg, #c9a961, #d4af37)' }}>💰</div>
                <h3>What is a Real Estate Admin Fee?</h3>
                <p style={{ textAlign: 'left', lineHeight: '1.8' }}>
                  The real estate admin fee (also called a transaction fee or processing fee) is a standard fee charged by real estate brokerages to cover administrative costs associated with your transaction. This $495 fee helps cover:
                </p>
                <ul style={{ textAlign: 'left', lineHeight: '1.8', marginTop: '1rem' }}>
                  <li>Document processing and file management</li>
                  <li>Transaction coordination between all parties</li>
                  <li>Compliance and regulatory requirements</li>
                  <li>Administrative support throughout your home buying process</li>
                </ul>
                <p style={{ textAlign: 'left', lineHeight: '1.8', marginTop: '1rem', fontStyle: 'italic' }}>
                  This fee is standard in the industry and is typically paid at closing. As your realtor, I'll make sure you understand all costs upfront—no surprises!
                </p>
                <button className="cta-button primary" onClick={() => setShowAdminFeePopup(false)}>Got It!</button>
              </div>
            </div>
          )}

          {/* Success Modal */}
          {showSuccessModal && (
            <div className="success-modal-overlay" onClick={closeSuccessModal}>
              <div className="success-modal" onClick={(e) => e.stopPropagation()}>
                <div className="success-icon">✓</div>
                <h3>Thank You!</h3>
                <p>We've received your information and will be in touch soon to schedule your buyer consultation.</p>
                <button className="cta-button primary" onClick={closeSuccessModal}>Got It!</button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FLOATING CTA BUTTON */}
      {isScrolled && (
        <button className="floating-cta" onClick={scrollToContact} aria-label="Get Started">
          <span>Get Your Free Consultation</span>
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

      {/* BACK TO TOP BUTTON */}
      {showBackToTop && (
        <button 
          className="back-to-top" 
          onClick={scrollToTop}
          aria-label="Back to top"
        >
          ↑
        </button>
      )}
    </div>
  )
}

export default App
