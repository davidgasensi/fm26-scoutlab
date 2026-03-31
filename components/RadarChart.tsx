"use client";

interface RadarChartProps {
  attributes: { name: string; value: number }[];
  maxValue?: number;
  size?: number;
  color?: string;
  secondaryAttributes?: { name: string; value: number }[];
  secondaryColor?: string;
  tertiaryAttributes?: { name: string; value: number }[];
  tertiaryColor?: string;
}

export default function RadarChart({
  attributes,
  maxValue = 20,
  size = 180,
  color = "#00ff87",
  secondaryAttributes,
  secondaryColor = "#f97316",
  tertiaryAttributes,
  tertiaryColor = "#a78bfa",
}: RadarChartProps) {
  const n = attributes.length;
  if (n < 3) return null;

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.36;
  const labelR = r + 28;
  const angleStep = (2 * Math.PI) / n;
  const startAngle = -Math.PI / 2;

  const getPoint = (index: number, value: number) => {
    const angle = startAngle + index * angleStep;
    const ratio = Math.min(value / maxValue, 1);
    return { x: cx + r * ratio * Math.cos(angle), y: cy + r * ratio * Math.sin(angle) };
  };

  const getEdge = (index: number, ratio = 1) => {
    const angle = startAngle + index * angleStep;
    return { x: cx + r * ratio * Math.cos(angle), y: cy + r * ratio * Math.sin(angle) };
  };

  const toPath = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ") + " Z";

  const dataPath = toPath(attributes.map((a, i) => getPoint(i, a.value)));
  const secondaryPath = secondaryAttributes
    ? toPath(secondaryAttributes.map((a, i) => getPoint(i, a.value)))
    : null;
  const tertiaryPath = tertiaryAttributes
    ? toPath(tertiaryAttributes.map((a, i) => getPoint(i, a.value)))
    : null;

  const levels = [0.25, 0.5, 0.75, 1.0];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: "visible" }}>
      {/* Grid rings */}
      {levels.map((level) => (
        <polygon
          key={level}
          points={Array.from({ length: n }, (_, i) => {
            const p = getEdge(i, level);
            return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
          }).join(" ")}
          fill="none"
          stroke={level === 1.0 ? "#ffffff18" : "#ffffff0c"}
          strokeWidth="0.5"
        />
      ))}

      {/* Axes */}
      {Array.from({ length: n }, (_, i) => {
        const end = getEdge(i);
        return (
          <line
            key={attributes[i].name}
            x1={cx.toFixed(2)} y1={cy.toFixed(2)}
            x2={end.x.toFixed(2)} y2={end.y.toFixed(2)}
            stroke="#ffffff12"
            strokeWidth="0.5"
          />
        );
      })}

      {/* Secondary polygon (comparison) */}
      {secondaryPath && (
        <>
          <path d={secondaryPath} fill={`${secondaryColor}18`} stroke={secondaryColor} strokeWidth="1.5" strokeOpacity="0.7" />
          {secondaryAttributes!.map((a, i) => {
            const p = getPoint(i, secondaryAttributes![i].value);
            return <circle key={a.name} cx={p.x} cy={p.y} r="2" fill={secondaryColor} opacity="0.7" />;
          })}
        </>
      )}

      {/* Tertiary polygon (3rd player) */}
      {tertiaryPath && (
        <>
          <path d={tertiaryPath} fill={`${tertiaryColor}18`} stroke={tertiaryColor} strokeWidth="1.5" strokeOpacity="0.7" />
          {tertiaryAttributes!.map((a, i) => {
            const p = getPoint(i, tertiaryAttributes![i].value);
            return <circle key={a.name} cx={p.x} cy={p.y} r="2" fill={tertiaryColor} opacity="0.7" />;
          })}
        </>
      )}

      {/* Primary polygon */}
      <path d={dataPath} fill={`${color}20`} stroke={color} strokeWidth="1.5" />
      {attributes.map((a, i) => {
        const p = getPoint(i, a.value);
        return <circle key={a.name} cx={p.x} cy={p.y} r="2.5" fill={color} />;
      })}

      {/* Labels */}
      {attributes.map((a, i) => {
        const angle = startAngle + i * angleStep;
        const x = cx + labelR * Math.cos(angle);
        const y = cy + labelR * Math.sin(angle);
        const short = a.name.length > 12 ? a.name.slice(0, 12) : a.name;
        return (
          <text
            key={a.name}
            x={x.toFixed(2)}
            y={y.toFixed(2)}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="9"
            fill="#8b95a1"
            fontFamily="monospace"
          >
            {short}
          </text>
        );
      })}
    </svg>
  );
}
