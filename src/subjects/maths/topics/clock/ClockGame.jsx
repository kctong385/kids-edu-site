import { useState, useRef, useEffect, useCallback } from 'react';
import BigButton from '../../../../components/ui/BigButton';

// ── constants ──────────────────────────────────────────────────────────────
const CX = 150, CY = 150, R = 138, ML = 98, HL = 67;

const HOUR_COLOURS = [
  '#E24B4A','#BA7517','#3B6D11','#185FA5','#0F6E56','#993556',
  '#534AB7','#993C1D','#1D9E75','#712B13','#3C3489','#854F0B',
];

const MINUTE_COLOUR  = '#378ADD';
const HOUR_ARM_COL   = '#EF9F27';
const MINUTE_ARM_COL = '#378ADD';

// ── helpers ────────────────────────────────────────────────────────────────
const toRad  = (deg) => (deg - 90) * (Math.PI / 180);
const tip    = (deg, len) => [
  CX + Math.cos(toRad(deg)) * len,
  CY + Math.sin(toRad(deg)) * len,
];
// minutes in 12-hour period  (0 – 719)
const clamp  = (m) => ((m % 720) + 720) % 720;
const pad2   = (n) => (n < 10 ? '0' : '') + n;
const enHour = (h) => (h === 0 ? 12 : h);
// figure-space for single digit hour so tile never shifts
const fmtH   = (h12) => (h12 < 10 ? '\u2007' : '') + h12;

// easeInOut for animations
const ease = (p) => (p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p);

// ── sub-components ─────────────────────────────────────────────────────────

function ClockFace({ minuteAngle, hourAngle, onPointerDown }) {
  const ticks = [];
  const hourNums = [];
  const minNums  = [];

  for (let i = 0; i < 60; i++) {
    const a    = toRad(i * 6);
    const big  = i % 5 === 0;
    const r1   = R - (big ? 14 : 7);
    ticks.push(
      <line
        key={i}
        x1={CX + Math.cos(a) * r1} y1={CY + Math.sin(a) * r1}
        x2={CX + Math.cos(a) * R}  y2={CY + Math.sin(a) * R}
        stroke={big ? '#bbb' : '#ddd'}
        strokeWidth={big ? 2 : 1}
      />
    );
  }

  for (let h = 1; h <= 12; h++) {
    const a = toRad(h * 30);
    const r = R - 28;
    hourNums.push(
      <text
        key={h}
        x={CX + Math.cos(a) * r} y={CY + Math.sin(a) * r}
        textAnchor="middle" dominantBaseline="central"
        fontSize={20} fontWeight={700}
        fill={HOUR_COLOURS[h - 1]}
      >
        {h}
      </text>
    );
  }

  for (let i = 1; i <= 11; i++) {
    const minVal = i * 5;
    const a = toRad(i * 30);
    const r = R - 52;
    minNums.push(
      <text
        key={i}
        x={CX + Math.cos(a) * r} y={CY + Math.sin(a) * r}
        textAnchor="middle" dominantBaseline="central"
        fontSize={11} fontWeight={600}
        fill={MINUTE_COLOUR} opacity={0.75}
      >
        {minVal}
      </text>
    );
  }

  const [mx, my] = tip(minuteAngle, ML);
  const [hx, hy] = tip(hourAngle,   HL);

  return (
    <svg
      width={300} height={300}
      viewBox="0 0 300 300"
      style={{ touchAction: 'none', overflow: 'visible', cursor: 'default', userSelect: 'none' }}
      onPointerDown={onPointerDown}
    >
      {/* face */}
      <circle cx={CX} cy={CY} r={148} fill="#FAEEDA" stroke={HOUR_ARM_COL} strokeWidth={5} />
      <circle cx={CX} cy={CY} r={138} fill="white" />

      {/* tick marks */}
      <g>{ticks}</g>

      {/* hour numbers */}
      <g>{hourNums}</g>

      {/* minute numbers */}
      <g>{minNums}</g>

      {/* hour arm */}
      <line
        x1={CX} y1={CY} x2={hx} y2={hy}
        stroke={HOUR_ARM_COL} strokeWidth={10} strokeLinecap="round"
      />

      {/* minute arm */}
      <line
        x1={CX} y1={CY} x2={mx} y2={my}
        stroke={MINUTE_ARM_COL} strokeWidth={6} strokeLinecap="round"
      />

      {/* centre cap */}
      <circle cx={CX} cy={CY} r={10} fill={HOUR_ARM_COL} />
      <circle cx={CX} cy={CY} r={4}  fill="white" />

      {/* drag handles (invisible hit-areas) */}
      <circle cx={mx} cy={my} r={22} fill={MINUTE_ARM_COL} opacity={0.13} style={{ cursor: 'grab' }} />
      <circle cx={hx} cy={hy} r={24} fill={HOUR_ARM_COL}   opacity={0.13} style={{ cursor: 'grab' }} />
    </svg>
  );
}

