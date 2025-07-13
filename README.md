# Home Hub - Voice-Controlled Calendar Display

A sophisticated home hub application with voice control using Whisper and Google Calendar integration. Features a full-screen calendar display with a sidebar showing daily activities.

## Features

- **Pi 5 Optimized Display**: Single-screen layout perfect for Raspberry Pi 5 displays
- **Voice-Controlled Interface**: Primary navigation through voice commands
- **Daily Events Overview**: Left panel shows all daily events without scrolling
- **Google Calendar Integration**: Real-time calendar data
- **Modern UI**: Glass morphism design with smooth animations
- **Real-time Updates**: Live calendar data synchronization
- **Voice Image Generation**: Create images using spoken prompts via OpenAI

## Voice Commands

The app uses a wake word system optimized for Pi 5 display:
- **Wake Word**: "Lexicat" (must be said first)
- **Commands**: "Lexicat tomorrow" - Navigate to tomorrow's date
- **Commands**: "Lexicat yesterday" - Navigate to yesterday's date  
- **Commands**: "Lexicat today" - Return to today's view
- **Commands**: "Lexicat next week" - Navigate to next week
- **Commands**: "Lexicat previous week" - Navigate to previous week
- **Commands**: "Lexicat refresh" - Update calendar data
- **Commands**: "Lexicat help" - Show available commands
- **Commands**: "Lexicat switch to calendar" - Display calendar view
- **Commands**: "Lexicat switch to weather" - Display weather view
- **Commands**: "Lexicat switch to news" - Display news view
- **Commands**: "Lexicat switch to tasks" - Display tasks view
- **Page**: `/voice-image` - Generate images from spoken prompts

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom animations
- **Voice Control**: Whisper API integration
- **Calendar**: Google Calendar API
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Google Calendar API credentials (for production)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd home-hub
```

2. Install dependencies:
```bash
npm install
```

3. Start the backend and frontend servers:
```bash
# In one terminal, start the backend proxy server
npm run server

# In another terminal, start the frontend dev server (with proxy to backend)
npm run dev
```
4. Open your browser and navigate to `http://localhost:5173`

### Running via Script

We've provided a launcher script to simplify starting both backend and frontend. Make sure it's executable:

```bash
chmod +x start-home-hub.sh
```

Then run:

```bash
./start-home-hub.sh
```

#### Running on Windows via WSL

If you're on Windows with WSL installed, you can launch Home Hub directly from Windows:

- Double-click `run-home-hub.bat`
- Or in PowerShell, run `.\run-home-hub.ps1`

### Environment Variables

Create a `.env` file in the root directory:

```env
# Google OAuth2 credentials (for calendar access)
VITE_GOOGLE_CLIENT_ID=your_google_oauth2_client_id_here
VITE_GOOGLE_CLIENT_SECRET=your_google_oauth2_client_secret_here
VITE_GOOGLE_CALENDAR_ID=your_calendar_id_here

# Whisper / OpenAI API (optional for voice control)
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### Google Calendar Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Calendar API
4. Create credentials (API Key)
5. Add your calendar ID to the environment variables

## Project Structure

```
src/
├── components/          # React components
│   ├── HomeHub.tsx     # Main application component
│   ├── CalendarDisplay.tsx  # Full-screen calendar
│   ├── Sidebar.tsx     # Daily activities panel
│   ├── VoiceControl.tsx # Voice control interface
│   └── VoiceImage.tsx  # Generate images from voice prompts
├── hooks/              # Custom React hooks
│   └── useCalendar.ts  # Calendar data management
├── types/              # TypeScript type definitions
│   └── calendar.ts     # Calendar event types
├── App.tsx             # Root component
└── main.tsx           # Application entry point
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

### Adding New Features

1. **Voice Commands**: Extend the voice command processing in `VoiceControl.tsx`
2. **Calendar Views**: Add new calendar display modes in `CalendarDisplay.tsx`
3. **Sidebar Widgets**: Create new sidebar components for additional functionality

## Pi 5 Setup

### Raspberry Pi 5 Display Setup

This application is optimized for running on a Raspberry Pi 5 with a display. The interface is designed for voice-controlled navigation using the wake word "Lexicat" without keyboard/mouse input.

#### Deployment Modes

You can choose either:

- **All-in-one Pi mode**: clone, build, and serve both backend and frontend directly on the Pi (steps below).
- **Frontend‑only Pi mode**: run the backend (and optionally host static files) on another machine (e.g. your laptop), and point the Pi’s kiosk browser at that address (e.g. `http://192.168.1.10:5173` for dev or `:3000` for the production build).

Use whichever mode best fits your network and performance requirements.

#### Hardware Requirements
- Raspberry Pi 5
- Display (HDMI or touchscreen)
- Microphone for voice control
- Speakers (optional, for voice feedback)

#### Software Setup

1. **Install Node.js on Pi 5**:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. **Install whisper.cpp**:
```bash
# Install dependencies
sudo apt-get update
sudo apt-get install -y build-essential cmake git

# Clone whisper.cpp
git clone https://github.com/ggerganov/whisper.cpp.git
cd whisper.cpp

# Build whisper.cpp
make

# Download a model (base model is recommended for Pi 5)
bash ./models/download-ggml-model.sh base.en

# Test whisper.cpp
./main -m models/ggml-base.en.bin -f samples/jfk.wav
```

3. **Clone and setup the application**:
```bash
git clone <repository-url>
cd home-hub
npm install
```

4. **Configure environment variables**:
```bash
cp env.example .env
# Edit .env with your Google Calendar credentials and whisper.cpp paths
```

5. **Build for production**:
```bash
npm run build
```

6. **Serve the application**:
```bash
# Install serve globally
npm install -g serve

# Serve the built application
serve -s dist -l 3000
```

#### Auto-start on Boot


1. In your Home Hub folder, run the setup script. Choose one mode:

- **Full Pi mode** (backend + dev frontend on Pi):
  ```bash
  cd ~/Home\ Hub
  sudo bash setup-pi.sh
  ```
- **Kiosk‑only mode** (frontend only; remote backend):
  ```bash
  cd ~/Home\ Hub
  sudo bash setup-pi.sh --kiosk-only http://<YOUR-LAPTOP-IP>:5173
  ```

2. Reboot the Pi to apply:

```bash
sudo reboot
```

## End-to-End Whisper.cpp Setup

Follow these commands verbatim to build whisper.cpp, download a model, configure .env, and launch the backend + frontend:

```bash
cd ~/Home\ Hub
sudo apt update
sudo apt install -y build-essential cmake git ffmpeg
git clone https://github.com/ggerganov/whisper.cpp.git
cd whisper.cpp
make
bash models/download-ggml-model.sh base.en
cd ..
cat > .env << 'EOF'
WHISPER_CPP_PATH=./whisper.cpp/main
WHISPER_MODEL_PATH=./whisper.cpp/models/ggml-base.en.bin
EOF
npm install
npm run server
npm run dev
```

## Deployment

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts to deploy

### Deploy to Netlify

1. Build the project: `npm run build`
2. Drag the `dist/` folder to Netlify
3. Configure environment variables in Netlify dashboard

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please open an issue on GitHub. 
