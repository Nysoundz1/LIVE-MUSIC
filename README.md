# Stage Rig Pro - Live Music Stem Arranger & MD Cue Generator

**Stage Rig Pro** is a live performance digital audio workstation (DAW) & teleprompter built for Musical Directors (MD), live bands, worship teams, keyboardists, and drummers.

---

## 🚀 Key Features

1. **Drift-Free Web Audio Lookahead Engine**:
   - Replaced naive `setInterval` triggering with Chris Wilson's Web Audio lookahead scheduling pattern (100ms lookahead, 25ms timer ticks).
   - Sample-accurate clicks, stem transients, chord pads, and synth bass lines with 0% tempo drift under heavy stage conditions.

2. **Spoken MD Voice Cues & Teleprompter**:
   - Live synthesized speech cues announcing sections 1 bar prior ("*Chorus 1, 2, 3, 4*").
   - Integrated crisp guide chime accentuation for in-ear monitors.

3. **Stage / MD High-Contrast View**:
   - Glare-free, high-contrast dark layout for live stages.
   - Giant numeric bar & beat countdowns (`BAR 7 / 8 • BEAT 3`).
   - Upcoming section announcements.
   - Band Chords & MD Notes prompter in large bold typography.
   - Instant Section Launch Pads for quantised on-the-fly jumping.
   - Vamp / Loop mode (`V` key) and Section Extender (+4 / +8 bars).

4. **Web MIDI Hardware Controller Integration**:
   - Auto-detects connected USB/Bluetooth MIDI pedals and drum pads (e.g., Morningstar, Roland SPD-SX).
   - Pre-mapped stage triggers:
     - `Note 36 (C1) / 60`: Play / Pause
     - `Note 38 (D1) / 62`: Stop / Rewind
     - `Note 40 (E1) / 64`: Next Section
     - `Note 41 (F1) / 65`: Previous Section
     - `Note 43 (G1)`: Vamp / Loop
     - `Note 45 (A1)`: Tap Tempo

5. **Multi-Track Stems & Audio File Loader**:
   - 7 Tracks: Click, MD Voice Cues, Drums, Bass, Keys, Guitars, Vocals.
   - Dedicated hardware output bus assignment (Out 1-2 FOH, Out 3 In-Ear Click/Cues, Out 4 Drums, Out 5 Bass, etc.).
   - Upload custom `.wav` / `.mp3` stem files directly to any track.

6. **Live Performance Setlist Manager**:
   - Preset songs: *Midnight Horizon*, *River of Grace*, *Electric Sunrise*.
   - Instant song switching preserving tempos, keys, and arrangements.

7. **Pro Export Suite**:
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

