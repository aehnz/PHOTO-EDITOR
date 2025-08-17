# VOX-EDIT 🎤✨
## AI Voice Powered Photo Editor

A modern web-based photo editing application that combines the power of AI with voice commands to create an intuitive and accessible image editing experience.

![VOX-EDIT Demo](https://img.shields.io/badge/Status-Active-brightgreen)
![React](https://img.shields.io/badge/React-19.1.0-blue)
![Flask](https://img.shields.io/badge/Flask-3.0.0-green)
![AI](https://img.shields.io/badge/AI-Gemini-orange)

## ✨ Features

### 🎨 Image Editing Capabilities
- *Crop* - Precise image cropping with interactive selection
- *Blur* - Adjustable blur effects with real-time preview
- *Brightness* - Dynamic brightness adjustment
- *Contrast* - Fine-tune image contrast levels
- *Rotate* - Image rotation with custom degree input

### 🎤 Voice Command Integration
- *AI-Powered Parsing* - Uses Google Gemini AI to understand natural language commands
- *Natural Language Processing* - Speak commands like "rotate by 45 degrees" or "blur with radius 10"
- *Real-time Processing* - Instant voice-to-action conversion
- *Multi-language Support* - Currently supports English voice commands

### 🎯 User Experience
- *Modern UI/UX* - Beautiful, responsive design with smooth animations
- *Interactive Controls* - Drag-and-drop cropping, real-time sliders
- *Instant Preview* - See changes in real-time before applying
- *Download Support* - Save edited images in high quality

## 🚀 Quick Start

### Prerequisites

- *Node.js* (v18.0.0 or higher)
- *Python* (v3.8 or higher)
- *npm* (v9.0.0 or higher)
- *pip* (Python package manager)

### Installation

1. *Clone the repository*
   bash
   git clone https://github.com/yourusername/vox-edit.git
   cd vox-edit
   

2. *Install Frontend Dependencies*
   bash
   npm install
   

3. *Install Backend Dependencies*
   bash
   pip install -r requirements.txt
   

4. *Set up Environment Variables*
   Create a .env file in the root directory:
   env
   GEMINI_API_KEY=your_gemini_api_key_here
   STABILITY_API_KEY=your_stability_api_key_here
   

### Running the Application

1. *Start the Backend Server*
   bash
   python -m backend.app
   
   The backend will run on http://localhost:1949

2. *Start the Frontend Development Server*
   bash
   npm run dev
   
   The frontend will run on http://localhost:5173

3. *Open your browser* and navigate to http://localhost:5173

## 🛠️ Development

### Available Scripts

bash
# Frontend Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Check code quality
npm run lint:fix     # Auto-fix linting issues
npm run format       # Format code with Prettier

# Backend Development
python -m backend.app  # Run Flask development server


### Project Structure


VOX-EDIT/
├── src/                    # Frontend React source code
│   ├── App.jsx            # Main application component
│   ├── App.css            # Main styles
│   ├── Button.jsx         # Reusable button component
│   ├── inputFile.jsx      # File upload component
│   ├── main.jsx           # React entry point
│   └── index.css          # Global styles
├── backend/               # Python Flask backend
│   ├── app.py             # Main Flask application
│   ├── functions/         # Image processing functions
│   │   ├── blur.py        # Blur effect implementation
│   │   ├── brightness.py  # Brightness adjustment
│   │   ├── contrast.py    # Contrast adjustment
│   │   ├── crop.py        # Image cropping
│   │   └── rotate.py      # Image rotation
│   ├── routes/            # API routes
│   │   └── voiceCommand.py # Voice command processing
│   └── utilities/         # Utility functions
│       └── utility.py     # AI integration and helpers
├── public/                # Static assets
├── package.json           # Frontend dependencies
├── requirements.txt       # Backend dependencies
├── vite.config.js         # Vite configuration
└── README.md             # This file


## 🔧 Technologies Used

### Frontend
- *React 19.1.0* - Modern UI framework
- *Vite 7.1.1* - Fast build tool and dev server
- *Framer Motion 12.23.12* - Smooth animations and transitions
- *Web Speech API* - Browser-based speech recognition

### Backend
- *Flask 3.0.0* - Python web framework
- *Pillow 10.1.0* - Image processing library
- *Google Generative AI 0.3.2* - AI-powered command parsing
- *Flask-CORS 4.0.0* - Cross-origin resource sharing
- *Requests 2.31.0* - HTTP library for API calls
- *Python-dotenv 1.0.0* - Environment variable management

### AI Integration
- *Google Gemini AI* - Natural language processing for voice commands
- *Stability AI* - Text-to-image generation (optional)

## 🎤 Voice Commands

VOX-EDIT understands natural language commands. Here are some examples:

### Image Editing Commands
- "Rotate the image by 45 degrees"
- "Blur the image with radius 10"
- "Increase brightness by 20%"
- "Crop the image from left 10, top 20, right 30, bottom 40"
- "Adjust contrast to 150%"

### Image Generation Commands
- "Generate a beautiful sunset landscape"
- "Create a photorealistic golden retriever puppy"
- "Make a futuristic cityscape"

## 🔑 API Keys Setup

### Google Gemini AI
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your .env file as GEMINI_API_KEY

### Stability AI (Optional)
1. Visit [Stability AI](https://platform.stability.ai/)
2. Create an account and get an API key
3. Add it to your .env file as STABILITY_API_KEY

## 🚀 Deployment

### Frontend Deployment
bash
npm run build

Deploy the dist folder to your hosting service (Vercel, Netlify, etc.)

### Backend Deployment
bash
# Install production dependencies
pip install gunicorn

# Run with Gunicorn
gunicorn -w 4 -b 0.0.0.0:1949 backend.app:app


## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (git checkout -b feature/amazing-feature)
3. Commit your changes (git commit -m 'Add amazing feature')
4. Push to the branch (git push origin feature/amazing-feature)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- *Google Gemini AI* for natural language processing
- *Stability AI* for text-to-image generation
- *React Team* for the amazing framework
- *Flask Team* for the Python web framework
- *Pillow Team* for image processing capabilities

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/vox-edit/issues) page
2. Create a new issue with detailed information
3. Contact the development team

---

*Made with ❤️ by the VOX-EDIT Developer*
