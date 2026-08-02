# Webcam Heart Rate Monitor

A privacy-first web application that estimates heart rate from webcam video using remote photoplethysmography (rPPG).

## Features

- **Real-time heart rate estimation**: Uses camera-based PPG to detect pulse from subtle skin color changes
- **Privacy-first design**: All video processing happens locally in your browser; no data is uploaded
- **Signal quality monitoring**: Displays live feedback on measurement confidence
- **Calibration period**: 10-second minimum calibration before displaying BPM
- **Live visualization**: Real-time pulse waveform and heart rate trend graphs
- **Session summary**: Detailed measurement results after each session
- **Educational focus**: Transparent about experimental nature and limitations

## Architecture

### Core Modules

```
src/
├── signalProcessing/       # Pure signal processing functions (testable)
│   ├── pos.ts             # POS (Plane-Orthogonal-to-Skin) algorithm
│   ├── fft.ts             # FFT-based frequency analysis
│   ├── detrend.ts         # Signal detrending and normalization
│   ├── bpmEstimator.ts    # BPM calculation from frequency
│   └── confidence.ts      # Signal quality scoring
├── faceDetection/         # MediaPipe Face Landmarker
├── camera/                # Camera stream management
├── components/            # React UI components
├── types/                 # TypeScript type definitions
└── charts/                # Chart.js integration
```

### Signal Processing Pipeline

1. **Capture RGB frames** from detected face regions (forehead, cheeks)
2. **Apply POS algorithm** to extract pulse signal from color changes
3. **Normalize and detrend** the signal to remove slow lighting trends
4. **Compute FFT** on 10–15 second rolling window
5. **Identify peak frequency** in 0.7–3.0 Hz range (42–180 BPM)
6. **Convert to BPM** and smooth using exponential moving average
7. **Calculate confidence** based on illumination, motion, and spectral strength
8. **Gate BPM display** only when confidence exceeds threshold (60%)

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Modern browser with:
  - WebRTC support (`navigator.mediaDevices.getUserMedia`)
  - Canvas API
  - Secure context (HTTPS or localhost)

### Installation

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Build for Production

```bash
npm run build
```

Outputs to `dist/`. Deploy to any static hosting (GitHub Pages, Vercel, Netlify).

## Usage

1. **Grant camera permission** when prompted
2. **Position your face** in the oval guide
3. **Remain still** for 10 seconds during calibration
4. **View your heart rate** once the measurement stabilizes
5. **Continue for 30–60 seconds** for best results
6. **Review the summary** after the session completes

### Best Practices

- Use **even lighting** (avoid harsh shadows or backlighting)
- Keep **your face centered** and still
- Avoid **talking, chewing, or facial expressions**
- Ensure **good camera resolution** (720p+ recommended)
- Measure on **calm, quiet occasions**
- Aim for **60-second sessions** to improve accuracy

## Technical Details

### Remote Photoplethysmography (rPPG)

rPPG estimates heart rate from subtle color changes in skin caused by blood flow:

1. Blood absorbs light differently based on oxygenation (hemoglobin dynamics)
2. As blood pulses through facial capillaries, skin color shifts slightly
3. These changes are captured across RGB channels in video frames
4. Signal processing algorithms isolate the pulse frequency from noise

### POS Algorithm

The **Plane-Orthogonal-to-Skin** algorithm separates PPG signal from ambient lighting trends:

- Computes color differences (R-G, G-B) to isolate blood absorption
- Normalizes across frames to handle varying illumination
- Extracts orthogonal component resistant to motion artifacts

### Frequency Analysis

- FFT identifies the dominant frequency in the pulse bandwidth
- Spectral peak strength indicates signal confidence
- Motion and illumination variations are scored separately

### Confidence Scoring

Signal quality combines four factors:

- **Illumination** (0–1): Brightness level and exposure consistency
- **Motion** (0–1): Frame-to-frame stability
- **Continuity** (0–1): Ratio of captured frames to expected
- **Spectral peak** (0–1): Strength of detected frequency

BPM is only displayed when `score ≥ 0.6` and measurement duration ≥ 10 seconds.

## Known Limitations

- **Requires good lighting**: Shadows, backlighting, or dim environments reduce accuracy
- **Requires stillness**: Facial movement, talking, or chewing interferes with signal
- **Not medical-grade**: Experimental tool, not suitable for diagnostics or health monitoring
- **Limited to frontal faces**: Side profiles or obscured faces will not be detected
- **Averaged estimate**: Shows mean heart rate, not beat-by-beat HRV
- **~±5 BPM typical error**: Under ideal conditions (quiet, well-lit, still)

## Testing

Run unit tests for signal processing:

```bash
npm test
```

Tests include synthetic pulse signals at 60, 72, 90, and 120 BPM to verify FFT detection.

## Privacy & Data

- **No uploads**: Video frames never leave your browser
- **No recording**: Video is not saved to disk
- **No analytics**: No tracking of measurements
- **Session-only**: Results are stored in browser localStorage only, cleared on tab close
- **Open source**: Full code available for inspection

## Deployment

### GitHub Pages

```bash
npm run build
git add dist/
git commit -m "Update dist"
git push
```

Enable GitHub Pages in repo settings → Pages → Deploy from branch `main` → `dist/` folder.

### Vercel

```bash
npm i -g vercel
vercel
```

### Netlify

```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

## Disclaimer

**This is an experimental educational tool, not a medical device.**

The measurement may be inaccurate and should not be used to:
- Diagnose any health condition
- Guide medical treatment decisions
- Replace professional healthcare

For health concerns, consult a qualified healthcare professional.

## References

- [MDN: getUserMedia API](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [MediaPipe Face Landmarker](https://developers.google.com/mediapipe/solutions/vision/face_landmarker)
- [Remote Photoplethysmography: A Review](https://pmc.ncbi.nlm.nih.gov/articles/PMC12181896/) (PMC)
- [Chart.js Documentation](https://www.chartjs.org/)

## License

Educational use. See LICENSE for details.
