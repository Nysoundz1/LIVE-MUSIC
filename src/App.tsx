import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Play,
  Pause,
  Square,
  Repeat,
  Plus,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Headphones,
  Download,
  Upload,
  Sparkles,
  Sliders,
  Maximize2,
  Minimize2,
  Activity,
  Music,
  Mic,
  Disc,
  Layers,
  Check,
  X,
  ArrowRight,
  Settings,
  FileAudio,
  FileCode,
  Zap,
  Radio,
  Clock,
  Split,
  FolderOpen,
  ListMusic,
  Piano,
  Keyboard,
  Printer,
  Edit2,
  Save,
  ArrowUp,
  ArrowDown,
  Volume1,
  FileText
} from 'lucide-react';

// ==========================================
// CONSTANTS & PRESETS
// ==========================================

export interface SectionTypeMeta {
  label: string;
  color: string;
  bg: string;
  border: string;
  intensity: number;
  chords: number[];
  defaultBars: number;
  abletonColor: number;
}

export const SECTION_TYPES: Record<string, SectionTypeMeta> = {
  INTRO: { label: 'Intro', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.18)', border: '#60A5FA', intensity: 0.4, chords: [0, 7, 9, 5], defaultBars: 4, abletonColor: 13 },
  VERSE: { label: 'Verse', color: '#10B981', bg: 'rgba(16, 185, 129, 0.18)', border: '#34D399', intensity: 0.65, chords: [9, 5, 0, 7], defaultBars: 8, abletonColor: 22 },
  PRE_CHORUS: { label: 'Pre-Chorus', color: '#06B6D4', bg: 'rgba(6, 182, 212, 0.18)', border: '#22D3EE', intensity: 0.8, chords: [5, 7, 9, 7], defaultBars: 4, abletonColor: 35 },
  CHORUS: { label: 'Chorus', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.22)', border: '#FBBF24', intensity: 1.0, chords: [5, 0, 7, 9], defaultBars: 8, abletonColor: 9 },
  POST_CHORUS: { label: 'Post-Chorus', color: '#FB923C', bg: 'rgba(251, 146, 60, 0.22)', border: '#FDBA74', intensity: 0.9, chords: [0, 7, 5, 5], defaultBars: 4, abletonColor: 10 },
  BRIDGE: { label: 'Bridge', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.22)', border: '#A78BFA', intensity: 0.85, chords: [2, 9, 0, 7], defaultBars: 8, abletonColor: 42 },
  SOLO: { label: 'Solo / Inst', color: '#EC4899', bg: 'rgba(236, 72, 153, 0.22)', border: '#F472B6', intensity: 0.95, chords: [5, 7, 9, 0], defaultBars: 8, abletonColor: 48 },
  BUILD: { label: 'Build Up', color: '#F43F5E', bg: 'rgba(244, 63, 94, 0.22)', border: '#FB7185', intensity: 0.95, chords: [5, 5, 7, 7], defaultBars: 4, abletonColor: 3 },
  BREAKDOWN: { label: 'Breakdown', color: '#14B8A6', bg: 'rgba(20, 184, 166, 0.18)', border: '#2DD4BF', intensity: 0.45, chords: [0, 9, 5, 7], defaultBars: 4, abletonColor: 26 },
  VAMP: { label: 'Vamp / Pad', color: '#A855F7', bg: 'rgba(168, 85, 247, 0.22)', border: '#C084FC', intensity: 0.6, chords: [0, 5, 0, 5], defaultBars: 4, abletonColor: 41 },
  OUTRO: { label: 'Outro', color: '#64748B', bg: 'rgba(100, 116, 139, 0.2)', border: '#94A3B8', intensity: 0.35, chords: [0, 5, 0, 0], defaultBars: 4, abletonColor: 68 },
};

export interface StemMask {
  drums: boolean;
  bass: boolean;
  keys: boolean;
  guitar: boolean;
  vocals: boolean;
  [key: string]: boolean;
}

export interface SectionItem {
  id: string;
  type: string;
  name: string;
  bars: number;
  stemMask: StemMask;
  chordsText?: string;
  mdNotes?: string;
  customCue?: string;
}

export interface TrackItem {
  id: string;
  name: string;
  category: 'UTILITY' | 'STEM';
  color: string;
  route: string;
  volume: number;
  muted: boolean;
  solo: boolean;
  subdivision?: string;
  voiceEnabled?: boolean;
  audioBuffer?: AudioBuffer | null;
  fileName?: string;
  waveformPeaks?: number[];
}

export interface SongPreset {
  id: string;
  name: string;
  bpm: number;
  timeSig: string;
  musicalKey: string;
  pitchShift: number;
  sections: SectionItem[];
}

export interface MidiMapping {
  playPause: number;
  stop: number;
  nextSec: number;
  prevSec: number;
  vamp: number;
  tapTempo: number;
}

const INITIAL_SECTIONS: SectionItem[] = [
  { id: 'sec-1', type: 'INTRO', name: 'Intro', bars: 4, stemMask: { drums: false, bass: true, keys: true, guitar: true, vocals: false }, chordsText: 'C - G - Am - F', mdNotes: 'Ambient keys & electric guitar swelling', customCue: 'Intro In 4' },
  { id: 'sec-2', type: 'VERSE', name: 'Verse 1', bars: 8, stemMask: { drums: true, bass: true, keys: true, guitar: true, vocals: true }, chordsText: 'Am - F - C - G', mdNotes: 'Drums 4-on-the-floor, bass grooving', customCue: 'Verse 1' },
  { id: 'sec-3', type: 'CHORUS', name: 'Chorus 1', bars: 8, stemMask: { drums: true, bass: true, keys: true, guitar: true, vocals: true }, chordsText: 'F - C - G - Am', mdNotes: 'All in! Big open hi-hat and guitars', customCue: 'Chorus 1' },
  { id: 'sec-4', type: 'BRIDGE', name: 'Bridge', bars: 8, stemMask: { drums: true, bass: true, keys: true, guitar: true, vocals: true }, chordsText: 'Dm - Am - C - G', mdNotes: 'Snare build on bar 7 into final chorus', customCue: 'Bridge' },
  { id: 'sec-5', type: 'CHORUS', name: 'Chorus 2 (Big)', bars: 8, stemMask: { drums: true, bass: true, keys: true, guitar: true, vocals: true }, chordsText: 'F - C - G - Am', mdNotes: 'Double chorus, maximum energy', customCue: 'Big Chorus' },
  { id: 'sec-6', type: 'OUTRO', name: 'Outro', bars: 4, stemMask: { drums: true, bass: true, keys: true, guitar: false, vocals: false }, chordsText: 'C - F - C - C', mdNotes: 'Ringtone ending on acoustic piano', customCue: 'Outro' },
];

const INITIAL_TRACKS: TrackItem[] = [
  { id: 'click', name: 'CLICK TRACK', category: 'UTILITY', color: '#94A3B8', route: 'Out 3 (Click/Cue)', volume: 0.85, muted: false, solo: false, subdivision: '1/4' },
  { id: 'cues', name: 'VOICE CUES (MD)', category: 'UTILITY', color: '#38BDF8', route: 'Out 3 (Click/Cue)', volume: 0.95, muted: false, solo: false, voiceEnabled: true },
  { id: 'drums', name: 'DRUMS STEM', category: 'STEM', color: '#F97316', route: 'Out 4 (Drums)', volume: 0.85, muted: false, solo: false },
  { id: 'bass', name: 'SYNTH & SUB BASS', category: 'STEM', color: '#EAB308', route: 'Out 5 (Bass)', volume: 0.82, muted: false, solo: false },
  { id: 'keys', name: 'KEYS & ANALOG PADS', category: 'STEM', color: '#06B6D4', route: 'Out 6-7 (Keys/Stems)', volume: 0.78, muted: false, solo: false },
  { id: 'guitar', name: 'ELECTRIC GUITARS', category: 'STEM', color: '#22C55E', route: 'Out 6-7 (Keys/Stems)', volume: 0.75, muted: false, solo: false },
  { id: 'vocals', name: 'BGVs & VOX CHOIR', category: 'STEM', color: '#EC4899', route: 'Out 1-2 (Main FOH)', volume: 0.80, muted: false, solo: false },
];

const OUTPUT_ROUTES = [
  'Out 1-2 (Main FOH)',
  'Out 3 (Click/Cue)',
  'Out 4 (Drums)',
  'Out 5 (Bass)',
  'Out 6-7 (Keys/Stems)',
  'Out 8 (Aux Vox)'
];

const KEY_SIGNATURES = ['C Maj', 'Db Maj', 'D Maj', 'Eb Maj', 'E Maj', 'F Maj', 'F# Maj', 'G Maj', 'Ab Maj', 'A Maj', 'Bb Maj', 'B Maj'];

const SONG_PRESETS: SongPreset[] = [
  {
    id: 'song-1',
    name: 'Midnight Horizon (Live Arena Rig)',
    bpm: 122,
    timeSig: '4/4',
    musicalKey: 'C Maj',
    pitchShift: 0,
    sections: INITIAL_SECTIONS
  },
  {
    id: 'song-2',
    name: 'River of Grace (Worship Rig)',
    bpm: 72,
    timeSig: '6/8',
    musicalKey: 'G Maj',
    pitchShift: 0,
    sections: [
      { id: 'w-1', type: 'INTRO', name: 'Intro Pad', bars: 4, stemMask: { drums: false, bass: true, keys: true, guitar: true, vocals: false }, chordsText: 'G - Em - C - D', mdNotes: 'Warm synth pad + volume swells', customCue: 'Intro' },
      { id: 'w-2', type: 'VERSE', name: 'Verse 1', bars: 8, stemMask: { drums: false, bass: true, keys: true, guitar: true, vocals: true }, chordsText: 'G - D - Em - C', mdNotes: 'Acoustic guitar + light bass', customCue: 'Verse 1' },
      { id: 'w-3', type: 'CHORUS', name: 'Chorus 1', bars: 8, stemMask: { drums: true, bass: true, keys: true, guitar: true, vocals: true }, chordsText: 'C - G - D - Em', mdNotes: 'Drums enter with tom groove', customCue: 'Chorus' },
      { id: 'w-4', type: 'BUILD', name: 'Build Up', bars: 4, stemMask: { drums: true, bass: true, keys: true, guitar: true, vocals: true }, chordsText: 'C - D - Em - D/F#', mdNotes: 'Snare roll crescendo', customCue: 'Build It Up' },
      { id: 'w-5', type: 'CHORUS', name: 'Chorus 2 (Full)', bars: 8, stemMask: { drums: true, bass: true, keys: true, guitar: true, vocals: true }, chordsText: 'C - G - D - Em', mdNotes: 'Full band anthem', customCue: 'Big Chorus' },
      { id: 'w-6', type: 'VAMP', name: 'Spontaneous Vamp', bars: 4, stemMask: { drums: true, bass: true, keys: true, guitar: true, vocals: false }, chordsText: 'C - G - D - Em', mdNotes: 'Vamp mode ready for worship leader', customCue: 'Vamp Pad' },
      { id: 'w-7', type: 'OUTRO', name: 'Outro', bars: 4, stemMask: { drums: false, bass: true, keys: true, guitar: false, vocals: false }, chordsText: 'G - G - G - G', mdNotes: 'Piano decay', customCue: 'Ending' }
    ]
  },
  {
    id: 'song-3',
    name: 'Electric Sunrise (Synthwave Live)',
    bpm: 130,
    timeSig: '4/4',
    musicalKey: 'F# Maj',
    pitchShift: 0,
    sections: [
      { id: 'e-1', type: 'INTRO', name: 'Arp Intro', bars: 4, stemMask: { drums: false, bass: false, keys: true, guitar: false, vocals: false }, chordsText: 'F# - D#m - B - C#', mdNotes: 'Analog 16th arpeggio filter sweep', customCue: 'Intro' },
      { id: 'e-2', type: 'BUILD', name: 'Kick & Bass In', bars: 4, stemMask: { drums: true, bass: true, keys: true, guitar: false, vocals: false }, chordsText: 'F# - D#m - B - C#', mdNotes: 'Sidechained kick drops in', customCue: 'Drop In' },
      { id: 'e-3', type: 'CHORUS', name: 'Main Drop', bars: 8, stemMask: { drums: true, bass: true, keys: true, guitar: true, vocals: true }, chordsText: 'B - F# - C# - D#m', mdNotes: 'Heavy lead synths + gated snare', customCue: 'Main Chorus' },
      { id: 'e-4', type: 'BREAKDOWN', name: 'Breakdown', bars: 4, stemMask: { drums: false, bass: true, keys: true, guitar: true, vocals: true }, chordsText: 'D#m - B - F# - C#', mdNotes: 'Sub bass pad & atmospheric vocoder', customCue: 'Breakdown' },
      { id: 'e-5', type: 'CHORUS', name: 'Final Drop', bars: 8, stemMask: { drums: true, bass: true, keys: true, guitar: true, vocals: true }, chordsText: 'B - F# - C# - D#m', mdNotes: 'Pyrotechnics cue at Bar 1', customCue: 'Final Drop' },
      { id: 'e-6', type: 'OUTRO', name: 'Outro Fade', bars: 4, stemMask: { drums: true, bass: true, keys: true, guitar: false, vocals: false }, chordsText: 'F# - F# - F# - F#', mdNotes: 'Fadeout', customCue: 'Outro' }
    ]
  }
];

