import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Zap, Sparkles } from 'lucide-react';
import gourmetPokeBowl from './gourmet_poke_bowl_transparent.png';

function Home() {
  // Ambiance Carousel Slides Data
  const carouselSlides = [
    {
      img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
      title: 'Grand Dining Hall',
      desc: 'Spacious seating for family gatherings.'
    },
    {
      img: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
      title: 'The Lounge',
      desc: 'Modern aesthetics with warm lighting.'
    },
    {
      img: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80',
      title: 'Cozy Corners',
      desc: 'Intimate seating for a perfect dinner.'
    }
  ];

  const [activeSlide, setActiveSlide] = useState(0);



  useEffect(() => {
    const slideInterval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 5000);
    return () => clearInterval(slideInterval);
  }, [carouselSlides.length]);

  // FAQ Accordion State
  const [activeIndex, setActiveIndex] = useState(null);
  const handleToggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };
  const faqs = [
    {
      q: 'Why do guests love visiting our restaurant?',
      a: 'Because we focus on warm hospitality, a calm atmosphere, and making every guest feel truly welcome.'
    },
    {
      q: 'What makes our place special?',
      a: 'We value authenticity, thoughtful details, and creating experiences people love to return to.'
    },
    {
      q: 'What can guests expect when they visit?',
      a: 'A relaxed ambience, friendly service, and a memorable experience from start to finish.'
    }
  ];

  return (
    <div className="home-viewport">
      {/* Hero Section */}
      <header id="home-hero-split" className="new-split-hero mb-5 shadow">
        <div className="container py-3">
          <div className="row align-items-center">
            {/* Left Column (50% width) */}
            <div className="col-lg-6 split-hero-left">
              <h1 className="display-3 fw-bold text-white mb-3" style={{ textShadow: '2px 2px 10px rgba(0,0,0,0.8)' }}>
                Taste the <span className="gold-accent">tradition</span>
              </h1>
              <p className="lead text-white-50 mb-5 fs-4">
                Where every meal tells a story. Experience authentic flavors in the heart of the city.
              </p>
              <div className="d-flex justify-content-start align-items-center gap-4">
                <Link to="/menu" className="btn btn-warning rounded-pill px-5 py-3 shadow fw-bold">
                  View Menu
                </Link>
                <a href="#contact" className="btn btn-glass-hero rounded-pill px-4 py-3 fw-bold">
                  <i className="bi bi-geo-alt-fill me-2 fs-5"></i> Visit Us
                </a>
              </div>
            </div>
            {/* Right Column (50% width) */}
            <div className="col-lg-6 split-hero-right">
              <div className="radial-glow"></div>
              <img 
                src={gourmetPokeBowl} 
                alt="Signature Dish" 
                className="floating-food"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Story Section */}
      <section className="story-section my-5 overflow-hidden rounded-4 shadow-sm border border-secondary bg-dark text-white">
        <div className="row g-0">
          <div className="col-md-6">
            <img 
              src="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80" 
              className="img-fluid w-100" 
              style={{ height: '400px', objectFit: 'cover' }} 
              alt="Our Story"
            />
          </div>
          <div className="col-md-6 d-flex align-items-center p-5">
            <div>
              <h3 className="h1 text-warning mb-3 font-serif">Our Story</h3>
              <p className="fs-5 text-white-50 leading-relaxed">
                Founded in 2024, Flavors & Fork brings the authentic taste of tradition to your plate. 
                Our recipes have been passed down through generations, combining traditional cooking 
                methods with fresh, modern ingredients to create a dining experience you won't forget.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section my-5">
        <div className="row">
          <div className="col-md-4 mb-4 fade-in">
            <div className="card h-100 premium-feature-card text-center py-4 shadow-sm">
              <div className="card-body">
                <div className="icon-circle mb-3 fresh-icon-glow">
                  <Leaf size={30} />
                </div>
                <h3 className="card-title text-warning mt-2 font-serif">Fresh Ingredients</h3>
                <p className="card-text text-white-50">
                  We source our ingredients locally to ensure the highest quality and freshness in every dish.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-4 fade-in delay-100">
            <div className="card h-100 premium-feature-card text-center py-4 shadow-sm">
              <div className="card-body">
                <div className="icon-circle mb-3 fast-icon-glow">
                  <Zap size={30} />
                </div>
                <h3 className="card-title text-warning mt-2 font-serif">Fast Service</h3>
                <p className="card-text text-white-50">
                  Our dedicated team triggers your taste buds with quick, efficient, and friendly table service.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-4 mb-4 fade-in delay-200">
            <div className="card h-100 premium-feature-card text-center py-4 shadow-sm">
              <div className="card-body">
                <div className="icon-circle mb-3 cozy-icon-glow">
                  <Sparkles size={30} />
                </div>
                <h3 className="card-title text-warning mt-2 font-serif">Cozy Ambiance</h3>
                <p className="card-text text-white-50">
                  Relax and enjoy your meal in our warm, welcoming, and beautifully designed atmosphere.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interiors Carousel Section */}
      <section id="interiors" className="py-5 bg-dark border border-secondary rounded-4 my-5 shadow-sm text-white">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-warning font-serif h1">Experience the Ambiance</h2>
            <p className="text-white-50">Dining is not just about food; it's about the feeling.</p>
          </div>
          <div className="position-relative rounded-4 overflow-hidden shadow-lg" style={{ height: '450px' }}>
            {carouselSlides.map((slide, idx) => (
              <div 
                key={idx} 
                className={`position-absolute w-100 h-100 transition-opacity duration-1000 ${idx === activeSlide ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                style={{ transition: 'all 0.8s ease-in-out' }}
              >
                <img 
                  src={slide.img} 
                  className="w-100 h-100" 
                  alt={slide.title} 
                  style={{ objectFit: 'cover' }}
                />
                <div className="position-absolute bottom-0 start-0 end-0 p-4 bg-dark bg-opacity-70 text-center">
                  <h5 className="text-warning fw-bold fs-4">{slide.title}</h5>
                  <p className="text-white-50 mb-0">{slide.desc}</p>
                </div>
              </div>
            ))}
            
            {/* Carousel Controls */}
            <button 
              className="position-absolute top-50 start-0 translate-middle-y btn btn-link text-white fs-1" 
              onClick={() => setActiveSlide((activeSlide - 1 + carouselSlides.length) % carouselSlides.length)}
              style={{ zIndex: 10 }}
            >
              <i className="bi bi-chevron-left"></i>
            </button>
            <button 
              className="position-absolute top-50 end-0 translate-middle-y btn btn-link text-white fs-1" 
              onClick={() => setActiveSlide((activeSlide + 1) % carouselSlides.length)}
              style={{ zIndex: 10 }}
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-5 bg-dark border border-secondary rounded-4 my-5 shadow-sm text-white">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-warning font-serif h1">Frequently Asked Questions</h2>
            <p className="text-white-50">Everything you need to know about us.</p>
          </div>
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="accordion accordion-flush" id="faqAccordion">
                {faqs.map((faq, index) => (
                  <div key={index} className="accordion-item bg-transparent border-bottom border-secondary py-3">
                    <h2 className="accordion-header" style={{ cursor: 'pointer' }}>
                      <button 
                        className={`accordion-button collapsed bg-transparent text-white font-serif fs-5 fw-bold border-0 px-0 d-flex justify-content-between w-100 text-start`}
                        onClick={() => handleToggle(index)}
                        style={{ cursor: 'pointer', boxShadow: 'none' }}
                      >
                        {faq.q}
                        <i 
                          className={`bi bi-chevron-down ${activeIndex === index ? 'text-warning' : 'text-white-50'}`}
                          style={{ 
                            transform: activeIndex === index ? 'rotate(180deg)' : 'rotate(0deg)', 
                            transition: 'transform 0.3s ease-in-out' 
                          }}
                        ></i>
                      </button>
                    </h2>
                    <div 
                      className={`accordion-collapse overflow-hidden transition-all`}
                      style={{ 
                        maxHeight: activeIndex === index ? '200px' : '0px', 
                        transition: 'max-height 0.4s ease-in-out' 
                      }}
                    >
                      {activeIndex === index && (
                        <p className="accordion-body text-white-50 px-0 pt-2">
                          {faq.a}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section py-5 bg-dark border border-secondary rounded-4 my-5 shadow-sm text-white">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6 mb-4 contact-details p-4">
              <h3 className="text-warning mb-4 display-6 font-serif">Visit Us</h3>
              <div className="contact-box mb-3 d-flex gap-3">
                <i className="bi bi-geo-alt-fill text-warning fs-4"></i>
                <div>
                  <p className="mb-0 fw-bold">Address:</p>
                  <span className="text-white-50">The Grand Pavilion, Sindhu Bhavan Road (SBR), Bodakdev, Ahmedabad, Gujarat 380054</span>
                </div>
              </div>
              <div className="contact-box mb-3 d-flex gap-3">
                <i className="bi bi-telephone-fill text-warning fs-4"></i>
                <div>
                  <p className="mb-0 fw-bold">Phone:</p>
                  <span className="text-white-50">+91 79 4000 5000</span>
                </div>
              </div>
              <div className="contact-box mb-3 d-flex gap-3">
                <i className="bi bi-envelope-fill text-warning fs-4"></i>
                <div>
                  <p className="mb-0 fw-bold">Email:</p>
                  <span className="text-white-50">reservations@flavorsandfork.com</span>
                </div>
              </div>
              <div className="contact-box mb-3 d-flex gap-3">
                <i className="bi bi-clock-fill text-warning fs-4"></i>
                <div>
                  <p className="mb-0 fw-bold">Hours:</p>
                  <span className="text-white-50">Mon-Sun: 11:00 AM - 11:00 PM</span>
                </div>
              </div>
            </div>
            <div className="col-md-6 p-4">
              <div className="ratio ratio-16x9 shadow rounded-4 overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.527735659077!2d72.49338197505504!3d23.041106179160824!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e9b43099b75c5%3A0x69dc723377b62b7c!2sSindhu%20Bhavan%20Marg%2C%20Ahmedabad%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1767800594353!5m2!1sen!2sin" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Flavors and Fork Location Map"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
