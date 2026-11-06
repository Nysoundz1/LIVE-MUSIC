# Stage Rig Pro - Live Music Stem Arranger & MD Cue Generator

**Stage Rig Pro** is a live performance digital audio workstation (DAW) & teleprompter built for Musical Directors (MD), live bands, worship teams, keyboardists, and drummers.

---

## 🚀 Key Features

1. **Drift-Free Web Audio Lookahead Engine**:
   - Built on Chris Wilson's Web Audio lookahead scheduling pattern (100ms lookahead, 25ms timer ticks).
   - Sample-accurate clicks, stem transients, chord pads, and synth bass lines with 0% tempo drift under heavy stage conditions.
   - Master `DynamicsCompressorNode` ceiling limiter to prevent stage clipping.

2. **Natural & Attractive Studio Palette**:
   - Deep obsidian console darkroom surface (`#090C11` background, `#0F141E` hardware panels, `#06080D` acrylic LCD).
   - High-definition organic stem coloring:
     - **Drums**: Warm terracotta (`#E06D53`)
     - **Bass / Sub**: Honey brass & amber (`#E5A93C`)
     - **Keys / Analog Pads**: Crystal sky cyan (`#22D3EE`)
     - **Guitars**: Sage jade (`#34D399`)
     - **Vocals / BGVs**: Rose orchid (`#E879F9`)
   - Clean graphite waveform lanes (`#080A0F`) with 3px section top accents, eliminating visual clutter and color bleed.

3. **Hardware Console Pan Controls & Stereo Split**:
   - Individual track pan dials (`-1.0` Left to `+1.0` Right) with stereo indicator readouts.
   - **1-Click Stereo Split Preset**: Instantly routes Click & MD Voice Cues hard-left (to band In-Ear Monitors) and all musical stems hard-right (to FOH mixer).

4. **Switchable Metronome Sound Engine**:
   - Toggle instantly between **Natural Woodblock**, **High-Pitch Electronic Beep**, and **Crisp Rimshot** clicks.
   - Dynamic accent pitch on beat 1 for confident timekeeping.

5. **Spoken MD Voice Cues & Teleprompter**:
   - Live synthesized speech cues announcing upcoming sections 1 bar prior (*"Chorus 1, 2, 3, 4"*).
   - Integrated crisp guide chime accentuation for in-ear monitors.

6. **Stage / MD High-Contrast View**:
   - Glare-free, high-contrast dark layout for live stages.
   - Giant numeric bar & beat countdowns (`BAR 7 / 8 • BEAT 3`).
   - Upcoming section announcements and transition cues.
   - Band Chords & MD Notes prompter in large bold typography.
   - Instant Section Launch Pads for quantized on-the-fly jumping.
   - Vamp / Loop mode (`V` key) and Section Extender (+4 / +8 bars).

7. **Web MIDI Hardware Controller Integration**:
   - Auto-detects connected USB/Bluetooth MIDI pedals and drum pads (e.g., Morningstar, Roland SPD-SX).
   - Pre-mapped stage triggers:
     - `Note 36 (C1) / 60`: Play / Pause
     - `Note 38 (D1) / 62`: Stop / Rewind
     - `Note 40 (E1) / 64`: Next Section
     - `Note 41 (F1) / 65`: Previous Section
     - `Note 43 (G1)`: Vamp / Loop
     - `Note 45 (A1)`: Tap Tempo

8. **Multi-Track Stems & Audio File Loader**:
   - 7 Tracks: Click, MD Voice Cues, Drums, Bass, Keys, Guitars, Vocals.
   - Dedicated hardware output bus assignment (Out 1-2 FOH, Out 3 In-Ear Click/Cues, Out 4 Drums, Out 5 Bass, etc.).
   - Upload custom `.wav` / `.mp3` stem files directly to any track.

9. **Live Performance Setlist Manager**:
   - Preset songs: *Midnight Horizon*, *River of Grace*, *Electric Sunrise*.
   - Instant song switching preserving tempos, keys, and arrangements.

10. **Pro Export Suite**:
    - **Genuine Ableton Live Set (`.als`)**: True gzip-compressed `.als` archive that opens directly in Ableton Live with all locators and buses pre-mapped.
    - **Standard MIDI Markers (`.mid`)**: Drop into Logic Pro, Pro Tools, Studio One, or Reaper.
    - **Bar-Aligned WAV Click Stem**: 16-bit PCM WAV click track.

---

## ⌨️ Stage Hotkeys

| Key | Action |
| --- | --- |
| `Space` | Play / Pause |
| `Esc` | Stop & Rewind to Bar 1 |
| `→` | Jump to Next Section |
| `←` | Jump to Previous Section |
| `V` | Toggle Vamp / Infinite Section Loop |
| `T` | Tap Tempo |
| `F` | Toggle Stage Teleprompter / Arrange View |
| `↑` / `↓` | Tempo +/- 1 BPM (`Shift + ↑ / ↓` for +/- 5 BPM) |

---

## 🛠️ Development & Running

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```
