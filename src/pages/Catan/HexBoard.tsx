

type Resource = 'Wheat' | 'Ore' | 'Wood' | 'Sheep' | 'Brick' | 'Gold';

const resourceStyles: Record<Resource, { color: string; icon: string; label: string }> = {
  Wheat: {
    color: '#f7e9a0',
    icon: '🌾',
    label: 'Wheat',
  },
  Ore: {
    color: '#b0b6c6',
    icon: '⛏️',
    label: 'Ore',
  },
  Wood: {
    color: '#7c9a5c',
    icon: '🌲',
    label: 'Wood',
  },
  Sheep: {
    color: '#e6f7d4',
    icon: '🐑',
    label: 'Sheep',
  },
  Brick: {
    color: '#c97a5a',
    icon: '🧱',
    label: 'Brick',
  },
  Gold: {
    color: 'gold',
    icon: '💰',
    label: 'Gold',
  },
};

type HexProps = {
  q: number;
  r: number;
  size: number;
  resource: Resource;
};

type HexWithNumberProps = HexProps & { numberToken?: number | null };

const Hex: React.FC<HexWithNumberProps> = ({ q, r, size, resource, numberToken }) => {
  // Axial -> Pixel coordinates
  const x = size * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
  const y = size * (3 / 2) * r;

  // Build hexagon polygon points
  const points = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (60 * i - 30);
    const px = x + size * Math.cos(angle);
    const py = y + size * Math.sin(angle);
    return `${px},${py}`;
  }).join(" ");

  const style = resourceStyles[resource];
  const isHot = numberToken === 6 || numberToken === 8;

  return (
    <g>
      <polygon
        points={points}
        fill={style.color}
        stroke="#6b3e26"
        strokeWidth={6}
        filter="drop-shadow(0 2px 12px #bfa76a88)"
      />
      {/* Icon overlay */}
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={-10}
          textAnchor="middle"
          fontSize={size * 0.6}
          fontFamily="'UnifrakturCook', serif"
          dominantBaseline="middle"
          fill="#6b3e26"
          filter="drop-shadow(0 2px 6px #fff8)"
        >
          {style.icon}
        </text>
        {/* Number token circle, only if numberToken is not null */}
  {typeof numberToken === 'number' && (
          <g>
            <circle
              cx={0}
              cy={size * 0.38}
              r={size * 0.22}
              fill={isHot ? '#fff0f0' : '#fffbe6'}
              stroke={isHot ? '#c00' : '#bfa76a'}
              strokeWidth={isHot ? 5 : 3}
              filter={isHot ? 'drop-shadow(0 0 10px #c00a)' : 'drop-shadow(0 0 6px #bfa76a88)'}
            />
            <text
              x={0}
              y={size * 0.38 + 6}
              textAnchor="middle"
              fontSize={size * 0.22}
              fontFamily="'UnifrakturCook', serif"
              fill={isHot ? '#c00' : '#6b3e26'}
              style={{ fontWeight: 700, letterSpacing: '0.04em', filter: isHot ? 'drop-shadow(0 0 6px #c00a)' : undefined }}
            >
              {numberToken}
            </text>
          </g>
        )}
      </g>
    </g>
  );
};


interface ClaimedSpot {
  type: 'house' | 'road';
  id: number;
  player: number;
}

interface HexBoardProps {
  tileCount: number;
  players?: string[];
  claimedSpots?: ClaimedSpot[];
  placementPhase?: 'setup' | 'done';
  currentPlayerIdx?: number;
  onPlaceSpot?: (type: 'house' | 'road', id: number) => void;
}

const playerColors = [
  '#e63946', // Red
  '#457b9d', // Blue
  '#2a9d8f', // Teal
  '#f4a261', // Orange
  '#a8dadc', // Light Blue
  '#bfa76a', // Gold
  '#6b3e26', // Brown
  '#264653', // Dark Blue
];

