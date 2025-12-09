# GamePortal

An interactive full-stack web application showcasing AI/ML tools, cryptographic demonstrations, and real-time multiplayer games. Built as a portfolio project to demonstrate professional front-end development skills, machine learning integration, and modern web technologies.

##  Live Demo

[View Live Site](https://ee-portal-bice.vercel.app/)

##  Features

### AI/ML Laboratory
- **Notes to Quiz AI**: Upload handwritten or typed notes and automatically convert them to interactive quizzes
  - Real OCR processing using Tesseract.js
  - PDF text extraction with PDF.js
  - Smart keyword analysis and pattern recognition
  - Multiple question types (multiple choice, true/false, fill-in-the-blank)
  - Training data management for continuous improvement

### Cryptography Museum
Interactive educational showcases exploring cryptographic algorithms:
- **Caesar Cipher**: Historic substitution cipher with live demonstrations
- **Vigenère Cipher**: Polyalphabetic encryption with keyword-based shifts
- **Pseudorandom Functions (PRF)**: Modern cryptographic primitives with mathematical breakdowns
- Each showcase includes step-by-step explanations, security analysis, and interactive demos

### Match Up Game
- Real-time multiplayer memory/matching game
- WebSocket-based synchronization via Firebase
- Supports 8+ concurrent players
- Multi-round gameplay with dynamic prompts
- Host controls and player voting system

### Settlers of Catan Recreation
- Hexagonal board generation
- Resource tile placement algorithm
- Number token distribution (in development)

##  Tech Stack

**Frontend:**
- React 19 with TypeScript
- Vite for build tooling and HMR
- React Router for navigation
- TailwindCSS for styling
- Custom animations and 3D transforms

**Backend & Services:**
- Firebase Realtime Database for multiplayer sync
- Vercel deployment

**AI/ML:**
- TensorFlow.js for machine learning models
- Tesseract.js for OCR text extraction
- PDF.js for document processing

**Development:**
- TypeScript for type safety
- ESLint for code quality

##  Project Stats

- 45+ React components
- 12,000+ lines of TypeScript code
- 6 major feature modules
- 3 cryptographic algorithm implementations (1,670+ lines)
- Real-time database supporting 8+ concurrent users


##  Security

- All sensitive credentials stored in .env.local (never committed)
- .env.example provides template without real values
- Firebase Security Rules control database access
- .gitignore prevents committing sensitive files

##  Features Showcase

### Interactive Cryptography Demonstrations
- Live encryption/decryption tools
- Step-by-step mathematical explanations
- Security analysis and attack scenarios
- Historical context and modern applications

### AI-Powered Study Tools
- Upload images or PDFs of study notes
- Automatic text extraction with OCR
- Intelligent question generation
- Multiple quiz formats
- Training data collection

### Real-Time Multiplayer
- Instant synchronization across players
- Host-controlled game flow
- Player voting and interaction
- Dynamic content generation

##  Contributing

This is a personal portfolio project, but suggestions and feedback are welcome! Feel free to:
- Open issues for bugs or suggestions
- Fork the repository for learning
- Share ideas for new features

##  License

This project is open source and available under the [MIT License](LICENSE).

##  Author

**Eric Erdman**
- LinkedIn: [Eric Erdman](https://www.linkedin.com/in/eric-erdman-527765276)
- GitHub: [@Eric-Erdman](https://github.com/Eric-Erdman)

##  Acknowledgments

- Firebase for real-time database services
- Tesseract.js for OCR capabilities
- TensorFlow.js for ML functionality
- React and Vite teams for excellent tooling

---

**Built for educational and portfolio purposes. Feel free to explore and learn!**
