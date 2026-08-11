import { Flex, Grid } from "@chakra-ui/react";
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
import DialControl from "./DialControl";
import HalfDialControl from "./HalfDialControl";

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

    // Magnitude calculation: piecewise non-linear scale for precision
    // 0-8mph takes up 80% of the radius. 8-20mph takes the last 20%.
    const maxRadiusPx = rect.width / 2;
    const distPx = Math.sqrt(dx * dx + dy * dy);
    const r = distPx / maxRadiusPx;

    let speed = 0;
    if (r <= 0.8) {
      speed = (r / 0.8) * 8;
    } else if (r <= 1.0) {
      speed = 8 + ((r - 0.8) / 0.2) * 12; // 8 to 20
    } else {
      speed = 20 + ((r - 1.0) / 0.2) * 5; // >20 (dragging outside SVG)
    }

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
  let arrowLength = 0;
  if (wind <= 8) {
    arrowLength = (wind / 8) * 80;
  } else if (wind <= 20) {
    arrowLength = 80 + ((wind - 8) / 12) * 20;
  } else {
    arrowLength = 100 + ((wind - 20) / 5) * 20;
  }
  arrowLength = Math.min(arrowLength, 100);

  // Dynamic compass rings to visually show the shrink/grow scale
  const compassRings = [];
  const compassMaxSpeed = wind > 8 ? 20 : 10;
  const ringStep = compassMaxSpeed === 10 ? 2 : 5;
  for (let i = ringStep; i <= compassMaxSpeed; i += ringStep) {
    let r = 0;
    if (i <= 8) {
      r = (i / 8) * 80;
    } else {
      r = 80 + ((i - 8) / 12) * 20;
    }
    compassRings.push(
      <circle
        key={`cring-${i}`}
        cx="100"
        cy="100"
        r={r}
        fill="none"
        stroke="var(--border)"
        strokeWidth="1"
      />,
    );
  }

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
                  strokeWidth="2"
                  strokeDasharray="4,4"
                />
                {compassRings}
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

            <Grid
              className="hud-compass-inputs"
              templateColumns="1fr 1fr"
              gap="16px"
              mt="16px"
            >
              <DialControl
                label="Speed (mph)"
                value={wind}
                onChange={(val) => setWind(Number(val.toFixed(1)))}
                min={0}
                max={30}
                step={0.1}
                unitsPerRotation={1}
                formatValue={(v) => v.toFixed(1)}
              />

              <DialControl
                label="Angle (&deg;)"
                value={windAngle}
                onChange={(val) => {
                  let v = val;
                  if (v >= 360) v = v % 360;
                  if (v < 0) v = (v % 360) + 360;
                  setWindAngle(Math.round(v));
                }}
                min={-Infinity}
                max={Infinity}
                step={1}
                unitsPerRotation={360}
              />

              <HalfDialControl
                label="Distance"
                value={distance}
                onChange={setDistance}
                min={0}
                max={100}
                step={1}
                formatValue={(v) => `${v}%`}
                tickLabels={["Min", "50%", "Max"]}
              />

              <HalfDialControl
                label="Elevation"
                value={elevation}
                onChange={setElevation}
                min={-50}
                max={50}
                step={10}
                formatValue={(v) => `${v > 0 ? "+" : ""}${v}%`}
                tickLabels={["-50%", "0", "+50%"]}
              />
            </Grid>
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
                <div>
                  {sweCross > 0 &&
                    `SWE: ${sweCross} sq ${cwComponent > 0 ? "Left" : "Right"}`}
                  <br />
                </div>
                <div>
                  {sweHead > 0 &&
                    `SWE: ${sweHead} sq ${isHeadwind ? "Push Up" : "Pull Back"}`}
                </div>
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
