import React, { useState, useEffect } from 'react';

const EricErdmanResume: React.FC = () => {
  const [activeSection, setActiveSection] = useState('about');
  const [animationClass, setAnimationClass] = useState('');
  // Add scroll-based nav visibility
  const [navVisible, setNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    setAnimationClass('animate-in');
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 40) {
        setNavVisible(false); // Scrolling down, hide nav
      } else {
        setNavVisible(true); // Scrolling up, show nav
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const sections = {
    about: 'About',
    experience: 'Experience',
    skills: 'Skills',
    education: 'Education',
    projects: 'Projects',
    contact: 'Contact'
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    setAnimationClass('animate-out');
    setTimeout(() => setAnimationClass('animate-in'), 100);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 25%, #1a1a1a 50%, #333333 75%, #1a1a1a 100%)',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
    }}>
      {/* Animated Orange Lines */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1
      }}>
        {/* Horizontal Lines */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '30%',
          height: '2px',
          background: 'linear-gradient(90deg, #ff6b35, #f7931e)',
          animation: 'slideInLeft 1s ease-out'
        }} />
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '40%',
          width: '2px',
          height: '25%',
          background: 'linear-gradient(180deg, #f7931e, #ff6b35)',
          animation: 'slideDown 1s ease-out 0.5s both'
        }} />
        <div style={{
          position: 'absolute',
          top: '45%',
          left: '40%',
          width: '35%',
          height: '2px',
          background: 'linear-gradient(90deg, #ff6b35, #f7931e)',
          animation: 'slideInRight 1s ease-out 1s both'
        }} />
        
        {/* Right Side Lines */}
        <div style={{
          position: 'absolute',
          top: '60%',
          right: '15%',
          width: '25%',
          height: '2px',
          background: 'linear-gradient(270deg, #ff6b35, #f7931e)',
          animation: 'slideInRight 1s ease-out 1.5s both'
        }} />
        <div style={{
          position: 'absolute',
          top: '60%',
          right: '15%',
          width: '2px',
          height: '20%',
          background: 'linear-gradient(180deg, #f7931e, #ff6b35)',
          animation: 'slideDown 1s ease-out 2s both'
        }} />
        <div style={{
          position: 'absolute',
          top: '80%',
          right: '35%',
          width: '20%',
          height: '2px',
          background: 'linear-gradient(270deg, #ff6b35, #f7931e)',
          animation: 'slideInLeft 1s ease-out 2.5s both'
        }} />
      </div>

      {/* Navigation */}
      <nav
        style={{
          position: 'fixed',
          top: '2rem',
          left: '50%',
          display: 'flex',
          gap: '2rem',
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '1rem 2rem',
          borderRadius: '50px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 107, 53, 0.3)',
          zIndex: 100,
          transition: 'opacity 0.4s cubic-bezier(0.4,0,0.2,1), transform 0.4s cubic-bezier(0.4,0,0.2,1)',
          opacity: navVisible ? 1 : 0,
          transform: navVisible ? 'translate(-50%, 0)' : 'translate(-50%, -32px)',
          pointerEvents: navVisible ? 'auto' : 'none',
        }}
      >
        {Object.entries(sections).map(([key, label]) => (
          <button
            key={key}
            onClick={() => handleSectionChange(key)}
            style={{
              background: activeSection === key ? 'linear-gradient(45deg, #ff6b35, #f7931e)' : 'transparent',
              color: activeSection === key ? '#000' : '#fff',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '25px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem',
              transition: 'all 0.3s ease',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
            onMouseEnter={(e) => {
              if (activeSection !== key) {
                e.currentTarget.style.background = 'rgba(255, 107, 53, 0.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeSection !== key) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        padding: '8rem 2rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div className={animationClass} style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '3rem',
          border: '1px solid rgba(255, 107, 53, 0.1)',
          minHeight: '70vh'
        }}>
          {activeSection === 'about' && (
            <div>
              <h1 style={{
                fontSize: '3rem',
                fontWeight: '700',
                background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '2rem'
              }}>
                Eric Erdman
              </h1>
              <h2 style={{
                fontSize: '1.5rem',
                color: '#ccc',
                marginBottom: '2rem',
                fontWeight: '300'
              }}>
                Computer Science Student & Software Engineer
              </h2>
              <p style={{
                fontSize: '1.1rem',
                lineHeight: '1.8',
                color: '#e0e0e0',
                maxWidth: '800px'
              }}>
                Ambitious University of Wisconsin-Madison Computer Science student with hands-on experience 
                in data analytics, software engineering, and full-stack development. Passionate about creating 
                innovative solutions that leverage modern technologies to solve real-world problems. Strong 
                foundation in programming languages, data management, and software best practices 
                with a proven track record of improving system efficiency and user experience.
              </p>
              
              {/* PDF Resume Download Link */}
              <div style={{ marginTop: '2rem' }}>
                <a
                  href="/Eric-Erdman-Resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '1rem 2rem',
                    background: 'linear-gradient(45deg, #ff6b35, #f7931e)',
                    color: '#fff',
                    textDecoration: 'none',
                    borderRadius: '12px',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 107, 53, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 107, 53, 0.3)';
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                  </svg>
                  Download PDF Resume
                </a>
              </div>
            </div>
          )}

          {activeSection === 'experience' && (
            <div>
              <h2 style={{
                fontSize: '2.5rem',
                color: '#ff6b35',
                marginBottom: '3rem',
                fontWeight: '600'
              }}>
                Experience
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{
                  background: 'rgba(255, 107, 53, 0.1)',
                  padding: '2rem',
                  borderRadius: '15px',
                  border: '1px solid rgba(255, 107, 53, 0.2)'
                }}>
                  <h3 style={{ color: '#f7931e', fontSize: '1.4rem', marginBottom: '0.5rem' }}>
                    Data Analytics Intern
                  </h3>
                  <p style={{ color: '#ccc', fontSize: '1rem', marginBottom: '1rem' }}>
                    M3 Insurance | Madison, WI • May 2025 - Aug 2025
                  </p>
                  <p style={{ color: '#e0e0e0', lineHeight: '1.6' }}>
                    Created a custom React application utilizing AWS services to pull active data in tandem with Snowflake. 
                    Application aided in risk determination and valuable trend forecasting. Improved SQL querying and Python 
                    skills while presenting findings to leadership. Developed comprehensive data analysis dashboards in Tableau 
                    and enhanced UI/UX experience across multiple platforms.
                  </p>
                </div>
                <div style={{
                  background: 'rgba(255, 107, 53, 0.1)',
                  padding: '2rem',
                  borderRadius: '15px',
                  border: '1px solid rgba(255, 107, 53, 0.2)'
                }}>
                  <h3 style={{ color: '#f7931e', fontSize: '1.4rem', marginBottom: '0.5rem' }}>
                    Software Engineer Intern
                  </h3>
                  <p style={{ color: '#ccc', fontSize: '1rem', marginBottom: '1rem' }}>
                    Nelnet | Madison, WI • May 2024 - Aug 2024
                  </p>
                  <p style={{ color: '#e0e0e0', lineHeight: '1.6' }}>
                    Developed and improved multiple in-house student loan applications utilizing Angular, Node.js, C#, 
                    and .NET Frameworks. Refined SQL server performance by optimizing queries and significantly upgraded 
                    functionality and ease of use across various applications, enhancing overall user experience.
                  </p>
                </div>
                <div style={{
                  background: 'rgba(255, 107, 53, 0.1)',
                  padding: '2rem',
                  borderRadius: '15px',
                  border: '1px solid rgba(255, 107, 53, 0.2)'
                }}>
                  <h3 style={{ color: '#f7931e', fontSize: '1.4rem', marginBottom: '0.5rem' }}>
                    Information Technology Intern
                  </h3>
                  <p style={{ color: '#ccc', fontSize: '1rem', marginBottom: '1rem' }}>
                    Cardinal Glass Industries | Tomah, WI • Aug 2021 - Jan 2024
                  </p>
                  <p style={{ color: '#e0e0e0', lineHeight: '1.6' }}>
                    Enhanced system efficiency by troubleshooting and resolving complex hardware and software issues. 
                    Collaborated with team members on programmed database search applications involving SQL and Java. 
                    Significantly improved company network and system performance through strategic upgrades and optimization.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'skills' && (
            <div>
              <h2 style={{
                fontSize: '2.5rem',
                color: '#ff6b35',
                marginBottom: '3rem',
                fontWeight: '600'
              }}>
                Skills
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {[
                  { category: 'Programming Languages', skills: ['Java', 'Python', 'React', 'C', 'JavaScript', 'SQL',] },
                  { category: 'Web Technologies', skills: ['React.js', 'Angular', 'Node.js', 'HTML5', 'Web Design'] },
                  { category: 'Data & Analytics', skills: ['Tableau Development', 'Snowflake', 'Microsoft Power BI'] },
                  { category: 'Cloud & Infrastructure', skills: ['AWS Services', 'Google Cloud', 'Firebase', '.NET Frameworks'] },
                  { category: 'Professional Skills', skills: ['Project Leadership', 'Team Collaboration', 'UI/UX Design'] }
                ].map((skillGroup, index) => (
                  <div key={index} style={{
                    background: 'rgba(255, 107, 53, 0.1)',
                    padding: '2rem',
                    borderRadius: '15px',
                    border: '1px solid rgba(255, 107, 53, 0.2)'
                  }}>
                    <h3 style={{ color: '#f7931e', fontSize: '1.3rem', marginBottom: '1rem' }}>
                      {skillGroup.category}
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {skillGroup.skills.map((skill, skillIndex) => (
                        <span key={skillIndex} style={{
                          background: 'rgba(247, 147, 30, 0.2)',
                          color: '#f7931e',
                          padding: '0.3rem 0.8rem',
                          borderRadius: '15px',
                          fontSize: '0.9rem',
                          border: '1px solid rgba(247, 147, 30, 0.3)'
                        }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'education' && (
            <div>
              <h2 style={{
                fontSize: '2.5rem',
                color: '#ff6b35',
                marginBottom: '3rem',
                fontWeight: '600'
              }}>
                Education
              </h2>
              <div style={{
                background: 'rgba(255, 107, 53, 0.1)',
                padding: '2rem',
                borderRadius: '15px',
                border: '1px solid rgba(255, 107, 53, 0.2)',
                marginBottom: '2rem'
              }}>
                <h3 style={{ color: '#f7931e', fontSize: '1.4rem', marginBottom: '0.5rem' }}>
                  Bachelor of Science | Computer Science
                </h3>
                <p style={{ color: '#ccc', fontSize: '1rem', marginBottom: '1rem' }}>
                  University of Wisconsin, Madison • Graduation May 2026
                </p>
                <p style={{ color: '#e0e0e0', lineHeight: '1.6', marginBottom: '1rem' }}>
                  Pursuing a comprehensive Computer Science degree with additional certificates in Data Science and Entrepreneurship. 
                  Strong academic foundation in algorithms, big data systems, and software engineering principles.
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {['Data Science Certificate', 'Entrepreneurship Certificate'].map((cert, index) => (
                    <span key={index} style={{
                      background: 'rgba(247, 147, 30, 0.2)',
                      color: '#f7931e',
                      padding: '0.3rem 0.8rem',
                      borderRadius: '15px',
                      fontSize: '0.8rem',
                      border: '1px solid rgba(247, 147, 30, 0.3)'
                    }}>
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
              
              <div style={{
                background: 'rgba(255, 107, 53, 0.1)',
                padding: '2rem',
                borderRadius: '15px',
                border: '1px solid rgba(255, 107, 53, 0.2)',
                marginBottom: '2rem'
              }}>
                <h3 style={{ color: '#f7931e', fontSize: '1.4rem', marginBottom: '0.5rem' }}>
                  IES Vienna - Business, Economics, & International Relations
                </h3>
                <p style={{ color: '#ccc', fontSize: '1rem', marginBottom: '1rem' }}>
                  Study Abroad | Spring 2025
                </p>
                <p style={{ color: '#e0e0e0', lineHeight: '1.6' }}>
                  International education experience focusing on business, economics, and international relations in Vienna, Austria. 
                  Expanding global perspective, communication and presentation skills, and personal adaptability.
                </p>
              </div>
              
              <div style={{
                background: 'rgba(255, 107, 53, 0.1)',
                padding: '2rem',
                borderRadius: '15px',
                border: '1px solid rgba(255, 107, 53, 0.2)',
                marginBottom: '2rem'
              }}>
                <h3 style={{ color: '#f7931e', fontSize: '1.3rem', marginBottom: '1rem' }}>
                  Professional Certifications
                </h3>
                <div style={{
                  background: 'rgba(247, 147, 30, 0.1)',
                  padding: '1.5rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(247, 147, 30, 0.2)'
                }}>
                  <h4 style={{ color: '#f7931e', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                    Microsoft Power BI Certification
                  </h4>
                  <p style={{ color: '#ccc', fontSize: '0.9rem' }}>New Horizons</p>
                </div>
              </div>
              
              <div style={{
                background: 'rgba(255, 107, 53, 0.1)',
                padding: '2rem',
                borderRadius: '15px',
                border: '1px solid rgba(255, 107, 53, 0.2)'
              }}>
                <h3 style={{ color: '#f7931e', fontSize: '1.3rem', marginBottom: '1rem' }}>
                  Notable Coursework
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                  <div style={{
                    background: 'rgba(247, 147, 30, 0.1)',
                    padding: '1.5rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(247, 147, 30, 0.2)'
                  }}>
                    <h4 style={{ color: '#f7931e', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                      CS 577 - Introduction to Algorithms
                    </h4>
                    <p style={{ color: '#e0e0e0', fontSize: '0.9rem', lineHeight: '1.5' }}>
                      Basic paradigms for the design and analysis of efficient algorithms: greed, divide-and-conquer, 
                      dynamic programming, reductions, and the use of randomness.
                    </p>
                  </div>
                  <div style={{
                    background: 'rgba(247, 147, 30, 0.1)',
                    padding: '1.5rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(247, 147, 30, 0.2)'
                  }}>
                    <h4 style={{ color: '#f7931e', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                      CS 544 - Big Data Systems
                    </h4>
                    <p style={{ color: '#e0e0e0', fontSize: '0.9rem', lineHeight: '1.5' }}>
                      Deployed and used distributed systems to store and analyze datasets. Experienced various query languages, 
                      processed streaming data, and trained machine learning models using Google Cloud and Linux.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'projects' && (
            <div>
              <h2 style={{
                fontSize: '2.5rem',
                color: '#ff6b35',
                marginBottom: '3rem',
                fontWeight: '600'
              }}>
                Projects
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{
                  background: 'rgba(255, 107, 53, 0.1)',
                  padding: '2rem',
                  borderRadius: '15px',
                  border: '1px solid rgba(255, 107, 53, 0.2)'
                }}>
                  <h3 style={{ color: '#f7931e', fontSize: '1.4rem', marginBottom: '1rem' }}>
                    PlayerPortal - Interactive Game/App Platform
                  </h3>
                  <p style={{ color: '#e0e0e0', lineHeight: '1.6', marginBottom: '1rem' }}>
                    Comprehensive game and app platform featuring: MatchUp game utilizing real-time voting mechanics, smooth UI/UX Design
                    and QR code usage. Catan a fun board game remake centered around multiplayer functionality, real-time firebase integration and advanced game logic.
                    Plus many more apps and games!
                    This personal project demonstrates full-stack development
                    capabilities, real-time data synchronization, and modern web technologies. Includes multiple game modes,
                    QR code joining, host/player interfaces, and dynamic scoring systems.
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {['React', 'TypeScript', 'Firebase', 'Real-time Database', 'Game Logic', 'Responsive Design', 'Multiplayer Connections'].map((tech, index) => (
                      <span key={index} style={{
                        background: 'rgba(247, 147, 30, 0.2)',
                        color: '#f7931e',
                        padding: '0.3rem 0.8rem',
                        borderRadius: '15px',
                        fontSize: '0.8rem'
                      }}>
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{
                  background: 'rgba(255, 107, 53, 0.1)',
                  padding: '2rem',
                  borderRadius: '15px',
                  border: '1px solid rgba(255, 107, 53, 0.2)'
                }}>
                  <h3 style={{ color: '#f7931e', fontSize: '1.4rem', marginBottom: '1rem' }}>
                    Bus Notification Application
                  </h3>
                  <p style={{ color: '#e0e0e0', lineHeight: '1.6', marginBottom: '1rem' }}>
                    Java Application designed for both mobile and desktop use. Incorporates a Java program with various APIs into an HTML website.
                    The project takes a schedule as input and alerts the user about enroute buses at nearby stops in accordance with the user’s
                    schedule and destination locations.
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {['Java', 'HTML', 'API Work', 'Interactive UI', 'Team Leadership'].map((tech, index) => (
                      <span key={index} style={{
                        background: 'rgba(247, 147, 30, 0.2)',
                        color: '#f7931e',
                        padding: '0.3rem 0.8rem',
                        borderRadius: '15px',
                        fontSize: '0.8rem'
                      }}>
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{
                  background: 'rgba(255, 107, 53, 0.1)',
                  padding: '2rem',
                  borderRadius: '15px',
                  border: '1px solid rgba(255, 107, 53, 0.2)'
                }}>
                  <h3 style={{ color: '#f7931e', fontSize: '1.4rem', marginBottom: '1rem' }}>
                    Memory Heap Simulator | C
                  </h3>
                  <p style={{ color: '#e0e0e0', lineHeight: '1.6', marginBottom: '1rem' }}>
                    This project is a memory allocator in C using a best-fit placement policy. It manages memory blocks in a heap, each with a header
                    indicating size and allocation status. The project also implements coalescing and heap display
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {['Memory Management', 'Heap Allocation', 'C'].map((tech, index) => (
                      <span key={index} style={{
                        background: 'rgba(247, 147, 30, 0.2)',
                        color: '#f7931e',
                        padding: '0.3rem 0.8rem',
                        borderRadius: '15px',
                        fontSize: '0.8rem'
                      }}>
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'contact' && (
            <div>
              <h2 style={{
                fontSize: '2.5rem',
                color: '#ff6b35',
                marginBottom: '3rem',
                fontWeight: '600'
              }}>
                Contact
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <div style={{
                  background: 'rgba(255, 107, 53, 0.1)',
                  padding: '2rem',
                  borderRadius: '15px',
                  border: '1px solid rgba(255, 107, 53, 0.2)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📧</div>
                  <h3 style={{ color: '#f7931e', marginBottom: '0.5rem' }}>Email</h3>
                  <p style={{ color: '#e0e0e0' }}>ererdman2@wisc.edu</p>
                </div>
                <div style={{
                  background: 'rgba(255, 107, 53, 0.1)',
                  padding: '2rem',
                  borderRadius: '15px',
                  border: '1px solid rgba(255, 107, 53, 0.2)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>�</div>
                  <h3 style={{ color: '#f7931e', marginBottom: '0.5rem' }}>Phone</h3>
                  <p style={{ color: '#e0e0e0' }}>(608) 377-3475</p>
                </div>
                <div style={{
                  background: 'rgba(255, 107, 53, 0.1)',
                  padding: '2rem',
                  borderRadius: '15px',
                  border: '1px solid rgba(255, 107, 53, 0.2)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>�</div>
                  <h3 style={{ color: '#f7931e', marginBottom: '0.5rem' }}>LinkedIn</h3>
                  <a
                    href="https://www.linkedin.com/in/eric-erdman-527765276/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#e0e0e0',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      fontWeight: 500
                    }}
                  >
                    LinkedIn Profile
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-in {
          animation: fadeIn 0.5s ease-in;
        }
        .animate-out {
          animation: fadeOut 0.1s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOut {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
};

export default EricErdmanResume;