function pseudoRandom(seed: number) {
  const x = Math.sin(seed * 9999.123) * 10000;
  return x - Math.floor(x);
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function App() {
  // Setlist & Song Master State
  const [setlist, setSetlist] = useState<SongPreset[]>(SONG_PRESETS);
  const [activeSongId, setActiveSongId] = useState('song-1');
  const [projectName, setProjectName] = useState('Midnight Horizon (Live Arena Rig)');
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(122);
  const [timeSig, setTimeSig] = useState('4/4');
  const [musicalKey, setMusicalKey] = useState('C Maj');
  const [pitchShift, setPitchShift] = useState(0);
  const [crossfadeMs, setCrossfadeMs] = useState(15);
  const [reverbTail, setReverbTail] = useState(true);
  const [viewMode, setViewMode] = useState<'ARRANGE' | 'STAGE'>('ARRANGE');
  const [loopSectionId, setLoopSectionId] = useState<string | null>(null);

  // Sections & Tracks State
  const [sections, setSections] = useState<SectionItem[]>(INITIAL_SECTIONS);
  const [tracks, setTracks] = useState<TrackItem[]>(INITIAL_TRACKS);
  const [selectedSectionId, setSelectedSectionId] = useState('sec-1');

  // Drag and drop state for sections
  const [draggedSectionIndex, setDraggedSectionIndex] = useState<number | null>(null);

  // Playhead Position State
  const [currentStep, setCurrentStep] = useState(0);
  const [activeCueBanner, setActiveCueBanner] = useState<string | null>(null);
  const [trackMeters, setTrackMeters] = useState<Record<string, number>>({});

  // Modals & Tools
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiProcessingStep, setAiProcessingStep] = useState(0);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [showSetlistModal, setShowSetlistModal] = useState(false);
  const [showMidiModal, setShowMidiModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showChartModal, setShowChartModal] = useState(false);
  const [showAudioSettingsModal, setShowAudioSettingsModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // MIDI Controller State & Custom Mappings
  const [midiSupported, setMidiSupported] = useState(false);
  const [midiConnectedDevice, setMidiConnectedDevice] = useState<string | null>(null);
  const [midiActivity, setMidiActivity] = useState(false);
  const [midiLearningAction, setMidiLearningAction] = useState<string | null>(null);
  const [midiMappings, setMidiMappings] = useState<MidiMapping>({
    playPause: 36,
    stop: 38,
    nextSec: 40,
    prevSec: 41,
    vamp: 43,
    tapTempo: 45
  });

  // Audio Output Detection
  const [detectedAudioChannels, setDetectedAudioChannels] = useState<number>(2);

  // Tap Tempo State
  const tapTimesRef = useRef<number[]>([]);

  // Web Audio Lookahead Engine Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const isPlayingRef = useRef(false);
  const stepRef = useRef(0);
  const nextStepTimeRef = useRef(0);
  const sectionsRef = useRef(sections);
  const tracksRef = useRef(tracks);
  const bpmRef = useRef(bpm);
  const pitchShiftRef = useRef(pitchShift);
  const loopSectionIdRef = useRef(loopSectionId);
  const timeSigRef = useRef(timeSig);
  const timelineContainerRef = useRef<HTMLDivElement | null>(null);
  const lookaheadTimerRef = useRef<number | null>(null);
  const midiMappingsRef = useRef(midiMappings);
  const midiLearningActionRef = useRef(midiLearningAction);

  useEffect(() => { sectionsRef.current = sections; }, [sections]);
  useEffect(() => { tracksRef.current = tracks; }, [tracks]);
  useEffect(() => { bpmRef.current = bpm; }, [bpm]);
  useEffect(() => { pitchShiftRef.current = pitchShift; }, [pitchShift]);
  useEffect(() => { loopSectionIdRef.current = loopSectionId; }, [loopSectionId]);
  useEffect(() => { timeSigRef.current = timeSig; }, [timeSig]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { midiMappingsRef.current = midiMappings; }, [midiMappings]);
  useEffect(() => { midiLearningActionRef.current = midiLearningAction; }, [midiLearningAction]);

  const beatsPerBar = useMemo(() => {
    if (timeSig === '3/4') return 3;
    if (timeSig === '6/8') return 6;
    return 4;
  }, [timeSig]);

  const stepsPerBar = beatsPerBar * 4;

  const enrichedSections = useMemo(() => {
    let accBars = 0;
    return sections.map((sec, index) => {
      const startBar = accBars;
      const endBar = accBars + sec.bars;
      const startStep = startBar * stepsPerBar;
      const endStep = endBar * stepsPerBar;
      accBars = endBar;
      const meta = SECTION_TYPES[sec.type] || SECTION_TYPES.VERSE;
      return {
        ...sec,
        index,
        startBar,
        endBar,
        startStep,
        endStep,
        meta
      };
    });
  }, [sections, stepsPerBar]);

  const totalBars = useMemo(() => {
    return enrichedSections.reduce((sum, s) => sum + s.bars, 0);
  }, [enrichedSections]);

  const totalSteps = totalBars * stepsPerBar;

  const activeSectionInfo = useMemo(() => {
    const found = enrichedSections.find(s => currentStep >= s.startStep && currentStep < s.endStep)
      || enrichedSections[0] || {
        id: 'sec-none',
        type: 'INTRO',
        name: 'Empty',
        bars: 4,
        stemMask: { drums: true, bass: true, keys: true, guitar: true, vocals: true },
        index: 0,
        startBar: 0,
        endBar: 4,
        startStep: 0,
        endStep: 16,
        meta: SECTION_TYPES.INTRO
      };
    const nextSec = enrichedSections[found.index + 1] || null;
    const stepInSection = Math.max(0, currentStep - found.startStep);
    const totalSectionSteps = Math.max(1, found.bars * stepsPerBar);
    const progress = Math.min(100, (stepInSection / totalSectionSteps) * 100);
    const currentBarInSec = Math.floor(stepInSection / stepsPerBar) + 1;
    const currentBeatInBar = Math.floor((stepInSection % stepsPerBar) / 4) + 1;
    return { current: found, next: nextSec, progress, currentBarInSec, currentBeatInBar };
  }, [enrichedSections, currentStep, stepsPerBar]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const initAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
      if (audioCtxRef.current.destination.maxChannelCount) {
        setDetectedAudioChannels(audioCtxRef.current.destination.maxChannelCount);
      }
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  }, []);

  const isTrackAudible = (trackId: string, allTracks: TrackItem[]) => {
    const anySolo = allTracks.some(t => t.solo);
    const t = allTracks.find(tr => tr.id === trackId);
    if (!t) return false;
    if (t.muted) return false;
    if (anySolo && !t.solo) return false;
    return t.volume > 0.01;
  };

  const getTrackVolume = (trackId: string, allTracks: TrackItem[]) => {
    const t = allTracks.find(tr => tr.id === trackId);
    return t ? t.volume : 0.8;
  };

  const triggerVoiceCue = useCallback((cueText: string, vol: number, targetTime?: number) => {
    setActiveCueBanner(cueText);
    setTimeout(() => setActiveCueBanner(null), 2000);

    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(cueText);
        utter.rate = Math.min(1.4, Math.max(0.9, bpmRef.current / 110));
        utter.pitch = 1.0;
        utter.volume = Math.min(1, vol);
        window.speechSynthesis.speak(utter);
      } catch {
        // Fallback tone handles sound
      }
    }

    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const now = targetTime !== undefined ? targetTime : ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.09);
    gain.gain.setValueAtTime(vol * 0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  }, []);

  const scheduleAudioStep = useCallback((stepIndex: number, scheduledTime: number) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const allTracks = tracksRef.current;
    const curBeatsPerBar = timeSigRef.current === '3/4' ? 3 : timeSigRef.current === '6/8' ? 6 : 4;
    const curStepsPerBar = curBeatsPerBar * 4;

    let accBars = 0;
    let activeSec: (SectionItem & { startStep: number; endStep: number; meta: SectionTypeMeta }) | null = null;
    let nextSec: SectionItem | null = null;
    const rawSections = sectionsRef.current;

    for (let i = 0; i < rawSections.length; i++) {
      const s = rawSections[i];
      const sStart = accBars * curStepsPerBar;
      const sEnd = (accBars + s.bars) * curStepsPerBar;
      if (stepIndex >= sStart && stepIndex < sEnd) {
        activeSec = { ...s, startStep: sStart, endStep: sEnd, meta: SECTION_TYPES[s.type] || SECTION_TYPES.VERSE };
        nextSec = rawSections[i + 1] || null;
        if (loopSectionIdRef.current === s.id) {
          nextSec = s;
        }
        break;
      }
      accBars += s.bars;
    }

    if (!activeSec) return;

    const stepInBar = stepIndex % curStepsPerBar;
    const isQuarterBeat = stepInBar % 4 === 0;
    const isEighthBeat = stepInBar % 2 === 0;
    const stepsRemainingInSection = activeSec.endStep - stepIndex;

    const newMeters: Record<string, number> = {};

    // 1. CLICK TRACK
    const clickTrack = allTracks.find(t => t.id === 'click');
    if (isTrackAudible('click', allTracks)) {
      const clickVol = getTrackVolume('click', allTracks);
      const shouldClick = clickTrack?.subdivision === '1/8' ? isEighthBeat : isQuarterBeat;
      if (shouldClick) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const isDownbeat = stepInBar === 0;
        osc.type = isDownbeat ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(isDownbeat ? 1700 : isQuarterBeat ? 1150 : 850, scheduledTime);
        gain.gain.setValueAtTime(clickVol * (isDownbeat ? 0.45 : isQuarterBeat ? 0.28 : 0.12), scheduledTime);
        gain.gain.exponentialRampToValueAtTime(0.001, scheduledTime + 0.045);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(scheduledTime);
        osc.stop(scheduledTime + 0.05);
        newMeters.click = isDownbeat ? 0.95 : 0.65;
      }
    }

    // 2. VOICE CUES (MD GUIDE)
    if (isTrackAudible('cues', allTracks)) {
      const cueVol = getTrackVolume('cues', allTracks);
      const spokenName = nextSec?.customCue || nextSec?.name || 'Section';
      if (nextSec && stepsRemainingInSection === curStepsPerBar) {
        triggerVoiceCue(`${spokenName}`, cueVol, scheduledTime);
        newMeters.cues = 0.95;
      } else if (nextSec && stepsRemainingInSection === 12) {
        triggerVoiceCue('2', cueVol * 0.85, scheduledTime);
        newMeters.cues = 0.75;
      } else if (nextSec && stepsRemainingInSection === 8) {
        triggerVoiceCue('3', cueVol * 0.85, scheduledTime);
        newMeters.cues = 0.75;
      } else if (nextSec && stepsRemainingInSection === 4) {
        triggerVoiceCue('4', cueVol * 0.9, scheduledTime);
        newMeters.cues = 0.85;
      }
    }

    const intensity = activeSec.meta.intensity;
    const mask = activeSec.stemMask || { drums: true, bass: true, keys: true, guitar: true, vocals: true };
    const semitoneOffset = pitchShiftRef.current;

    const barInSec = Math.floor((stepIndex - activeSec.startStep) / curStepsPerBar);
    const chordSemitone = activeSec.meta.chords[barInSec % activeSec.meta.chords.length];
    const midiToFreq = (m: number) => 440 * Math.pow(2, (m + semitoneOffset - 69) / 12);

    // 3. DRUMS STEM
    if (mask.drums && isTrackAudible('drums', allTracks)) {
      const drumVol = getTrackVolume('drums', allTracks) * intensity;
      const isKick = stepInBar === 0 || stepInBar === 8 || (intensity > 0.7 && stepInBar === 10);
      const isSnare = stepInBar === 4 || stepInBar === 12;
      const isHat = stepInBar % 2 === 0 || (intensity >= 0.85 && stepInBar % 1 === 0);

      if (isKick) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(140, scheduledTime);
        osc.frequency.exponentialRampToValueAtTime(40, scheduledTime + 0.11);
        gain.gain.setValueAtTime(drumVol * 0.72, scheduledTime);
        gain.gain.exponentialRampToValueAtTime(0.001, scheduledTime + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(scheduledTime);
        osc.stop(scheduledTime + 0.19);
        newMeters.drums = Math.max(newMeters.drums || 0, 0.92 * intensity);
      }

      if (isSnare) {
        const bufferSize = Math.floor(ctx.sampleRate * 0.12);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(360, scheduledTime);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(drumVol * 0.44, scheduledTime);
        gain.gain.exponentialRampToValueAtTime(0.001, scheduledTime + 0.12);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(scheduledTime);
        newMeters.drums = Math.max(newMeters.drums || 0, 0.88 * intensity);
      } else if (isHat) {
        const bufferSize = Math.floor(ctx.sampleRate * 0.04);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(6800, scheduledTime);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(drumVol * (stepInBar % 4 === 0 ? 0.16 : 0.09), scheduledTime);
        gain.gain.exponentialRampToValueAtTime(0.001, scheduledTime + 0.038);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(scheduledTime);
        newMeters.drums = Math.max(newMeters.drums || 0, 0.45 * intensity);
      }
    }

    // 4. BASS STEM
    if (mask.bass && isTrackAudible('bass', allTracks)) {
      const bassVol = getTrackVolume('bass', allTracks);
      if (isEighthBeat) {
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        const bassMidi = 36 + chordSemitone + (stepInBar === 14 ? 7 : 0);
        osc.frequency.setValueAtTime(midiToFreq(bassMidi), scheduledTime);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(230 + intensity * 380, scheduledTime);
        filter.frequency.exponentialRampToValueAtTime(95, scheduledTime + 0.18);
        gain.gain.setValueAtTime(bassVol * 0.32 * intensity, scheduledTime);
        gain.gain.exponentialRampToValueAtTime(0.001, scheduledTime + 0.21);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(scheduledTime);
        osc.stop(scheduledTime + 0.22);
        newMeters.bass = 0.78 * intensity;
      }
    }

    // 5. KEYS & PADS
    if (mask.keys && isTrackAudible('keys', allTracks)) {
      const keysVol = getTrackVolume('keys', allTracks);
      if (stepInBar === 0 || (intensity >= 0.8 && stepInBar === 8)) {
        const chordIntervals = [0, 4, 7, 12];
        chordIntervals.forEach((interval) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(midiToFreq(60 + chordSemitone + interval), scheduledTime);
          const dur = stepInBar === 0 && intensity < 0.8 ? 1.5 : 0.75;
          gain.gain.setValueAtTime(0.001, scheduledTime);
          gain.gain.linearRampToValueAtTime(keysVol * 0.08 * intensity, scheduledTime + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0008, scheduledTime + dur);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(scheduledTime);
          osc.stop(scheduledTime + dur + 0.02);
        });
        newMeters.keys = 0.72 * intensity;
      }
    }

    // 6. ELECTRIC GUITARS
    if (mask.guitar && isTrackAudible('guitar', allTracks)) {
      const gtrVol = getTrackVolume('guitar', allTracks);
      const arpPattern = [0, 7, 12, 7, 4, 7, 12, 16];
      if (stepInBar % 2 === 0) {
        const noteOffset = arpPattern[(stepInBar / 2) % arpPattern.length];
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(midiToFreq(60 + chordSemitone + noteOffset), scheduledTime);
        gain.gain.setValueAtTime(gtrVol * 0.14 * intensity, scheduledTime);
        gain.gain.exponentialRampToValueAtTime(0.001, scheduledTime + 0.16);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(scheduledTime);
        osc.stop(scheduledTime + 0.17);
        newMeters.guitar = 0.68 * intensity;
      }
    }

    // 7. VOCALS / BGV CHOIR
    if (mask.vocals && isTrackAudible('vocals', allTracks)) {
      const voxVol = getTrackVolume('vocals', allTracks);
      if (stepInBar === 0 || stepInBar === 6 || stepInBar === 12) {
        const melodyOffsets: Record<number, number> = { 0: 7, 6: 9, 12: 12 };
        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        const freq = midiToFreq(60 + chordSemitone + (melodyOffsets[stepInBar] || 7));
        osc.type = 'sine';
        osc2.type = 'triangle';
        osc.frequency.setValueAtTime(freq, scheduledTime);
        osc2.frequency.setValueAtTime(freq * 1.003, scheduledTime);
        gain.gain.setValueAtTime(0.001, scheduledTime);
        gain.gain.linearRampToValueAtTime(voxVol * 0.12 * intensity, scheduledTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, scheduledTime + 0.42);
        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc.start(scheduledTime);
        osc2.start(scheduledTime);
        osc.stop(scheduledTime + 0.44);
        osc2.stop(scheduledTime + 0.44);
        newMeters.vocals = 0.82 * intensity;
      }
    }

    setTrackMeters(newMeters);
  }, [triggerVoiceCue]);

  useEffect(() => {
    if (!isPlaying) {
      if (lookaheadTimerRef.current) window.clearInterval(lookaheadTimerRef.current);
      setTrackMeters({});
      return;
    }

    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const lookahead = 0.1;
    nextStepTimeRef.current = ctx.currentTime + 0.01;

    const scheduler = () => {
      const secondsPerBeat = 60.0 / bpmRef.current;
      const secondsPer16th = secondsPerBeat / 4.0;
      const curBeats = timeSigRef.current === '3/4' ? 3 : timeSigRef.current === '6/8' ? 6 : 4;
      const curStepsPerBar = curBeats * 4;

      while (nextStepTimeRef.current < ctx.currentTime + lookahead) {
        const curStep = stepRef.current;
        scheduleAudioStep(curStep, nextStepTimeRef.current);
        setCurrentStep(curStep);

        let accBars = 0;
        let loopedNextStep: number | null = null;
        for (const s of sectionsRef.current) {
          const sStart = accBars * curStepsPerBar;
          const sEnd = (accBars + s.bars) * curStepsPerBar;
          if (loopSectionIdRef.current === s.id && curStep + 1 >= sEnd) {
            loopedNextStep = sStart;
            break;
          }
          accBars += s.bars;
        }

        const maxSteps = Math.max(1, accBars * curStepsPerBar);
        if (loopedNextStep !== null) {
          stepRef.current = loopedNextStep;
        } else {
          stepRef.current = (curStep + 1) % maxSteps;
        }

        nextStepTimeRef.current += secondsPer16th;
      }
    };

    lookaheadTimerRef.current = window.setInterval(scheduler, 25);
    return () => {
      if (lookaheadTimerRef.current) window.clearInterval(lookaheadTimerRef.current);
    };
  }, [isPlaying, scheduleAudioStep]);

  const handlePlayPause = useCallback(() => {
    initAudioContext();
    if (isPlayingRef.current) {
      setIsPlaying(false);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    } else {
      setIsPlaying(true);
    }
  }, [initAudioContext]);

  const handleStop = useCallback(() => {
    setIsPlaying(false);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    stepRef.current = 0;
    setCurrentStep(0);
    setTrackMeters({});
  }, []);

  const jumpToSection = useCallback((sec: SectionItem & { startStep: number }) => {
    initAudioContext();
    stepRef.current = sec.startStep;
    setCurrentStep(sec.startStep);
    setSelectedSectionId(sec.id);
    if (audioCtxRef.current) {
      nextStepTimeRef.current = audioCtxRef.current.currentTime;
    }
    if (isPlayingRef.current) {
      triggerVoiceCue(`Jumping to ${sec.name}`, 0.9);
    }
  }, [initAudioContext, triggerVoiceCue]);

  const jumpToNextSection = useCallback(() => {
    if (activeSectionInfo.next) {
      jumpToSection(activeSectionInfo.next as unknown as SectionItem & { startStep: number });
    }
  }, [activeSectionInfo, jumpToSection]);

  const jumpToPrevSection = useCallback(() => {
    const currentIndex = activeSectionInfo.current.index;
    if (currentIndex > 0) {
      const prev = enrichedSections[currentIndex - 1];
      if (prev) jumpToSection(prev);
    }
  }, [activeSectionInfo, enrichedSections, jumpToSection]);

  const handleTapTempo = useCallback(() => {
    const now = Date.now();
    const taps = tapTimesRef.current;
    if (taps.length > 0 && now - taps[taps.length - 1] > 2000) {
      taps.length = 0;
    }
    taps.push(now);
    if (taps.length > 4) taps.shift();

    if (taps.length >= 2) {
      let totalDiff = 0;
      for (let i = 1; i < taps.length; i++) {
        totalDiff += taps[i] - taps[i - 1];
      }
      const avgMs = totalDiff / (taps.length - 1);
      const calculatedBpm = Math.round(60000 / avgMs);
      if (calculatedBpm >= 60 && calculatedBpm <= 200) {
        setBpm(calculatedBpm);
        showToast(`Tapped Tempo: ${calculatedBpm} BPM`);
      }
    }
  }, [showToast]);

  // Stage Hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handlePlayPause();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        handleStop();
      } else if (e.key === 'v' || e.key === 'V') {
        e.preventDefault();
        setLoopSectionId(prev => prev ? null : activeSectionInfo.current?.id);
        showToast(loopSectionId ? 'Vamp Disabled' : `Vamp Active on ${activeSectionInfo.current?.name}`);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        jumpToNextSection();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        jumpToPrevSection();
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        handleTapTempo();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        setViewMode(v => v === 'STAGE' ? 'ARRANGE' : 'STAGE');
      } else if (e.key === 'p' || e.key === 'P') {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          setShowChartModal(true);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setBpm(b => Math.min(180, b + (e.shiftKey ? 5 : 1)));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setBpm(b => Math.max(60, b - (e.shiftKey ? 5 : 1)));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePlayPause, handleStop, jumpToNextSection, jumpToPrevSection, handleTapTempo, activeSectionInfo, loopSectionId, showToast]);

  // Web MIDI & MIDI Learn
  useEffect(() => {
    if ('requestMIDIAccess' in navigator) {
      setMidiSupported(true);
      navigator.requestMIDIAccess?.().then(
        (midiAccess) => {
          let firstDevice = 'Virtual / USB MIDI';
          for (const input of midiAccess.inputs.values()) {
            firstDevice = input.name || 'MIDI Input Device';
            input.onmidimessage = (message) => {
              const data = message.data;
              if (!data) return;
              const status = data[0] & 0xf0;
              const note = data[1];
              const velocity = data[2];

              if (status === 0x90 && velocity > 0) {
                setMidiActivity(true);
                setTimeout(() => setMidiActivity(false), 200);

                // Handle MIDI Learn
                if (midiLearningActionRef.current) {
                  const action = midiLearningActionRef.current as keyof MidiMapping;
                  setMidiMappings(prev => ({ ...prev, [action]: note }));
                  setMidiLearningAction(null);
                  showToast(`Mapped ${action} to MIDI Note ${note}!`);
                  return;
                }

                // Normal MIDI Triggering
                const m = midiMappingsRef.current;
                if (note === m.playPause) handlePlayPause();
                else if (note === m.stop) handleStop();
                else if (note === m.nextSec) jumpToNextSection();
                else if (note === m.prevSec) jumpToPrevSection();
                else if (note === m.vamp) setLoopSectionId(prev => prev ? null : activeSectionInfo.current?.id);
                else if (note === m.tapTempo) handleTapTempo();
              }
            };
          }
          setMidiConnectedDevice(firstDevice);
        },
        () => {
          setMidiSupported(false);
        }
      );
    }
  }, [handlePlayPause, handleStop, jumpToNextSection, jumpToPrevSection, handleTapTempo, activeSectionInfo, showToast]);

  // Section Drag & Drop Reordering
  const handleDragStart = (idx: number) => {
    setDraggedSectionIndex(idx);
  };

  const handleDragOver = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (draggedSectionIndex === null || draggedSectionIndex === targetIdx) return;
    const updated = [...sections];
    const [moved] = updated.splice(draggedSectionIndex, 1);
    updated.splice(targetIdx, 0, moved);
    setSections(updated);
    setDraggedSectionIndex(targetIdx);
  };

  const handleDragEnd = () => {
    setDraggedSectionIndex(null);
  };

  const duplicateSection = (sec: SectionItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newId = `sec-${Date.now()}`;
    const idx = sections.findIndex(s => s.id === sec.id);
    const copy: SectionItem = {
      ...sec,
      id: newId,
      name: `${sec.name} (x2)`,
      stemMask: { ...sec.stemMask }
    };
    const updated = [...sections];
    updated.splice(idx + 1, 0, copy);
    setSections(updated);
    setSelectedSectionId(newId);
    showToast(`Duplicated "${sec.name}" (+${sec.bars} Bars)`);
  };

  const splitSection = (sec: SectionItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (sec.bars <= 2) {
      showToast('Section too short to split (min 2 bars)');
      return;
    }
    const idx = sections.findIndex(s => s.id === sec.id);
    const halfBars = Math.floor(sec.bars / 2);
    const secA: SectionItem = { ...sec, bars: halfBars, name: `${sec.name} Pt. 1` };
    const secB: SectionItem = {
      ...sec,
      id: `sec-${Date.now()}`,
      bars: sec.bars - halfBars,
      name: `${sec.name} Pt. 2`,
      stemMask: { ...sec.stemMask }
    };
    const updated = [...sections];
    updated.splice(idx, 1, secA, secB);
    setSections(updated);
    showToast(`Split "${sec.name}" into two ${halfBars}-bar sections`);
  };

  const moveSection = (idx: number, direction: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= sections.length) return;
    const updated = [...sections];
    const [moved] = updated.splice(idx, 1);
    updated.splice(targetIdx, 0, moved);
    setSections(updated);
    showToast(`Moved "${moved.name}" ${direction < 0 ? 'left' : 'right'}`);
  };

  const deleteSection = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (sections.length <= 1) {
      showToast('Arrangement must contain at least 1 section');
      return;
    }
    const target = sections.find(s => s.id === id);
    const updated = sections.filter(s => s.id !== id);
    setSections(updated);
    if (selectedSectionId === id) setSelectedSectionId(updated[0].id);
    if (loopSectionId === id) setLoopSectionId(null);
    showToast(`Removed "${target?.name}"`);
  };

  const updateSectionBars = (id: string, delta: number) => {
    setSections(prev => prev.map(s => {
      if (s.id !== id) return s;
      const nextBars = Math.max(2, Math.min(64, s.bars + delta));
      return { ...s, bars: nextBars };
    }));
  };

  const toggleSectionStemMask = (secId: string, stemKey: string) => {
    setSections(prev => prev.map(s => {
      if (s.id !== secId) return s;
      return {
        ...s,
        stemMask: {
          ...s.stemMask,
          [stemKey]: !s.stemMask[stemKey]
        }
      };
    }));
  };

  const addNewSection = (typeKey: string, customName?: string, barsCount?: number) => {
    const meta = SECTION_TYPES[typeKey] || SECTION_TYPES.VERSE;
    const newSec: SectionItem = {
      id: `sec-${Date.now()}`,
      type: typeKey,
      name: customName || meta.label,
      bars: barsCount || meta.defaultBars,
      stemMask: {
        drums: typeKey !== 'INTRO' && typeKey !== 'VAMP',
        bass: true,
        keys: true,
        guitar: typeKey !== 'OUTRO',
        vocals: typeKey === 'VERSE' || typeKey === 'CHORUS' || typeKey === 'PRE_CHORUS' || typeKey === 'BRIDGE'
      },
      chordsText: 'C - G - Am - F',
      mdNotes: 'Band dynamic entrance',
      customCue: meta.label
    };
    setSections([...sections, newSec]);
    setSelectedSectionId(newSec.id);
    setShowAddSectionModal(false);
    showToast(`Added [${newSec.name} - ${newSec.bars} Bars]`);
  };

  const toggleMute = (id: string) => {
    setTracks(prev => prev.map(t => t.id === id ? { ...t, muted: !t.muted } : t));
  };

  const toggleSolo = (id: string) => {
    setTracks(prev => prev.map(t => t.id === id ? { ...t, solo: !t.solo } : t));
  };

  const changeVolume = (id: string, val: number) => {
    setTracks(prev => prev.map(t => t.id === id ? { ...t, volume: val } : t));
  };

  const changeRoute = (id: string, route: string) => {
    setTracks(prev => prev.map(t => t.id === id ? { ...t, route } : t));
  };

  const toggleClickSubdivision = () => {
    setTracks(prev => prev.map(t => {
      if (t.id !== 'click') return t;
      const nextSub = t.subdivision === '1/4' ? '1/8' : t.subdivision === '1/8' ? '1/16' : '1/4';
      return { ...t, subdivision: nextSub };
    }));
  };

  // Audio File Upload & Waveform Extraction
  const handleAudioFileUpload = async (trackId: string, file: File) => {
    initAudioContext();
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

      // Extract 64 representative peaks for real waveform rendering
      const rawData = audioBuffer.getChannelData(0);
      const samples = 64;
      const blockSize = Math.floor(rawData.length / samples);
      const peaks: number[] = [];
      for (let i = 0; i < samples; i++) {
        let blockStart = blockSize * i;
        let sum = 0;
        for (let j = 0; j < blockSize; j += 10) {
          sum += Math.abs(rawData[blockStart + j]);
        }
        peaks.push(Math.min(1, (sum / (blockSize / 10)) * 2.5));
      }

      setTracks(prev => prev.map(t => {
        if (t.id !== trackId) return t;
        return {
          ...t,
          audioBuffer,
          fileName: file.name,
          waveformPeaks: peaks
        };
      }));
      showToast(`Loaded ${file.name} for ${trackId.toUpperCase()}`);
    } catch {
      showToast('Failed to decode audio file. Please try WAV or MP3.');
    }
  };

  // Setlist Operations
  const loadSongFromSetlist = (song: SongPreset) => {
    setActiveSongId(song.id);
    setProjectName(song.name);
    setBpm(song.bpm);
    setTimeSig(song.timeSig);
    setMusicalKey(song.musicalKey);
    setPitchShift(song.pitchShift);
    setSections(song.sections);
    setSelectedSectionId(song.sections[0]?.id || 'sec-1');
    stepRef.current = 0;
    setCurrentStep(0);
    setShowSetlistModal(false);
    showToast(`Loaded "${song.name}"`);
  };

  const addNewSongToSetlist = () => {
    const newSong: SongPreset = {
      id: `song-${Date.now()}`,
      name: `New Song (${setlist.length + 1})`,
      bpm: 120,
      timeSig: '4/4',
      musicalKey: 'C Maj',
      pitchShift: 0,
      sections: [
        { id: `sec-${Date.now()}-1`, type: 'INTRO', name: 'Intro', bars: 4, stemMask: { drums: false, bass: true, keys: true, guitar: true, vocals: false }, chordsText: 'C - G - Am - F', mdNotes: 'Intro build' },
        { id: `sec-${Date.now()}-2`, type: 'VERSE', name: 'Verse 1', bars: 8, stemMask: { drums: true, bass: true, keys: true, guitar: true, vocals: true }, chordsText: 'Am - F - C - G', mdNotes: 'Full band in' },
        { id: `sec-${Date.now()}-3`, type: 'CHORUS', name: 'Chorus 1', bars: 8, stemMask: { drums: true, bass: true, keys: true, guitar: true, vocals: true }, chordsText: 'F - C - G - Am', mdNotes: 'Anthem hook' }
      ]
    };
    setSetlist([...setlist, newSong]);
    showToast(`Added "${newSong.name}" to Setlist`);
  };

  const deleteSongFromSetlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (setlist.length <= 1) {
      showToast('Setlist must have at least 1 song');
      return;
    }
    const updated = setlist.filter(s => s.id !== id);
    setSetlist(updated);
    if (activeSongId === id) {
      loadSongFromSetlist(updated[0]);
    }
  };

  // Export Setlist JSON
  const exportSetlistJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(setlist, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "Live_Stage_Rig_Setlist.json");
    dlAnchor.click();
    showToast('Exported Setlist JSON file!');
  };

  // Import Setlist JSON
  const importSetlistJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          setSetlist(imported);
          loadSongFromSetlist(imported[0]);
          showToast(`Imported Setlist with ${imported.length} songs!`);
        }
      } catch {
        showToast('Invalid Setlist JSON file');
      }
    };
    reader.readAsText(file);
  };

  // Generate Ableton ALS XML
  const generateAbletonAlsXml = () => {
    const locatorsXml = enrichedSections.map((sec, idx) => {
      const beatTime = sec.startBar * beatsPerBar;
      return `      <Locator Id="${idx}">
        <LomId Value="0" />
        <Time Value="${beatTime}" />
        <Name Value="${sec.name.replace(/"/g, '')}" />
        <Annotation Value="StemArranger Pro (${sec.bars} Bars) - ${sec.chordsText || ''}" />
        <IsSongStart Value="${idx === 0 ? 'true' : 'false'}" />
      </Locator>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<Ableton MajorVersion="5" MinorVersion="11.0_433" Creator="Live Stem Arranger Pro">
  <LiveSet>
    <Tempo><Manual Value="${bpm}" /></Tempo>
    <TimeSignature><Numerator Value="${beatsPerBar}" /><Denominator Value="4" /></TimeSignature>
    <Locators>
      <Locators>
${locatorsXml}
      </Locators>
    </Locators>
    <Tracks>
${tracks.map((t, i) => `      <AudioTrack Id="${i}" Name="${t.name}" OutputRoute="${t.route}" Volume="${t.volume}" />`).join('\n')}
    </Tracks>
  </LiveSet>
</Ableton>`;
  };

  const downloadAbletonAlsGzip = async () => {
    const xml = generateAbletonAlsXml();
    try {
      if ('CompressionStream' in window) {
        const encoder = new TextEncoder();
        const stream = new Blob([encoder.encode(xml)]).stream();
        const compressedStream = stream.pipeThrough(new CompressionStream('gzip'));
        const response = new Response(compressedStream);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${projectName.replace(/\s+/g, '_')}_${bpm}BPM.als`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Exported Genuine Gzipped Ableton Live Set (.als)!');
        return;
      }
    } catch {
      // Fallback
    }
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, '_')}_${bpm}BPM.als.xml`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported Ableton Live XML (.als.xml)!');
  };

  const downloadStandardMidiMarkers = () => {
    const ticksPerQuarter = 480;
    const bytes: number[] = [];

    bytes.push(0x4D, 0x54, 0x68, 0x64);
    bytes.push(0x00, 0x00, 0x00, 0x06);
    bytes.push(0x00, 0x00);
    bytes.push(0x00, 0x01);
    bytes.push((ticksPerQuarter >> 8) & 0xff, ticksPerQuarter & 0xff);

    const trackData: number[] = [];

    const writeVlq = (val: number) => {
      const buffer = [val & 0x7f];
      val = val >> 7;
      while (val > 0) {
        buffer.push((val & 0x7f) | 0x80);
        val = val >> 7;
      }
      buffer.reverse().forEach(b => trackData.push(b));
    };

    trackData.push(0x00, 0xFF, 0x58, 0x04, beatsPerBar, 0x02, 0x18, 0x08);

    const usPerBeat = Math.round(60000000 / bpm);
    trackData.push(0x00, 0xFF, 0x51, 0x03, (usPerBeat >> 16) & 0xff, (usPerBeat >> 8) & 0xff, usPerBeat & 0xff);

    let lastTick = 0;
    enrichedSections.forEach((sec) => {
      const currentTick = sec.startBar * beatsPerBar * ticksPerQuarter;
      const deltaTicks = Math.max(0, currentTick - lastTick);
      writeVlq(deltaTicks);
      lastTick = currentTick;

      const markerText = `${sec.name} [${sec.bars} Bars]`;
      trackData.push(0xFF, 0x06, markerText.length);
      for (let i = 0; i < markerText.length; i++) {
        trackData.push(markerText.charCodeAt(i));
      }
    });

    trackData.push(0x00, 0xFF, 0x2F, 0x00);

    bytes.push(0x4D, 0x54, 0x72, 0x6B);
    const trackLen = trackData.length;
    bytes.push((trackLen >> 24) & 0xff, (trackLen >> 16) & 0xff, (trackLen >> 8) & 0xff, trackLen & 0xff);
    bytes.push(...trackData);

    const blob = new Blob([new Uint8Array(bytes)], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, '_')}_Markers.mid`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported Standard MIDI Marker Cue Track (.mid)!');
  };

  const downloadRealClickAndCueWav = () => {
    const sampleRate = 22050;
    const durationSeconds = Math.min(30, Math.max(8, Math.round((totalBars * beatsPerBar * 60) / bpm)));
    const numSamples = sampleRate * durationSeconds;
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, numSamples * 2, true);

    const samplesPerBeat = Math.floor((60 / bpm) * sampleRate);
    for (let i = 0; i < numSamples; i++) {
      const beatIndex = Math.floor(i / samplesPerBeat);
      const sampleInBeat = i % samplesPerBeat;
      const isDownbeat = beatIndex % beatsPerBar === 0;
      let sampleVal = 0;

      if (sampleInBeat < sampleRate * 0.04) {
        const env = 1 - sampleInBeat / (sampleRate * 0.04);
        const freq = isDownbeat ? 1650 : 1080;
        sampleVal += Math.sin((2 * Math.PI * freq * i) / sampleRate) * env * 0.7;
      }
      const clamped = Math.max(-1, Math.min(1, sampleVal));
      view.setInt16(44 + i * 2, clamped * 32767, true);
    }

    const blob = new Blob([buffer], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, '_')}_Click_Stem.wav`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported Bar-Aligned WAV Click Stem!');
  };

  const formattedCounters = useMemo(() => {
    const bar = Math.floor(currentStep / stepsPerBar) + 1;
    const stepInBar = currentStep % stepsPerBar;
    const beat = Math.floor(stepInBar / 4) + 1;
    const sixteenth = (stepInBar % 4) + 1;

    const elapsedSeconds = currentStep * (60 / bpm / 4);
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = Math.floor(elapsedSeconds % 60);
    const ms = Math.floor((elapsedSeconds % 1) * 100);

    const totalSeconds = totalSteps * (60 / bpm / 4);
    const totalMins = Math.floor(totalSeconds / 60);
    const totalSecs = Math.floor(totalSeconds % 60);

    return {
      barBeat: `${String(bar).padStart(3, '0')} . ${beat} . ${sixteenth}`,
      timecode: `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}`,
      totalDuration: `${totalMins}:${String(totalSecs).padStart(2, '0')}`
    };
  }, [currentStep, stepsPerBar, bpm, totalSteps]);

  const handleTimelineScrub = (e: React.MouseEvent) => {
    if (!timelineContainerRef.current) return;
    const rect = timelineContainerRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const ratio = clickX / rect.width;
    const targetStep = Math.floor(ratio * totalSteps);
    initAudioContext();
    stepRef.current = targetStep;
    setCurrentStep(targetStep);
    if (audioCtxRef.current) {
      nextStepTimeRef.current = audioCtxRef.current.currentTime;
    }
  };

  const selectedSectionObj = enrichedSections.find(s => s.id === selectedSectionId) || enrichedSections[0];

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100 flex flex-col font-sans select-none overflow-x-hidden">
      {/* ==========================================
          1. TOP TRANSPORT & STUDIO MASTER BAR
      ========================================== */}
      <header className="bg-[#121722] border-b border-slate-800/90 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 z-30 shadow-lg">
        {/* Brand & Project Name */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                STAGE RIG PRO
              </span>
              <button
                onClick={() => setShowSetlistModal(true)}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-300 transition"
                title="Open Live Setlist"
              >
                <ListMusic className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-semibold underline decoration-dotted">Setlist ({setlist.length} Songs)</span>
              </button>
            </div>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="bg-transparent text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 rounded px-1 -ml-1 w-56 sm:w-64"
            />
          </div>
        </div>

        {/* Transport Controls */}
        <div className="flex items-center gap-1.5 bg-[#0B0E14] p-1.5 rounded-lg border border-slate-800">
          <button
            onClick={handlePlayPause}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md font-semibold text-xs transition-all ${
              isPlaying
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
          </button>

          <button
            onClick={handleStop}
            className="p-1.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition"
            title="Stop & Return to Bar 1 (Esc)"
          >
            <Square className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={() => {
              const targetId = loopSectionId ? null : activeSectionInfo.current?.id;
              setLoopSectionId(targetId);
              showToast(targetId ? `Looping: ${activeSectionInfo.current?.name}` : 'Vamp / Loop Disabled');
            }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition ${
              loopSectionId
                ? 'bg-purple-500/30 text-purple-300 border border-purple-500/60 shadow-sm shadow-purple-500/20 animate-pulse'
                : 'bg-slate-800/60 hover:bg-slate-700 text-slate-400'
            }`}
            title="Vamp / Infinite Loop on Current Section (V key)"
          >
            <Repeat className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{loopSectionId ? 'VAMP ON' : 'VAMP'}</span>
          </button>

          <button
            onClick={handleTapTempo}
            className="px-2 py-1.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-amber-400 font-mono text-xs font-bold transition"
            title="Tap Tempo (T key)"
          >
            TAP
          </button>
        </div>

        {/* LCD Counter & Tempo / Key Panel */}
        <div className="flex items-center gap-2 bg-[#090C10] px-3 py-1.5 rounded-lg border border-slate-800/90 shadow-inner">
          <div className="pr-3 border-r border-slate-800">
            <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">BAR . BEAT . 16TH</div>
            <div className="font-mono text-sm sm:text-base font-bold text-cyan-400 tracking-tight">
              {formattedCounters.barBeat}
            </div>
          </div>

          <div className="pr-3 border-r border-slate-800 hidden xl:block">
            <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">TIMECODE / TOTAL</div>
            <div className="font-mono text-sm font-semibold text-slate-200">
              {formattedCounters.timecode} <span className="text-xs text-slate-500">/ {formattedCounters.totalDuration}</span>
            </div>
          </div>

          <div className="pr-3 border-r border-slate-800 flex flex-col">
            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">TEMPO (BPM)</span>
            <input
              type="number"
              min={60}
              max={200}
              value={bpm}
              onChange={(e) => setBpm(Math.max(60, Math.min(200, Number(e.target.value) || 120)))}
              className="w-12 bg-slate-900 text-amber-400 font-mono text-sm font-bold px-1 rounded border border-slate-700 focus:outline-none"
            />
          </div>

          <div className="pr-3 border-r border-slate-800 flex flex-col">
            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">METER</span>
            <select
              value={timeSig}
              onChange={(e) => setTimeSig(e.target.value)}
              className="bg-slate-900 text-slate-200 font-mono text-xs font-bold px-1.5 py-0.5 rounded border border-slate-700 focus:outline-none"
            >
              <option value="4/4">4/4</option>
              <option value="3/4">3/4</option>
              <option value="6/8">6/8</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold block">KEY</span>
              <select
                value={musicalKey}
                onChange={(e) => setMusicalKey(e.target.value)}
                className="bg-slate-900 text-emerald-400 font-mono text-xs font-bold px-1.5 py-0.5 rounded border border-slate-700 focus:outline-none"
              >
                {KEY_SIGNATURES.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold block">PITCH (ST)</span>
              <div className="flex items-center bg-slate-900 rounded border border-slate-700">
                <button
                  onClick={() => setPitchShift(p => Math.max(-6, p - 1))}
                  className="px-1.5 text-xs text-slate-400 hover:text-white"
                >-</button>
                <span className="font-mono text-xs font-bold px-1 text-purple-400">
                  {pitchShift > 0 ? `+${pitchShift}` : pitchShift}
                </span>
                <button
                  onClick={() => setPitchShift(p => Math.min(6, p + 1))}
                  className="px-1.5 text-xs text-slate-400 hover:text-white"
                >+</button>
              </div>
            </div>
          </div>
        </div>

        {/* Actions / Tools Bar */}
        <div className="flex items-center gap-2">
          {/* Printable Band Chart */}
          <button
            onClick={() => setShowChartModal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold"
            title="View & Print Band Chart / Cue Sheet (Ctrl+P)"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Band Chart</span>
          </button>

          {/* MIDI Activity Pill */}
          <button
            onClick={() => setShowMidiModal(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
              midiActivity
                ? 'bg-emerald-500/30 text-emerald-300 border-emerald-400'
                : midiConnectedDevice
                ? 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-600'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
            title="MIDI Controller Settings & MIDI Learn"
          >
            <Piano className={`w-3.5 h-3.5 ${midiActivity ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span className="hidden lg:inline">{midiConnectedDevice ? 'MIDI Active' : 'MIDI'}</span>
          </button>

          {/* Keyboard Shortcuts Trigger */}
          <button
            onClick={() => setShowShortcutsModal(true)}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700"
            title="Stage Hotkeys"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* AI Stem Split Trigger */}
          <button
            onClick={() => setShowAIModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/50 hover:to-indigo-600/50 text-purple-200 border border-purple-500/40 transition shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">AI Stems</span>
          </button>

          {/* View Switcher: Arrange vs Stage View */}
          <div className="flex bg-[#0B0E14] p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewMode('ARRANGE')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                viewMode === 'ARRANGE' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Arrange
            </button>
            <button
              onClick={() => setViewMode('STAGE')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                viewMode === 'STAGE' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Maximize2 className="w-3 h-3" />
              <span>Stage / MD</span>
            </button>
          </div>

          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition shadow-md shadow-cyan-500/15"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Rig</span>
          </button>
        </div>
      </header>

      {/* ==========================================
          SUB-BAR: LIVE CUE TELEPROMPTER & CROSSFADE ENGINE
      ========================================== */}
      <div className="bg-[#10141D] border-b border-slate-800/80 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900/90 px-2.5 py-1 rounded border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400 font-medium">ACTIVE:</span>
            <span
              className="font-bold px-1.5 py-0.5 rounded text-[11px]"
              style={{ backgroundColor: activeSectionInfo.current?.meta.bg, color: activeSectionInfo.current?.meta.border }}
            >
              {activeSectionInfo.current?.name} (Bar {activeSectionInfo.currentBarInSec}/{activeSectionInfo.current?.bars} • Beat {activeSectionInfo.currentBeatInBar})
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-400">NEXT:</span>
            <span className="font-semibold text-slate-200">
              {loopSectionId ? `🔁 Looping ${activeSectionInfo.current?.name}` : (activeSectionInfo.next ? activeSectionInfo.next.name : 'End of Song')}
            </span>
          </div>

          {activeCueBanner && (
            <div className="flex items-center gap-1.5 bg-sky-500/20 border border-sky-400/50 text-sky-300 px-3 py-1 rounded-full font-bold animate-bounce">
              <Mic className="w-3.5 h-3.5" />
              <span>MD CUE: "{activeCueBanner}"</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Slice Crossfade:</span>
            {[5, 15, 50].map((ms) => (
              <button
                key={ms}
                onClick={() => {
                  setCrossfadeMs(ms);
                  showToast(`Equal-power crossfade: ${ms}ms`);
                }}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold transition ${
                  crossfadeMs === ms
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {ms}ms
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setReverbTail(!reverbTail);
              showToast(`Reverb Tail Spillover ${!reverbTail ? 'Enabled' : 'Disabled'}`);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-medium border transition ${
              reverbTail
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800/70 text-slate-500 border-slate-700'
            }`}
          >
            <Radio className="w-3 h-3" />
            <span>Reverb Spillover: {reverbTail ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* ==========================================
          MAIN WORKSPACE: ARRANGE VIEW VS STAGE MD VIEW
      ========================================== */}
      {viewMode === 'STAGE' ? (
        /* STAGE / MD PERFORMANCE VIEW */
        <div className="flex-1 p-6 flex flex-col gap-6 bg-gradient-to-b from-[#0B0E14] to-[#0F1420]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Current Section Main Display */}
            <div
              className="lg:col-span-2 rounded-2xl p-6 border-2 flex flex-col justify-between relative overflow-hidden shadow-2xl"
              style={{
                backgroundColor: activeSectionInfo.current?.meta.bg,
                borderColor: activeSectionInfo.current?.meta.border
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-black/40 text-slate-200">
                  NOW PLAYING SECTION {activeSectionInfo.current?.index + 1} OF {enrichedSections.length}
                </span>
                {loopSectionId === activeSectionInfo.current?.id && (
                  <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-purple-600 text-white animate-pulse">
                    <Repeat className="w-3.5 h-3.5" /> VAMP / LOOP ACTIVE
                  </span>
                )}
              </div>

              <div className="my-6 flex flex-wrap items-baseline justify-between gap-4">
                <div>
                  <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-white">
                    {activeSectionInfo.current?.name}
                  </h1>
                  <p className="text-sm text-slate-300 mt-2 font-medium">
                    Key: <span className="text-emerald-400 font-bold">{musicalKey} ({pitchShift >= 0 ? `+${pitchShift}` : pitchShift} st)</span> • Tempo: <span className="text-amber-400 font-bold">{bpm} BPM</span>
                  </p>
                  {/* Band Chords Prompter */}
                  {activeSectionInfo.current?.chordsText && (
                    <div className="mt-3 inline-block px-3 py-1.5 rounded-lg bg-black/50 border border-white/20">
                      <span className="text-xs uppercase text-slate-400 font-semibold block">BAND CHORDS:</span>
                      <span className="text-xl sm:text-2xl font-mono font-bold text-amber-300">
                        {activeSectionInfo.current.chordsText}
                      </span>
                    </div>
                  )}
                  {/* MD Performance Notes */}
                  {activeSectionInfo.current?.mdNotes && (
                    <p className="text-xs text-cyan-300 mt-2 font-mono">
                      💡 MD Note: {activeSectionInfo.current.mdNotes}
                    </p>
                  )}
                </div>

                <div className="text-right font-mono">
                  <div className="text-xs uppercase text-slate-300">BAR COUNTDOWN</div>
                  <div className="text-5xl sm:text-6xl font-black text-white">
                    {activeSectionInfo.currentBarInSec} <span className="text-2xl text-slate-400">/ {activeSectionInfo.current?.bars}</span>
                  </div>
                  <div className="text-sm text-cyan-400 mt-1 font-bold">
                    Beat {activeSectionInfo.currentBeatInBar} of {beatsPerBar}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-5 bg-black/50 rounded-full overflow-hidden p-0.5 border border-white/10">
                <div
                  className="h-full rounded-full transition-all duration-100"
                  style={{
                    width: `${activeSectionInfo.progress}%`,
                    backgroundColor: activeSectionInfo.current?.meta.color
                  }}
                />
              </div>
            </div>

            {/* Next Section & Spontaneous Controls */}
            <div className="rounded-2xl bg-[#151A24] border border-slate-800 p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">UPCOMING SECTION</span>
                <div className="mt-3 p-4 rounded-xl bg-[#0B0E14] border border-slate-800">
                  <div className="text-2xl font-extrabold text-white">
                    {loopSectionId
                      ? `Repeating ${activeSectionInfo.current?.name}`
                      : activeSectionInfo.next
                      ? activeSectionInfo.next.name
                      : 'End of Arrangement'}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {activeSectionInfo.next ? `${activeSectionInfo.next.bars} Bars • Auto Voice Cue 1 Bar Prior` : 'Playback stops or loops to Intro'}
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 my-4">
                <button
                  onClick={() => {
                    const isLooping = loopSectionId === activeSectionInfo.current?.id;
                    setLoopSectionId(isLooping ? null : activeSectionInfo.current?.id);
                  }}
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition ${
                    loopSectionId === activeSectionInfo.current?.id
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  <Repeat className="w-4 h-4" />
                  <span>{loopSectionId === activeSectionInfo.current?.id ? 'EXIT SECTION VAMP' : 'VAMP / LOOP CURRENT SECTION'}</span>
                </button>

                <button
                  onClick={() => duplicateSection(activeSectionInfo.current)}
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-cyan-300 flex items-center justify-center gap-2 transition"
                >
                  <Copy className="w-4 h-4" />
                  <span>EXTEND SECTION (+{activeSectionInfo.current?.bars} BARS)</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800 pt-3">
                <span>Click Subdivision: {tracks.find(t => t.id === 'click')?.subdivision}</span>
                <button
                  onClick={toggleClickSubdivision}
                  className="text-cyan-400 hover:underline font-semibold"
                >
                  Toggle 1/4 vs 1/8
                </button>
              </div>
            </div>
          </div>

          {/* Section Launch Pads */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              LIVE SECTION LAUNCH PADS (CLICK TO JUMP IMMEDIATELY ON BAR)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {enrichedSections.map((sec) => {
                const isCurrent = activeSectionInfo.current?.id === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => jumpToSection(sec)}
                    className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between h-28 ${
                      isCurrent
                        ? 'ring-2 ring-white scale-[1.02] shadow-lg'
                        : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: sec.meta.bg,
                      borderColor: sec.meta.border
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/40 text-white">
                        BAR {sec.startBar + 1}
                      </span>
                      {loopSectionId === sec.id && <Repeat className="w-3.5 h-3.5 text-purple-300" />}
                    </div>
                    <div>
                      <div className="font-extrabold text-base text-white truncate">{sec.name}</div>
                      <div className="text-xs text-slate-300 font-medium">{sec.bars} Bars</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* ARRANGE VIEW: MULTITRACK TIMELINE */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Section Inspector Bar */}
          {selectedSectionObj && (
            <div className="bg-[#141923] border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: selectedSectionObj.meta.color }}
                />
                <span className="text-xs font-bold text-slate-300">SECTION:</span>
                <input
                  type="text"
                  value={selectedSectionObj.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSections(prev => prev.map(s => s.id === selectedSectionObj.id ? { ...s, name: val } : s));
                  }}
                  className="bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded border border-slate-700 w-36"
                />

                {/* Bars Adjuster */}
                <div className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-xs">
                  <span className="text-slate-400">Length:</span>
                  <button
                    onClick={() => updateSectionBars(selectedSectionObj.id, -2)}
                    className="px-1.5 text-slate-400 hover:text-white font-bold"
                  >-</button>
                  <span className="font-mono font-bold text-cyan-400">{selectedSectionObj.bars} Bars</span>
                  <button
                    onClick={() => updateSectionBars(selectedSectionObj.id, 2)}
                    className="px-1.5 text-slate-400 hover:text-white font-bold"
                  >+</button>
                </div>

                {/* Section Chords Field */}
                <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-xs">
                  <span className="text-slate-400">Chords:</span>
                  <input
                    type="text"
                    value={selectedSectionObj.chordsText || ''}
                    placeholder="e.g. C - G - Am - F"
                    onChange={(e) => {
                      const val = e.target.value;
                      setSections(prev => prev.map(s => s.id === selectedSectionObj.id ? { ...s, chordsText: val } : s));
                    }}
                    className="bg-transparent text-amber-300 font-mono text-xs w-32 focus:outline-none"
                  />
                </div>

                {/* Section Custom Cue Field */}
                <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-xs hidden lg:flex">
                  <span className="text-slate-400">MD Cue:</span>
                  <input
                    type="text"
                    value={selectedSectionObj.customCue || ''}
                    placeholder={selectedSectionObj.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSections(prev => prev.map(s => s.id === selectedSectionObj.id ? { ...s, customCue: val } : s));
                    }}
                    className="bg-transparent text-sky-300 font-mono text-xs w-28 focus:outline-none"
                  />
                </div>
              </div>

              {/* Stem Mask Matrix */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-slate-400 font-medium">Stems in "{selectedSectionObj.name}":</span>
                {['drums', 'bass', 'keys', 'guitar', 'vocals'].map((stemKey) => {
                  const active = selectedSectionObj.stemMask?.[stemKey] ?? true;
                  return (
                    <button
                      key={stemKey}
                      onClick={() => toggleSectionStemMask(selectedSectionObj.id, stemKey)}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase transition border ${
                        active
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          : 'bg-slate-900 text-slate-500 border-slate-800 line-through'
                      }`}
                    >
                      {stemKey}
                    </button>
                  );
                })}
                <button
                  onClick={() => setShowAddSectionModal(true)}
                  className="ml-2 flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Section</span>
                </button>
              </div>
            </div>
          )}

          {/* Timeline and Track Rows */}
          <div className="flex-1 flex overflow-y-auto overflow-x-hidden">
            {/* Left Track Headers */}
            <div className="w-72 sm:w-80 shrink-0 bg-[#151A24] border-r border-slate-800 flex flex-col z-20">
              <div className="h-24 px-3 border-b border-slate-800 flex flex-col justify-center bg-[#11161F]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    STRUCTURE ({totalBars} BARS)
                  </span>
                  <button
                    onClick={() => setShowAddSectionModal(true)}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" /> Section
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Drag sections to reorder • Upload stems per track.
                </p>
              </div>

              {tracks.map((track) => {
                const meterVal = trackMeters[track.id] || 0;
                const anySolo = tracks.some(t => t.solo);
                const effectivelyMuted = track.muted || (anySolo && !track.solo);

                return (
                  <div
                    key={track.id}
                    className={`h-20 px-3 py-2 border-b border-slate-800/90 flex flex-col justify-between transition ${
                      effectivelyMuted ? 'opacity-50 bg-[#10141C]' : 'bg-[#151A24]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-4 rounded-sm shrink-0"
                          style={{ backgroundColor: track.color }}
                        />
                        <span className="font-bold text-xs text-slate-100 truncate">
                          {track.name}
                        </span>
                        {track.id === 'click' && (
                          <button
                            onClick={toggleClickSubdivision}
                            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-cyan-400 border border-slate-700"
                            title="Toggle Metronome Subdivision"
                          >
                            {track.subdivision}
                          </button>
                        )}
                        {track.category === 'STEM' && (
                          <label
                            className="cursor-pointer text-slate-400 hover:text-cyan-300"
                            title={track.fileName ? `Loaded: ${track.fileName}` : 'Load WAV/MP3 stem file'}
                          >
                            <Upload className="w-3 h-3" />
                            <input
                              type="file"
                              accept="audio/*"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleAudioFileUpload(track.id, f);
                              }}
                            />
                          </label>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => toggleMute(track.id)}
                          className={`w-6 h-5 rounded text-[10px] font-black transition ${
                            track.muted
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                          title="Mute Track"
                        >
                          M
                        </button>
                        <button
                          onClick={() => toggleSolo(track.id)}
                          className={`w-6 h-5 rounded text-[10px] font-black transition ${
                            track.solo
                              ? 'bg-cyan-400 text-slate-950'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                          title="Solo Track"
                        >
                          S
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <select
                        value={track.route}
                        onChange={(e) => changeRoute(track.id, e.target.value)}
                        className="bg-[#0B0E14] text-slate-300 text-[10px] font-mono px-1.5 py-1 rounded border border-slate-800 focus:outline-none w-32 truncate"
                        title="Hardware Interface Output Routing"
                      >
                        {OUTPUT_ROUTES.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>

                      <div className="flex items-center gap-1.5 flex-1">
                        <Volume2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={track.volume}
                          onChange={(e) => changeVolume(track.id, parseFloat(e.target.value))}
                          className="w-full accent-cyan-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      <div className="w-2 h-6 bg-slate-900 rounded-sm overflow-hidden flex flex-col justify-end p-[1px] border border-slate-800">
                        <div
                          className="w-full rounded-sm transition-all duration-75"
                          style={{
                            height: `${Math.min(100, meterVal * 100)}%`,
                            backgroundColor: meterVal > 0.85 ? '#F43F5E' : '#10B981'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Multi-Track Grid */}
            <div
              ref={timelineContainerRef}
              onClick={handleTimelineScrub}
              className="flex-1 bg-[#0B0E14] relative flex flex-col cursor-pointer overflow-x-auto"
            >
              {/* Draggable Section Arrangement Blocks */}
              <div className="h-24 border-b border-slate-800 flex w-full relative bg-[#0E131B]">
                {enrichedSections.map((sec, idx) => {
                  const widthPercent = (sec.bars / totalBars) * 100;
                  const isSelected = selectedSectionId === sec.id;
                  const isPlayingSec = activeSectionInfo.current?.id === sec.id;

                  return (
                    <div
                      key={sec.id}
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDragEnd={handleDragEnd}
                      onClick={(e) => {
                        e.stopPropagation();
                        jumpToSection(sec);
                      }}
                      style={{
                        width: `${widthPercent}%`,
                        backgroundColor: sec.meta.bg,
                        borderColor: isSelected ? '#FFFFFF' : sec.meta.border
                      }}
                      className={`h-full border-r-2 p-2 flex flex-col justify-between relative group transition-all select-none cursor-grab active:cursor-grabbing ${
                        isSelected ? 'ring-1 ring-inset ring-white/80' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 overflow-hidden">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: sec.meta.color }}
                            />
                            <span className="font-extrabold text-xs text-white truncate">
                              {sec.name}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-300 block">
                            {sec.bars} Bars (Bar {sec.startBar + 1}–{sec.endBar})
                          </span>
                        </div>

                        {isPlayingSec && (
                          <span className="px-1.5 py-0.5 rounded bg-black/50 text-[9px] font-mono font-bold text-emerald-400 shrink-0">
                            ACTIVE
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-1 pt-1 border-t border-white/10">
                        <div className="flex items-center gap-0.5">
                          <button
                            onClick={(e) => moveSection(idx, -1, e)}
                            disabled={idx === 0}
                            className="p-1 rounded bg-black/40 hover:bg-black/70 text-slate-300 disabled:opacity-30"
                            title="Move Left"
                          >
                            <ChevronLeft className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => moveSection(idx, 1, e)}
                            disabled={idx === enrichedSections.length - 1}
                            className="p-1 rounded bg-black/40 hover:bg-black/70 text-slate-300 disabled:opacity-30"
                            title="Move Right"
                          >
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => splitSection(sec, e)}
                            className="p-1 rounded bg-black/40 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 transition"
                            title="Split Section in Half"
                          >
                            <Split className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => duplicateSection(sec, e)}
                            className="p-1 rounded bg-black/40 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 transition"
                            title="Duplicate Section"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setLoopSectionId(loopSectionId === sec.id ? null : sec.id);
                            }}
                            className={`p-1 rounded transition ${
                              loopSectionId === sec.id
                                ? 'bg-purple-500 text-white'
                                : 'bg-black/40 hover:bg-purple-500/40 text-slate-200'
                            }`}
                            title="Loop Section"
                          >
                            <Repeat className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => deleteSection(sec.id, e)}
                            className="p-1 rounded bg-black/40 hover:bg-rose-500 hover:text-white text-slate-300 transition"
                            title="Delete Section"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {idx > 0 && (
                        <div
                          className="absolute top-0 -left-1.5 bottom-0 w-3 pointer-events-none flex items-center justify-center"
                          title={`${crossfadeMs}ms Equal-Power Crossfade`}
                        >
                          <div className="w-0.5 h-full bg-cyan-400/40" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 7 Track Waveform Rows */}
              {tracks.map((track, trackIdx) => {
                const anySolo = tracks.some(t => t.solo);
                const effectivelyMuted = track.muted || (anySolo && !track.solo);

                return (
                  <div
                    key={track.id}
                    className={`h-20 border-b border-slate-800/80 flex w-full relative ${
                      effectivelyMuted ? 'opacity-35' : ''
                    }`}
                  >
                    {enrichedSections.map((sec, secIdx) => {
                      const widthPercent = (sec.bars / totalBars) * 100;
                      const stemActive = track.category === 'UTILITY' ? true : (sec.stemMask?.[track.id] ?? true);
                      const nextSec = enrichedSections[secIdx + 1];

                      return (
                        <div
                          key={`${track.id}-${sec.id}`}
                          style={{ width: `${widthPercent}%` }}
                          className="h-full border-r border-slate-800/70 relative overflow-hidden p-1.5 flex items-center"
                        >
                          <div
                            className="absolute inset-0 pointer-events-none opacity-25"
                            style={{ backgroundColor: sec.meta.bg }}
                          />

                          {/* CLICK TRACK */}
                          {track.id === 'click' && (
                            <div className="w-full h-full flex items-center justify-between px-1 relative z-10">
                              {Array.from({ length: sec.bars * 4 }).map((_, beatIdx) => {
                                const isBarDownbeat = beatIdx % 4 === 0;
                                return (
                                  <div
                                    key={beatIdx}
                                    className="flex flex-col items-center justify-center h-full"
                                  >
                                    <div
                                      className={`w-[2px] rounded-full ${
                                        isBarDownbeat
                                          ? 'h-10 bg-slate-200'
                                          : 'h-5 bg-slate-600'
                                      }`}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* VOICE CUES */}
                          {track.id === 'cues' && (
                            <div className="w-full h-full flex items-center justify-between px-2 relative z-10">
                              <span className="text-[10px] font-mono text-slate-500 truncate">
                                {sec.name}
                              </span>
                              {nextSec && (
                                <div
                                  className="px-2 py-1 rounded-md bg-sky-500/25 border border-sky-400/60 text-sky-300 text-[10px] font-bold flex items-center gap-1 shadow-sm shrink-0"
                                  title={`MD Cue triggered at Bar ${sec.endBar}: "${nextSec.customCue || nextSec.name}, 2, 3, 4"`}
                                >
                                  <Mic className="w-3 h-3 text-sky-400" />
                                  <span>"{nextSec.customCue || nextSec.name} • 2, 3, 4"</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* STEM TRACKS */}
                          {track.category === 'STEM' && (
                            stemActive ? (
                              <div className="w-full h-full rounded-md bg-[#090D14]/70 border border-white/10 px-1 flex items-center justify-between gap-[2px] relative z-10 overflow-hidden">
                                <span
                                  className="absolute top-1 left-1.5 text-[9px] font-mono font-bold px-1 rounded bg-black/60 z-20"
                                  style={{ color: track.color }}
                                >
                                  {sec.name} • {track.id.toUpperCase()} {track.fileName ? `(${track.fileName})` : ''}
                                </span>

                                {/* Waveform rendering: either from real uploaded audio buffer or procedural */}
                                {Array.from({ length: Math.max(16, sec.bars * 6) }).map((_, barI) => {
                                  let heightPct = 50;
                                  if (track.waveformPeaks && track.waveformPeaks.length > 0) {
                                    const peakIdx = (barI * 3) % track.waveformPeaks.length;
                                    heightPct = Math.max(12, track.waveformPeaks[peakIdx] * 95);
                                  } else {
                                    const seed = (trackIdx + 1) * 1000 + sec.type.charCodeAt(0) * 37 + barI;
                                    const rand = pseudoRandom(seed);
                                    heightPct = Math.max(14, Math.min(95, rand * 95 * sec.meta.intensity));
                                  }

                                  return (
                                    <div
                                      key={barI}
                                      className="flex-1 rounded-full transition-all"
                                      style={{
                                        height: `${heightPct}%`,
                                        backgroundColor: track.color,
                                        opacity: 0.78
                                      }}
                                    />
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="w-full h-full rounded-md border border-dashed border-slate-800 flex items-center justify-center z-10">
                                <span className="text-[10px] text-slate-600 font-mono uppercase">
                                  Stem Tacit / Muted in {sec.name}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {/* Master Playhead Line */}
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-rose-500 pointer-events-none z-30 shadow-[0_0_12px_#F43F5E]"
                style={{
                  left: `${(currentStep / Math.max(1, totalSteps)) * 100}%`
                }}
              >
                <div className="w-3.5 h-3.5 -ml-[6px] bg-rose-500 rotate-45 rounded-xs shadow" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: BAND CHART & CUE SHEET (PRINTABLE)
      ========================================== */}
      {showChartModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#151A24] border border-slate-700 rounded-2xl max-w-3xl w-full p-6 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Band Road Map & Cue Sheet</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Chart</span>
                </button>
                <button onClick={() => setShowChartModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div className="p-4 rounded-xl bg-[#0B0E14] border border-slate-800 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black text-white">{projectName}</h2>
                  <div className="text-xs text-slate-400 mt-1 font-mono">
                    Key: <span className="text-emerald-400 font-bold">{musicalKey}</span> • Tempo: <span className="text-amber-400 font-bold">{bpm} BPM</span> • Meter: <span className="text-cyan-400 font-bold">{timeSig}</span> • Length: <span className="text-purple-400 font-bold">{totalBars} Bars</span> ({formattedCounters.totalDuration})
                  </div>
                </div>
                <div className="text-right text-xs text-slate-500 font-mono">
                  Stage Rig Pro Chart
                </div>
              </div>

              {/* Section by Section Flow */}
              <div className="space-y-2">
                {enrichedSections.map((sec, idx) => (
                  <div
                    key={sec.id}
                    className="p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    style={{ backgroundColor: sec.meta.bg, borderColor: sec.meta.border }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-black/50 text-white">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="font-black text-base text-white">{sec.name}</div>
                        <div className="text-xs text-slate-300 font-mono">
                          {sec.bars} Bars (Bar {sec.startBar + 1}–{sec.endBar})
                        </div>
                      </div>
                    </div>

                    <div className="text-left sm:text-right font-mono">
                      <div className="text-sm font-bold text-amber-300">
                        Chords: {sec.chordsText || '—'}
                      </div>
                      <div className="text-xs text-slate-300">
                        {sec.mdNotes ? `Note: ${sec.mdNotes}` : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: SETLIST MANAGER
      ========================================== */}
      {showSetlistModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#151A24] border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <ListMusic className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Live Performance Setlist</h3>
              </div>
              <button onClick={() => setShowSetlistModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 mb-3">
              <button
                onClick={addNewSongToSetlist}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Song</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={exportSetlistJson}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  <Download className="w-3 h-3" />
                  <span>Export JSON</span>
                </button>
                <label className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer">
                  <Upload className="w-3 h-3" />
                  <span>Import JSON</span>
                  <input type="file" accept=".json" onChange={importSetlistJson} className="hidden" />
                </label>
              </div>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto">
              {setlist.map((song, i) => (
                <div
                  key={song.id}
                  onClick={() => loadSongFromSetlist(song)}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    activeSongId === song.id
                      ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-md'
                      : 'bg-[#0B0E14] border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-bold text-sm text-white">
                      {i + 1}. {song.name}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {song.bpm} BPM • {song.musicalKey} • {song.timeSig} • {song.sections.length} Sections
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                      activeSongId === song.id ? 'bg-cyan-500 text-black' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {activeSongId === song.id ? 'LOADED' : 'LOAD'}
                    </span>
                    <button
                      onClick={(e) => deleteSongFromSetlist(song.id, e)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400"
                      title="Delete Song"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: MIDI SETTINGS & MIDI LEARN
      ========================================== */}
      {showMidiModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#151A24] border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Piano className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Web MIDI Controller & MIDI Learn</h3>
              </div>
              <button onClick={() => setShowMidiModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-[#0B0E14] border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">Connected Device</div>
                  <div className="text-slate-400">{midiConnectedDevice || 'No USB/Bluetooth MIDI pedal detected'}</div>
                </div>
                <span className={`w-3 h-3 rounded-full ${midiActivity ? 'bg-emerald-400 animate-ping' : midiConnectedDevice ? 'bg-emerald-500' : 'bg-slate-700'}`} />
              </div>

              {midiLearningAction && (
                <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500 text-amber-200 text-center font-bold animate-pulse">
                  Press any pad, foot switch, or key on your MIDI controller to map: {midiLearningAction.toUpperCase()}
                </div>
              )}

              <div>
                <span className="font-bold text-slate-300 block mb-2 uppercase tracking-wider text-[11px]">
                  MIDI Stage Triggers (Click "Learn" then press foot switch):
                </span>
                <ul className="space-y-1.5 font-mono text-slate-300">
                  {[
                    { key: 'playPause', label: 'PLAY / PAUSE' },
                    { key: 'stop', label: 'STOP / REWIND' },
                    { key: 'nextSec', label: 'NEXT SECTION' },
                    { key: 'prevSec', label: 'PREV SECTION' },
                    { key: 'vamp', label: 'VAMP / LOOP' },
                    { key: 'tapTempo', label: 'TAP TEMPO' },
                  ].map(({ key, label }) => (
                    <li key={key} className="flex justify-between items-center p-2 rounded bg-[#090C10] border border-slate-800">
                      <span>{label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400 font-bold">Note {midiMappings[key as keyof MidiMapping]}</span>
                        <button
                          onClick={() => setMidiLearningAction(key)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                            midiLearningAction === key ? 'bg-amber-500 text-black' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          }`}
                        >
                          {midiLearningAction === key ? 'LEARNING...' : 'LEARN'}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: KEYBOARD SHORTCUTS
      ========================================== */}
      {showShortcutsModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#151A24] border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Stage Hotkeys & Shortcuts</h3>
              </div>
              <button onClick={() => setShowShortcutsModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded bg-[#0B0E14] border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">Play / Pause</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold">Space</kbd>
              </div>
              <div className="p-2.5 rounded bg-[#0B0E14] border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">Stop</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold">Esc</kbd>
              </div>
              <div className="p-2.5 rounded bg-[#0B0E14] border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">Next Section</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold">→</kbd>
              </div>
              <div className="p-2.5 rounded bg-[#0B0E14] border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">Prev Section</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold">←</kbd>
              </div>
              <div className="p-2.5 rounded bg-[#0B0E14] border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">Vamp / Loop</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-purple-300 font-bold">V</kbd>
              </div>
              <div className="p-2.5 rounded bg-[#0B0E14] border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">Tap Tempo</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-bold">T</kbd>
              </div>
              <div className="p-2.5 rounded bg-[#0B0E14] border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">Stage / Arrange</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold">F</kbd>
              </div>
              <div className="p-2.5 rounded bg-[#0B0E14] border border-slate-800 flex justify-between items-center">
                <span className="text-slate-300">Band Chart</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-bold">Ctrl+P</kbd>
              </div>
              <div className="p-2.5 rounded bg-[#0B0E14] border border-slate-800 flex justify-between items-center col-span-2">
                <span className="text-slate-300">Tempo +/-</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">↑ / ↓ (Shift for +/- 5)</kbd>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: AI STEM SEPARATOR SIMULATION
      ========================================== */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#151A24] border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">AI Stem Separator & Downbeat Detector</h2>
                  <p className="text-xs text-slate-400">Powered by Demucs v4 (htdemucs_6s) + Madmom Tempo Map</p>
                </div>
              </div>
              <button onClick={() => setShowAIModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {aiProcessingStep === 0 ? (
              <div className="my-6 space-y-4">
                <label className="border-2 border-dashed border-slate-700 hover:border-purple-400 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition bg-[#0B0E14]/60">
                  <Upload className="w-8 h-8 text-purple-400 mb-2" />
                  <span className="text-sm font-semibold text-slate-200">
                    Drop a Stereo Master (.WAV, .MP3, .FLAC)
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    Automatically splits into Drums, Bass, Keys, Guitars, Vocals & maps song sections
                  </span>
                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setUploadedFileName(file.name);
                        setAiProcessingStep(1);
                        setTimeout(() => setAiProcessingStep(2), 900);
                        setTimeout(() => setAiProcessingStep(3), 1800);
                        setTimeout(() => setAiProcessingStep(4), 2700);
                        setTimeout(() => {
                          setProjectName(file.name.replace(/\.[^/.]+$/, '') + ' [AI Live Rig]');
                          setAiProcessingStep(0);
                          setShowAIModal(false);
                          showToast('AI 5-Stem Separation Complete!');
                        }, 3500);
                      }
                    }}
                  />
                </label>
              </div>
            ) : (
              <div className="my-8 space-y-4">
                <div className="text-xs font-mono text-purple-300 flex items-center justify-between">
                  <span>Processing: {uploadedFileName}</span>
                  <span>{aiProcessingStep * 25}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-500"
                    style={{ width: `${aiProcessingStep * 25}%` }}
                  />
                </div>
                <ul className="space-y-2 text-xs text-slate-300 font-mono">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" /> 1. Extracting transients & tempo grid...
                  </li>
                  {aiProcessingStep >= 2 && (
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" /> 2. Isolating Drums, Bass, Keys, Guitar & Vocals...
                    </li>
                  )}
                  {aiProcessingStep >= 3 && (
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" /> 3. Detecting Intro, Verse, Chorus, Bridge markers...
                    </li>
                  )}
                  {aiProcessingStep >= 4 && (
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" /> 4. Generating synchronized Click & MD Voice Cues...
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: ADD NEW SECTION
      ========================================== */}
      {showAddSectionModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#151A24] border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white">Insert Arrangement Section</h3>
              <button onClick={() => setShowAddSectionModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {Object.entries(SECTION_TYPES).map(([key, meta]) => (
                <button
                  key={key}
                  onClick={() => addNewSection(key, `${meta.label}`, meta.defaultBars)}
                  className="p-3 rounded-xl border text-left hover:scale-[1.02] transition flex flex-col justify-between"
                  style={{ backgroundColor: meta.bg, borderColor: meta.border }}
                >
                  <span className="font-extrabold text-sm text-white">{meta.label}</span>
                  <span className="text-[11px] text-slate-300 mt-1">
                    Default {meta.defaultBars} Bars
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: EXPORT LIVE BUNDLE
      ========================================== */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#151A24] border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-white">Export Stage-Ready Live Rig</h2>
                <p className="text-xs text-slate-400">
                  Export Genuine Ableton Live Set (.als gzip), Standard MIDI Markers (.mid), or Bar-Aligned WAV
                </p>
              </div>
              <button onClick={() => setShowExportModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#0B0E14] border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <FileCode className="w-4 h-4" />
                    <span>Ableton Live Set (.als)</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Genuine gzip-compressed `.als` that opens directly in Ableton Live 10/11/12 with all {enrichedSections.length} Locators & tracks pre-mapped.
                  </p>
                </div>
                <button
                  onClick={downloadAbletonAlsGzip}
                  className="mt-4 w-full py-2.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .ALS</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-[#0B0E14] border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                    <Music className="w-4 h-4" />
                    <span>MIDI Cue Track (.mid)</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Standard MIDI format with Tempo meta events and Section Text Markers. Import into Logic Pro, Pro Tools, Reaper, or Studio One.
                  </p>
                </div>
                <button
                  onClick={downloadStandardMidiMarkers}
                  className="mt-4 w-full py-2.5 px-3 rounded-lg bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .MID</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-[#0B0E14] border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                    <FileAudio className="w-4 h-4" />
                    <span>Click Track WAV</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    16-bit PCM WAV click track aligned to Bar 1 Beat 1 at {bpm} BPM with your exact song structure.
                  </p>
                </div>
                <button
                  onClick={downloadRealClickAndCueWav}
                  className="mt-4 w-full py-2.5 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .WAV</span>
                </button>
              </div>
            </div>

            <div>
              <div className="text-[11px] font-mono uppercase text-slate-400 mb-1.5">
                GENERATED ABLETON &lt;LOCATORS&gt; MAP
              </div>
              <pre className="bg-[#090C10] border border-slate-800 rounded-lg p-3 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-36">
                {generateAbletonAlsXml()}
              </pre>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-slate-900 border border-cyan-500/50 text-slate-100 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold z-50 animate-fade-in">
          <Check className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