function DigitalDisplay({ hours, minutes }) {
  const h12 = enHour(hours);
  return (
    <div style={styles.digWrap}>
      {/* hour tile */}
      <div style={styles.digH}>
        <div style={styles.digNumH}>{fmtH(h12)}</div>
        <div style={styles.digLabelH}>HOURS</div>
      </div>

      <div style={styles.digColon}>:</div>

      {/* minute tile */}
      <div style={styles.digM}>
        <div style={styles.digNumM}>{pad2(minutes)}</div>
        <div style={styles.digLabelM}>MINS</div>
      </div>
    </div>
  );
}

// ── main component ─────────────────────────────────────────────────────────
export default function ClockGame() {
  // total minutes in the 12-hour cycle (0–719)
  const [tm, setTm] = useState(0);
  const [busy, setBusy]   = useState(false);
  const dragRef = useRef(null);   // 'm' | 'h' | null
  const svgRef  = useRef(null);
  const rafRef  = useRef(null);

  const hours   = Math.floor(tm / 60);
  const minutes = tm % 60;
  const minuteAngle = minutes * 6;
  const hourAngle   = hours * 30 + minutes * 0.5;

  // ── pointer helpers ──────────────────────────────────────────────────────
  const svgPoint = useCallback((e) => {
    const rc  = svgRef.current.getBoundingClientRect();
    const scl = 300 / rc.width;
    return [(e.clientX - rc.left) * scl, (e.clientY - rc.top) * scl];
  }, []);

  const svgAngle = useCallback((e) => {
    const [x, y] = svgPoint(e);
    let a = Math.atan2(y - CY, x - CX) * (180 / Math.PI) + 90;
    return ((a % 360) + 360) % 360;
  }, [svgPoint]);

  // ── drag ─────────────────────────────────────────────────────────────────
  const handlePointerDown = useCallback((e) => {
    if (busy) return;
    const [px, py] = svgPoint(e);
    const [mx, my] = tip(minutes * 6, ML);
    const [hx, hy] = tip(hours * 30 + minutes * 0.5, HL);
    const dm = (px - mx) ** 2 + (py - my) ** 2;
    const dh = (px - hx) ** 2 + (py - hy) ** 2;
    if (dm < 1400 || dh < 1400) {
      dragRef.current = dm <= dh ? 'm' : 'h';
      e.currentTarget.setPointerCapture(e.pointerId);
      e.preventDefault();
    }
  }, [busy, minutes, hours, svgPoint]);

  const handlePointerMove = useCallback((e) => {
    if (!dragRef.current) return;
    const a = svgAngle(e);
    if (dragRef.current === 'm') {
      const mn = Math.round(a / 6) % 60;
      setTm((prev) => clamp(Math.floor(prev / 60) * 60 + mn));
    } else {
      const h  = Math.floor(a / 30) % 12;
      const mn = Math.round((a % 30) / 30 * 60) % 60;
      setTm(clamp(h * 60 + mn));
    }
  }, [svgAngle]);

  const handlePointerUp = useCallback(() => { dragRef.current = null; }, []);

  // attach move/up to svg so they work even during capture
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    el.addEventListener('pointermove',   handlePointerMove);
    el.addEventListener('pointerup',     handlePointerUp);
    el.addEventListener('pointercancel', handlePointerUp);
    return () => {
      el.removeEventListener('pointermove',   handlePointerMove);
      el.removeEventListener('pointerup',     handlePointerUp);
      el.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  // ── animated time advance ─────────────────────────────────────────────────
  const addTime = useCallback((delta) => {
    if (busy) return;
    setBusy(true);
    const durations = { 15: 1200, 30: 1900, 60: 2800 };
    const dur = durations[delta] ?? 1500;
    const t0  = performance.now();
    let s0;
    setTm((prev) => { s0 = prev; return prev; }); // read current without effect

    // We need the actual current value synchronously
    // Use a ref trick: store tm in a ref so the RAF callback can read it
    const start = tm;

    const step = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const e = ease(p);
      setTm(clamp(start + Math.round(delta * e)));
      if (p < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setTm(clamp(start + delta));
        setBusy(false);
      }
    };
    rafRef.current = requestAnimationFrame(step);
  }, [busy, tm]);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  // ── preset buttons ────────────────────────────────────────────────────────
  const preset = useCallback((mn) => {
    if (busy) return;
    setTm((prev) => clamp(Math.floor(prev / 60) * 60 + mn));
  }, [busy]);

  const setHour = useCallback((h) => {
    if (busy) return;
    setTm((prev) => clamp(h * 60 + (prev % 60)));
  }, [busy]);

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* clock svg — we attach the ref here and pass down onPointerDown */}
        <div ref={svgRef} style={{ lineHeight: 0 }}>
          <ClockFace
            minuteAngle={minuteAngle}
            hourAngle={hourAngle}
            onPointerDown={handlePointerDown}
          />
        </div>

        <DigitalDisplay hours={hours} minutes={minutes} />

        {/* controls */}
        <div style={styles.ctrl}>

          {/* row 1: hour picker + presets */}
          <div style={styles.row}>
            <select
              value={hours}
              disabled={busy}
              onChange={(e) => setHour(Number(e.target.value))}
              style={styles.select}
            >
              {[...Array(12)].map((_, i) => (
                <option key={i} value={i}>{i === 0 ? 12 : i}</option>
              ))}
            </select>
            <div style={styles.presetCol}>
              <BigButton onClick={() => preset(0)}  disabled={busy} variant="amber" style={styles.presetBtn}>o'clock</BigButton>
              <BigButton onClick={() => preset(15)} disabled={busy} variant="blue"  style={styles.presetBtn}>quarter past</BigButton>
              <BigButton onClick={() => preset(45)} disabled={busy} variant="blue"  style={styles.presetBtn}>quarter to</BigButton>
            </div>
          </div>

          <div style={styles.sep} />

          {/* row 2: time-advance */}
          <div style={styles.row}>
            <BigButton onClick={() => addTime(15)} disabled={busy} variant="purple" style={{ flex: 1 }}>+15 mins</BigButton>
            <BigButton onClick={() => addTime(30)} disabled={busy} variant="purple" style={{ flex: 1 }}>+30 mins</BigButton>
            <BigButton onClick={() => addTime(60)} disabled={busy} variant="purple" style={{ flex: 1 }}>+1 hour</BigButton>
          </div>

        </div>
      </div>
    </div>
  );
}