export const HexBoard: React.FC<HexBoardProps> = ({ tileCount, players = [], claimedSpots = [], placementPhase = 'done', currentPlayerIdx = 0, onPlaceSpot }) => {
  // Only support 19 or 30 for now
  const size = 95;
  let radius = 2;
  let width = 950;
  let height = 950;
  if (tileCount === 30) {
    radius = 3;
    width = 1300;
    height = 1300;
  }


  // Generate axial coordinates for hexes in radius 2 or 3
  const hexes: { q: number; r: number }[] = [];
  for (let q = -radius; q <= radius; q++) {
    for (let r = -radius; r <= radius; r++) {
      const s = -q - r;
      if (Math.max(Math.abs(q), Math.abs(r), Math.abs(s)) <= radius) {
        hexes.push({ q, r });
      }
    }
  }

  // Assign resources randomly, with a 2% chance for a single gold mine
  const resourceTypes: Resource[] = ['Wheat', 'Ore', 'Wood', 'Sheep', 'Brick'];
  // const resourceCounts: Record<Resource, number> = {
  //   Wheat: 0,
  //   Ore: 0,
  //   Wood: 0,
  //   Sheep: 0,
  //   Brick: 0,
  //   Gold: 0,
  // };
  // Shuffle and assign resources
  function shuffle<T>(arr: T[]): T[] {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Decide if there will be a gold mine (2% chance)
  const hasGold = Math.random() < 0.02;
  let goldIndex = hasGold ? Math.floor(Math.random() * hexes.length) : -1;

  // Distribute resources as evenly as possible
  const baseCount = Math.floor(hexes.length / resourceTypes.length);
  let remainder = hexes.length % resourceTypes.length;
  let resourcePool: Resource[] = [];
  for (const res of resourceTypes) {
    let count = baseCount + (remainder > 0 ? 1 : 0);
    remainder--;
    resourcePool.push(...Array(count).fill(res));
  }
  resourcePool = shuffle(resourcePool);
  if (hasGold && goldIndex >= 0) {
    resourcePool[goldIndex] = 'Gold';
  }


  // Map each hex to a resource
  const hexResources = hexes.map((_h, i) => resourcePool[i] as Resource);

  // Assign number tokens (2-12, excluding 7) randomly to each tile
  const numberTokens = [2, 3, 4, 5, 6, 8, 9, 10, 11, 12];
  // For 19 tiles, repeat numbers as needed (Catan classic: 18 numbers, 1 desert/gold)
  let tokenPool: number[] = [];
  if (hexes.length === 19) {
    tokenPool = [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12];
    // 1 tile (desert/gold) gets no number
    tokenPool = shuffle(tokenPool);
  } else {
    // For XL, just fill with random numbers (excluding 7)
    for (let i = 0; i < hexes.length; i++) {
      tokenPool.push(numberTokens[Math.floor(Math.random() * numberTokens.length)]);
    }
  }

  // Assign numbers to all tiles, including gold
  let hexNumberTokens: number[] = [];
  for (let i = 0; i < hexes.length; i++) {
    hexNumberTokens.push(tokenPool[i % tokenPool.length]);
  }


  // --- Generate unique vertices (for houses) and edges (for roads) ---
  // Each hex has 6 vertices and 6 edges. We'll use a map to deduplicate.
  type Point = { x: number; y: number };
  function roundPt(pt: Point) {
    // Round to avoid floating point issues
    return { x: Math.round(pt.x * 1000) / 1000, y: Math.round(pt.y * 1000) / 1000 };
  }
  // Vertices: key = "x,y"
  const vertexMap = new Map<string, Point>();
  // Edges: key = "x1,y1|x2,y2" (sorted)
  const edgeMap = new Map<string, [Point, Point]>();
  for (const hex of hexes) {
    const { q, r } = hex;
    const cx = size * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
    const cy = size * (3 / 2) * r;
    // 6 vertices
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 180) * (60 * i - 30);
      const vx = cx + size * Math.cos(angle);
      const vy = cy + size * Math.sin(angle);
      const vkey = `${Math.round(vx * 1000) / 1000},${Math.round(vy * 1000) / 1000}`;
      vertexMap.set(vkey, { x: vx, y: vy });
    }
    // 6 edges
    for (let i = 0; i < 6; i++) {
      const angle1 = (Math.PI / 180) * (60 * i - 30);
      const angle2 = (Math.PI / 180) * (60 * ((i + 1) % 6) - 30);
      const p1 = roundPt({ x: cx + size * Math.cos(angle1), y: cy + size * Math.sin(angle1) });
      const p2 = roundPt({ x: cx + size * Math.cos(angle2), y: cy + size * Math.sin(angle2) });
      // Sort points for unique key
      const ekey = p1.x < p2.x || (p1.x === p2.x && p1.y < p2.y)
        ? `${p1.x},${p1.y}|${p2.x},${p2.y}`
        : `${p2.x},${p2.y}|${p1.x},${p1.y}`;
      edgeMap.set(ekey, [p1, p2]);
    }
  }
  // Assign numbers
  const vertexList = Array.from(vertexMap.values());
  const edgeList = Array.from(edgeMap.values());
  // Center offset
  const centerX = width / 2;
  const centerY = height / 2;

  return (
    <>
      {/* Resource Legend OUTSIDE the board container */}
      <div style={{ position: 'fixed', top: 115, left: 24, background: 'rgba(245,233,198,0.92)', borderRadius: 16, padding: '18px 24px', boxShadow: '0 2px 12px #bfa76a88', zIndex: 1000, fontFamily: 'UnifrakturCook, serif', border: '2px solid #bfa76a' }}>
        <div style={{ fontWeight: 700, fontSize: 22, color: '#6b3e26', marginBottom: 8 }}>Legend</div>
        {Object.entries(resourceStyles).map(([key, val]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', marginBottom: 4, fontSize: 18 }}>
            <span style={{ fontSize: 28, marginRight: 10 }}>{val.icon}</span>
            <span style={{ color: '#6b3e26' }}>{val.label}</span>
          </div>
        ))}
        {/* Player Legend */}
        {players.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <div style={{ fontWeight: 700, fontSize: 20, color: '#6b3e26', marginBottom: 6 }}>Players (Draft Order)</div>
            {players.map((name, idx) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', marginBottom: 4, fontSize: 17 }}>
                <span style={{
                  display: 'inline-block',
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: playerColors[idx % playerColors.length],
                  marginRight: 10,
                  border: '2px solid #6b3e26',
                  boxShadow: '0 1px 4px #0002',
                  textAlign: 'center',
                  lineHeight: '18px',
                  fontWeight: 700,
                  color: '#fff',
                  fontSize: 13
                }}>{idx + 1}</span>
                <span style={{ color: '#232526', fontWeight: 600 }}>{name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ position: 'relative', width: '100%', height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          height="100%"
          style={{ background: 'none', maxWidth: width, maxHeight: height }}
        >
          <g transform={`translate(${centerX}, ${centerY})`}>
            {/* Render hexes */}
            {hexes.map((h, i) => (
              <Hex key={i} q={h.q} r={h.r} size={size} resource={hexResources[i]} numberToken={hexNumberTokens[i]} />
            ))}
            {/* Render house spots (vertices) */}
            {vertexList.map((v, i) => {
              const claimed = claimedSpots.find(s => s.type === 'house' && s.id === i+1);
              const isCurrent = placementPhase === 'setup' && !claimed && onPlaceSpot && currentPlayerIdx !== undefined &&
                ((claimedSpots.length % 2 === 0));
              return (
                <g key={`H${i+1}`}
                  style={{ cursor: isCurrent ? 'pointer' : 'default', opacity: claimed ? 0.5 : 1 }}
                  onClick={() => isCurrent && onPlaceSpot('house', i+1)}
                >
                  <circle cx={v.x} cy={v.y} r={18} fill={claimed ? playerColors[claimed.player % playerColors.length] : '#fffbe6'} stroke="#bfa76a" strokeWidth={2} />
                  <text x={v.x} y={v.y+6} textAnchor="middle" fontSize={18} fontFamily="'JetBrains Mono',monospace" fill={claimed ? '#fff' : '#6b3e26'} fontWeight={700}>H{i+1}</text>
                </g>
              );
            })}
            {/* Render road spots (edges) */}
            {edgeList.map(([p1, p2], i) => {
              const claimed = claimedSpots.find(s => s.type === 'road' && s.id === i+1);
              const isCurrent = placementPhase === 'setup' && !claimed && onPlaceSpot && currentPlayerIdx !== undefined &&
                ((claimedSpots.length % 2 === 1));
              const mx = (p1.x + p2.x) / 2;
              const my = (p1.y + p2.y) / 2;
              return (
                <g key={`R${i+1}`}
                  style={{ cursor: isCurrent ? 'pointer' : 'default', opacity: claimed ? 0.5 : 1 }}
                  onClick={() => isCurrent && onPlaceSpot('road', i+1)}
                >
                  <rect x={mx-14} y={my-8} width={28} height={16} rx={7} fill={claimed ? playerColors[claimed.player % playerColors.length] : '#fffbe6'} stroke="#bfa76a" strokeWidth={2} transform={`rotate(${Math.atan2(p2.y-p1.y,p2.x-p1.x)*180/Math.PI},${mx},${my})`} />
                  <text x={mx} y={my+6} textAnchor="middle" fontSize={16} fontFamily="'JetBrains Mono',monospace" fill={claimed ? '#fff' : '#6b3e26'} fontWeight={700}>R{i+1}</text>
                </g>
              );
            })}
          </g>
        </svg>
        {/* Medieval font import for SVG */}
        <link href="https://fonts.googleapis.com/css2?family=UnifrakturCook:wght@700&display=swap" rel="stylesheet" />
      </div>
    </>
  );
};
