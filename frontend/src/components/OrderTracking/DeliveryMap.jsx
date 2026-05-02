import PropTypes from 'prop-types'
import { motion } from 'framer-motion'

const ROUTE_PATH =
  'M 80 380 C 120 350, 160 300, 200 280 C 250 255, 280 240, 320 210 C 370 175, 400 155, 440 130 C 480 105, 510 110, 550 90 C 590 70, 620 60, 660 50'

const ROUTE_POINTS = [
  [80, 380],
  [200, 280],
  [320, 210],
  [440, 130],
  [660, 50],
]

function getVehiclePoint(progress) {
  const clamped = Math.max(0, Math.min(progress, 1))
  const scaled = clamped * (ROUTE_POINTS.length - 1)
  const index = Math.floor(scaled)
  const nextIndex = Math.min(index + 1, ROUTE_POINTS.length - 1)
  const local = scaled - index
  const [x1, y1] = ROUTE_POINTS[index]
  const [x2, y2] = ROUTE_POINTS[nextIndex]

  return {
    x: x1 + (x2 - x1) * local,
    y: y1 + (y2 - y1) * local,
  }
}

function VehicleMarker({ x, y }) {
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.4, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      transform={`translate(${x} ${y})`}
    >
      <motion.circle
        r="28"
        fill="none"
        stroke="#B08968"
        strokeWidth="2"
        animate={{ r: [28, 42, 28], opacity: [0.8, 0, 0.8] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
      />
      <circle
        r="22"
        fill="rgba(243,233,215,0.94)"
        style={{ filter: 'drop-shadow(0 4px 12px rgba(59,42,34,0.25))' }}
      />
      <rect x="-13" y="-5" width="20" height="10" rx="3" fill="#7A553A" />
      <rect x="2" y="-10" width="9" height="9" rx="2" fill="#B08968" />
      <circle cx="-7" cy="8" r="4" fill="#3B2A22" />
      <circle cx="9" cy="8" r="4" fill="#3B2A22" />
      <path
        d="M -15 2 L -22 2"
        stroke="#B08968"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </motion.g>
  )
}

VehicleMarker.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
}

export default function DeliveryMap({ progress = 0.7 }) {
  const vehicle = getVehiclePoint(progress)

  return (
    <div
      className="relative w-full overflow-hidden rounded-[16px] bg-[#EDE4D5]"
      style={{ aspectRatio: '16/7' }}
    >
      <svg
        viewBox="0 0 740 420"
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Illustrated delivery route map"
      >
        <defs>
          <pattern
            id="topo"
            x="0"
            y="0"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx="20"
              cy="20"
              r="18"
              fill="none"
              stroke="rgba(176,137,104,0.08)"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="740" height="420" fill="url(#topo)" />

        {[
          [50, 200, 60, 50],
          [130, 240, 45, 70],
          [200, 180, 55, 40],
          [300, 300, 70, 55],
          [380, 250, 40, 65],
          [450, 200, 60, 45],
          [530, 320, 50, 60],
          [600, 280, 45, 50],
          [650, 180, 60, 40],
        ].map(([x, y, width, height], index) => (
          <rect
            key={index}
            x={x}
            y={y}
            width={width}
            height={height}
            rx="3"
            fill="#D6BFA6"
            opacity="0.6"
          />
        ))}

        {[
          [170, 150],
          [340, 150],
          [500, 160],
          [610, 120],
        ].map(([cx, cy], index) => (
          <g key={index}>
            <circle cx={cx} cy={cy} r="14" fill="rgba(120,150,100,0.25)" />
            <circle
              cx={cx + 10}
              cy={cy + 10}
              r="10"
              fill="rgba(120,150,100,0.20)"
            />
            <circle
              cx={cx - 8}
              cy={cy + 5}
              r="9"
              fill="rgba(120,150,100,0.18)"
            />
          </g>
        ))}

        {[
          'M 150 420 Q 150 300 200 280',
          'M 350 420 Q 350 320 320 210',
          'M 500 420 Q 500 250 440 130',
        ].map((path) => (
          <path
            key={path}
            d={path}
            stroke="rgba(176,137,104,0.3)"
            strokeWidth="1.5"
            fill="none"
            strokeDasharray="6 4"
          />
        ))}

        <path
          d={ROUTE_PATH}
          stroke="rgba(122,85,58,0.15)"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
        />
        <motion.path
          d={ROUTE_PATH}
          stroke="#B08968"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          pathLength="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: progress }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
        />

        <g transform="translate(68, 365)">
          <circle r="18" fill="#3B2A22" />
          <rect x="-7" y="-5" width="14" height="10" rx="1.5" fill="#F3E9D7" />
          <rect x="-5" y="-9" width="10" height="6" rx="1" fill="#B08968" />
        </g>
        <text
          x="68"
          y="400"
          textAnchor="middle"
          fontFamily="DM Sans"
          fontSize="9"
          fill="#7A553A"
          fontWeight="500"
        >
          Warehouse
        </text>

        <g transform="translate(665, 35)">
          <circle r="18" fill="#7A553A" />
          <path d="M -7 2 L 0 -7 L 7 2 L 7 8 L -7 8 Z" fill="#F3E9D7" />
          <rect x="-2" y="3" width="4" height="5" fill="#B08968" />
        </g>
        <text
          x="665"
          y="70"
          textAnchor="middle"
          fontFamily="DM Sans"
          fontSize="9"
          fill="#7A553A"
          fontWeight="500"
        >
          Your Home
        </text>

        <VehicleMarker x={vehicle.x} y={vehicle.y} />
      </svg>
    </div>
  )
}

DeliveryMap.propTypes = {
  progress: PropTypes.number,
}
