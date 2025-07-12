# Home Hub - Voice-Controlled Calendar Display

A sophisticated home hub application with voice control using Whisper and Google Calendar integration. Features a full-screen calendar display with a sidebar showing daily activities.

## Features

- **Pi 5 Optimized Display**: Single-screen layout perfect for Raspberry Pi 5 displays
- **Voice-Controlled Interface**: Primary navigation through voice commands
- **Daily Events Overview**: Left panel shows all daily events without scrolling
- **Google Calendar Integration**: Real-time calendar data
- **Modern UI**: Glass morphism design with smooth animations
- **Real-time Updates**: Live calendar data synchronization

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
│   └── VoiceControl.tsx # Voice control interface
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

This application is optimized for running on a Raspberry Pi 5 with a display. The interface is designed for voice-controlled navigation using the wake word "Lexicat" without keyboard/mouse input.

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

1. Create a startup script:
```bash
sudo nano /etc/systemd/system/home-hub.service
```

2. Add the following content:
```ini
[Unit]
Description=Home Hub Calendar Display
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/home-hub
ExecStart=/usr/bin/node /usr/local/bin/serve -s dist -l 3000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

3. Enable and start the service:
```bash
sudo systemctl enable home-hub.service
sudo systemctl start home-hub.service
```

#### Display Configuration

1. **Set display to auto-start**:
```bash
sudo nano ~/.config/lxsession/LXDE-pi/autostart
```

2. Add the following line:
```
@chromium-browser --kiosk --disable-web-security --user-data-dir=/tmp/chrome --no-first-run http://localhost:3000
```

3. **Disable screen saver**:
```bash
sudo nano /etc/xdg/lxsession/LXDE-pi/autostart
```

4. Add:
```
@xset s off
@xset -dpms
@xset s noblank
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