// ── styles ─────────────────────────────────────────────────────────────────
const styles = {
  page: {
    display: 'flex',
    justifyContent: 'center',
    padding: '24px 16px',
    minHeight: '100vh',
    background: '#f9f6f0',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    width: '100%',
    maxWidth: 380,
  },

  // ── digital display ──
  digWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 88,
    flexShrink: 0,
  },
  digH: {
    width: 84, height: 88,
    borderRadius: 18,
    background: '#FAEEDA',
    border: '3px solid #EF9F27',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  digM: {
    width: 84, height: 88,
    borderRadius: 18,
    background: '#E6F1FB',
    border: '3px solid #378ADD',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  digNumH: {
    fontSize: 52,
    fontWeight: 700,
    fontFamily: 'monospace',
    lineHeight: 1,
    fontVariantNumeric: 'tabular-nums',
    width: '100%',
    textAlign: 'center',
    color: '#633806',
  },
  digNumM: {
    fontSize: 52,
    fontWeight: 700,
    fontFamily: 'monospace',
    lineHeight: 1,
    fontVariantNumeric: 'tabular-nums',
    width: '100%',
    textAlign: 'center',
    color: '#0C447C',
  },
  digColon: {
    fontSize: 52,
    fontWeight: 700,
    color: '#aaa',
    lineHeight: 1,
    flexShrink: 0,
    width: 18,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  digLabelH: {
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.06em',
    marginTop: 3,
    color: '#854F0B',
    opacity: 0.8,
  },
  digLabelM: {
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.06em',
    marginTop: 3,
    color: '#185FA5',
    opacity: 0.8,
  },

  // ── controls ──
  ctrl: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 9,
  },
  row: {
    display: 'flex',
    gap: 7,
    alignItems: 'stretch',
  },
  sep: {
    height: 1,
    background: '#e5e5e5',
  },
  select: {
    width: 138,
    flexShrink: 0,
    padding: '0 8px',
    borderRadius: 14,
    fontSize: 52,
    fontWeight: 700,
    fontFamily: 'monospace',
    fontVariantNumeric: 'tabular-nums',
    border: '3px solid #EF9F27',
    background: '#FAEEDA',
    color: '#633806',
    cursor: 'pointer',
    textAlign: 'center',
  },
  presetCol: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  presetBtn: {
    width: '100%',
    padding: '0 20px',
    height: 42,
    minHeight: 0,
    minWidth: 0,
    boxSizing: 'border-box',
    fontSize: 14,
    whiteSpace: 'nowrap',
  },

};
