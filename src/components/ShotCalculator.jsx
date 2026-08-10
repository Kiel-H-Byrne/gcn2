import { useEffect, useRef, useState } from "react";
import balls from "../data/balls";
import {
  WIND_MODES,
  maxPower,
  midPower,
  minPower,
  windPerRing,
} from "../lib/wind";
import { accentVar } from "../utils";
import CategoryIcon from "./CategoryIcon";

export default function ShotCalculator({
  bag,
  clubs,
  settings,
  setSettings,
  isWidgetMode,
}) {
  const [selectedClubId, setSelectedClubId] = useState(bag[0]?.clubId || "");
  const [wind, setWind] = useState(5.0);
  const [windAngle, setWindAngle] = useState(0);
  const [distance, setDistance] = useState(50);

  const elevation = Number(settings.elevation) || 0;
  const setElevation = (val) => setSettings({ ...settings, elevation: val });

  const compassRef = useRef(null);

  useEffect(() => {
    if (bag.length > 0 && !bag.find((c) => c.clubId === selectedClubId)) {
      setSelectedClubId(bag[0].clubId);
    }
  }, [bag, selectedClubId]);

  // Set default distance based on club category when selected club changes
  const currentClubId = bag.find((b) => b.clubId === selectedClubId)
    ? selectedClubId
    : bag[0]?.clubId;

  useEffect(() => {
    if (!currentClubId) return;
    const c = clubs.find((cl) => cl.id === currentClubId);
    if (!c) return;

    if (c.category === "Drivers" || c.category === "Woods") {
      setDistance(100);
    } else if (c.category === "ShortIrons") {
      setDistance(15); // near min
    } else {
      setDistance(50); // middle for everything else
    }
  }, [currentClubId, clubs]);

  if (bag.length === 0) return null;
  const bagEntry = bag.find((b) => b.clubId === currentClubId);
  if (!bagEntry) return null;

  const club = clubs.find((c) => c.id === bagEntry.clubId);
  const level = bagEntry.level;
  const selectedBall =
    balls.find((b) => b.name === settings.ballName) || balls[0];
  const mode = WIND_MODES[selectedBall.power] || WIND_MODES[0];

  const minP = minPower(club, level, mode);
  const midP = midPower(club, level, mode);
  const maxP = maxPower(club, level, mode);

  let currentPower;
  if (distance <= 50) {
    currentPower = minP + (midP - minP) * (distance / 50);
  } else {
    currentPower = midP + (maxP - midP) * ((distance - 50) / 50);
  }

  const wpr = windPerRing(club, level, currentPower);
  const elevMult = 1 + elevation / 100;
  const effectiveWind = (parseFloat(wind) || 0) * elevMult;

  const rings = effectiveWind / wpr;
  const displayRings = wind && !isNaN(rings) ? rings.toFixed(2) : "0.00";

  const angleRad = (windAngle * Math.PI) / 180;
  const cwComponent = effectiveWind * Math.sin(angleRad);
  const hwComponent = effectiveWind * Math.cos(angleRad);

  const sweCross = Math.abs(cwComponent * 0.2).toFixed(1);
  const sweHead = Math.abs(hwComponent * 0.2).toFixed(1);
  const isHeadwind = hwComponent < 0;

  const handleCompassDrag = (e) => {
    if (!compassRef.current) return;
    const rect = compassRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const dx = clientX - centerX;
    const dy = clientY - centerY;

    // Angle calculation
    let theta = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (theta < 0) theta += 360;
    setWindAngle(Math.round(theta));

    // Magnitude calculation (max radius = 20 wind speed)
    const maxRadiusPx = rect.width / 2;
    const distPx = Math.sqrt(dx * dx + dy * dy);
    let speed = (distPx / maxRadiusPx) * 20;
    if (speed > 25) speed = 25;
    setWind(Number(speed.toFixed(1)));
  };

  const handlePointerDown = (e) => {
    e.target.setPointerCapture(e.pointerId);
    handleCompassDrag(e);
  };

  const handlePointerMove = (e) => {
    if (e.buttons > 0 || (e.touches && e.touches.length > 0)) {
      handleCompassDrag(e);
    }
  };

  // Ring target visualization math
  const maxRings = Math.max(5, Math.ceil(rings / 5) * 5);
  const center = maxRings * 20;
  const svgSize = maxRings * 40;
  const scale = maxRings / 5;
  // Flipped logic: red line now shows the Counter-Adjustment (pull direction) instead of wind push
  const targetX = center - rings * 20 * Math.sin(angleRad);
  const targetY = center + rings * 20 * Math.cos(angleRad);

  const ringColorsArray = [
    "var(--ring-1)",
    "var(--ring-2)",
    "var(--ring-3)",
    "var(--ring-4)",
    "var(--ring-5)",
  ];
  const renderedRings = [];
  for (let i = maxRings; i >= 1; i--) {
    const r = i * 20;
    const color = ringColorsArray[(i - 1) % 5];
    renderedRings.push(
      <circle key={i} cx={center} cy={center} r={r} fill={color} />,
    );
  }

  // Determine vector arrow length for compass (0 to 100 max)
  const arrowLength = Math.min((wind / 20) * 100, 100);

  const getClubAbbr = (name) => {
    const words = name.replace(/^The\s/i, "").split(" ");
    if (words.length > 1)
      return words
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .substring(0, 3);
    return words[0].substring(0, 4);
  };

  return (
    <section
      className="shot-calculator hud-widget"
      style={{ "--calc-accent": accentVar(club.category) }}
    >
      <div className="calc-header">
        <div className="calc-header-title">
          <CategoryIcon
            category={club.category}
            size={20}
            style={{ color: "var(--calc-accent)" }}
          />
          <h3>HUD: Quick Calculator</h3>
        </div>
        {!isWidgetMode && (
          <p className="calc-header-subtitle">
            <strong>How to use:</strong> Drag the wind compass to simultaneously
            set angle & speed. Tweak distance/elevation below, and read your
            exact ring adjustment and counter-drag vector on the right.
          </p>
        )}
      </div>

      <div className="hud-grid">
        {/* Left Side: Vector Compass & Sliders */}
        <div className="hud-controls">
          <div className="hud-club-bar">
            <div className="hud-club-buttons">
              {bag.map((b) => {
                const c = clubs.find((cl) => cl.id === b.clubId);
                if (!c) return null;
                const isActive = currentClubId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedClubId(c.id)}
                    style={{
                      background: isActive
                        ? accentVar(c.category)
                        : "var(--surface-2)",
                      color: isActive ? "#fff" : "var(--text-primary)",
                      border: `1px solid ${isActive ? "transparent" : "var(--border-strong)"}`,
                    }}
                  >
                    <CategoryIcon category={c.category} size={16} />
                    <span>{getClubAbbr(c.name)}</span>
                  </button>
                );
              })}
            </div>

            <div className="hud-club-divider" />

            <select
              value={settings.ballName}
              onChange={(e) =>
                setSettings({ ...settings, ballName: e.target.value })
              }
              className="hud-club-select"
            >
              {balls.map((b) => (
                <option key={b.name} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="hud-compass-row">
            <div
              className="hud-compass-wrap"
              title="Drag arrow to set Wind Angle & Speed"
            >
              <svg
                viewBox="0 0 200 200"
                ref={compassRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                className="hud-compass-svg"
              >
                <circle
                  cx="100"
                  cy="100"
                  r="95"
                  fill="none"
                  stroke="var(--border-strong)"
                  strokeWidth="4"
                  strokeDasharray="10,10"
                />
                <line
                  x1="100"
                  y1="0"
                  x2="100"
                  y2="200"
                  stroke="var(--gridline)"
                  strokeWidth="2"
                />
                <line
                  x1="0"
                  y1="100"
                  x2="200"
                  y2="100"
                  stroke="var(--gridline)"
                  strokeWidth="2"
                />

                {/* Wind Vector Arrow */}
                <g transform={`rotate(${windAngle}, 100, 100)`}>
                  <line
                    x1="100"
                    y1="100"
                    x2="100"
                    y2={100 - arrowLength + 10}
                    stroke="var(--series-1)"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  <polygon
                    points={`85,${100 - arrowLength + 15} 100,${100 - arrowLength - 5} 115,${100 - arrowLength + 15}`}
                    fill="var(--series-1)"
                  />
                </g>
                <circle cx="100" cy="100" r="6" fill="var(--text-primary)" />
                <circle cx="100" cy="100" r="100" fill="transparent" />
              </svg>
            </div>

            <div className="hud-compass-inputs">
              <div className="control-group">
                <label>Speed (mph)</label>
                <input
                  type="number"
                  step="0.1"
                  inputMode="decimal"
                  value={wind}
                  onChange={(e) => {
                    let val = parseFloat(e.target.value);
                    if (!isNaN(val)) {
                      setWind(Number(val.toFixed(1)));
                    } else {
                      setWind("");
                    }
                  }}
                />
              </div>
              <div className="control-group">
                <label>Angle (&deg;)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={windAngle}
                  onChange={(e) => setWindAngle(Number(e.target.value) % 360)}
                />
              </div>
            </div>
          </div>

          <div className="calc-slider-wrap">
            <div className="slider-labels">
              <span>Min</span>
              <span>Dist: {distance}%</span>
              <span>Max</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={distance}
              onChange={(e) => setDistance(Number(e.target.value))}
              className="slider-input"
            />
          </div>

          <div className="calc-slider-wrap">
            <div className="slider-labels">
              <span>-50%</span>
              <span>Elev: {elevation}%</span>
              <span>+50%</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              step="10"
              value={elevation}
              onChange={(e) => setElevation(Number(e.target.value))}
              className="slider-input"
            />
          </div>
        </div>

        {/* Right Side: LED Screen & Target Vis */}
        <div className="hud-results">
          <div className="calc-result hud-screen ">
            <div className="result-label">Adjust Rings</div>
            <div className="result-value">{displayRings}</div>
            {wind > 0 && (
              <div
                style={{
                  marginTop: "8px",
                  fontSize: "0.75rem",
                  opacity: 0.8,
                  textAlign: "center",
                }}
              >
                {sweCross > 0 &&
                  `SWE: ${sweCross} sq ${cwComponent > 0 ? "Right" : "Left"}`}
                <br />
                {sweHead > 0 &&
                  `SWE: ${sweHead} sq ${isHeadwind ? "Push Up" : "Pull Back"}`}
              </div>
            )}
            <div className="hud-target-vis">
              <svg viewBox={`0 0 ${svgSize} ${svgSize}`}>
                <defs>
                  <clipPath id="rc">
                    <circle cx={center} cy={center} r={center} />
                  </clipPath>
                </defs>
                <g clipPath="url(#rc)">
                  {renderedRings}
                  <line
                    x1="0"
                    y1={center}
                    x2={svgSize}
                    y2={center}
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth={1 * scale}
                  />
                  <line
                    x1={center}
                    y1="0"
                    x2={center}
                    y2={svgSize}
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth={1 * scale}
                  />
                  <circle
                    cx={targetX}
                    cy={targetY}
                    r={8 * scale}
                    fill="var(--danger)"
                    stroke="var(--surface-1)"
                    strokeWidth={2 * scale}
                  />
                  <line
                    x1={center}
                    y1={center}
                    x2={targetX}
                    y2={targetY}
                    stroke="var(--danger)"
                    strokeWidth={2 * scale}
                    strokeDasharray={`${4 * scale},${4 * scale}`}
                  />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
