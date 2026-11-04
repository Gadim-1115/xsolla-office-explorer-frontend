import type { ZoneDTO } from '../../../shared/types/api.types'
import { ZONE_LABEL_POSITIONS } from '../../../shared/constants/mapIds'

interface CrescentFloorSvgProps {
  zones: Record<string, ZoneDTO>
  hoveredZoneId: string | null
  onHoverZone: (zoneId: string | null) => void
  onClickZone: (zoneId: string) => void
}

interface SvgZoneDefinition {
  id: string
  d: string
}

const SVG_ZONES: SvgZoneDefinition[] = [
  {
    id: 'zone_gameroom_4',
    d: 'M875 192L889 271.5L819 288.5L793.5 211C824.868 200.601 851.893 195.129 875 192Z',
  },
  {
    id: 'zone_gameroom_3',
    d: 'M749 315L688.5 351L643 286.5C693.811 250.606 745.307 227.381 792 211.902L817.5 288.713L808 291L749 315Z',
  },
  {
    id: 'zone_gameroom_2',
    d: 'M687 352L631 400.5L613.5 420.5L550.5 369.5C578.918 336.608 609.109 310.555 641.5 287.673L687 352Z',
  },
  {
    id: 'zone_gameroom_1',
    d: 'M552.5 500L491 455C508.001 423.759 527.713 395.855 549.187 371L612.603 422L589.5 449V500H552.5Z',
  },
  {
    id: 'zone_meeting_1',
    d: 'M1143 316.5L1181.5 231.5C1199.1 237.1 1239.17 261.167 1257 272.5L1200 348L1143 316.5Z',
  },
  {
    id: 'zone_session',
    d: 'M1182.5 370V452L1317.5 477.5L1353 473L1414 431C1389.2 373.8 1300 302.167 1258.5 273.5L1182.5 370Z',
  },
  {
    id: 'zone_meeting_2',
    d: 'M1354.5 474.5L1416.5 432C1436.9 464.4 1458.67 512.167 1467 532L1442 542H1354.5V474.5Z',
  },
  {
    id: 'zone_meeting_3',
    d: 'M1354.5 610.5V544H1442L1467.5 534C1473.1 542.8 1485.17 588.667 1490.5 610.5H1354.5Z',
  },
  {
    id: 'zone_meeting_4',
    d: 'M1352.5 648.5L1354 612.5H1468.5V632.5H1479.5V637.5C1445.1 673.5 1410.17 704.5 1397 715.5L1385 701C1388.6 695.4 1384.83 689.667 1382.5 687.5L1352.5 648.5Z',
  },
  {
    id: 'zone_meeting_11',
    d: 'M1384 702L1395.5 716.5C1377.5 733.3 1344 755.5 1329.5 764.5L1284 693L1351.5 650L1380 687.5C1387.2 690.3 1385.67 698.333 1384 702Z',
  },
  {
    id: 'zone_open_space_2',
    d: 'M659 704.5L615.5 781C651.333 808 765.7 864.6 936.5 875C1107.3 885.4 1269 808.333 1328.5 768.5L1280.73 695.5L1353 648.5L1354.5 547H1321L1323.5 610.5L1236.5 626.5V631L1229.5 632.5C959.1 668.9 753.167 647.667 684 632.5V536L602 533.5V503H593V634.5L614 649.5L602 665L659 704.5Z',
  },
  {
    id: 'zone_meeting_5',
    d: 'M544 733.5C551.6 739.1 592.5 766.167 612 779L656 703L596.5 665L544 733.5Z',
  },
  {
    id: 'zone_meeting_6',
    d: 'M608 648.5L542.5 732C485.3 688.4 455.333 651.833 447.5 639L457.5 640.5V603.5H549.5V609.5H589.5V635L608 648.5Z',
  },
  {
    id: 'zone_meeting_7',
    d: 'M550.5 608H590V540.5H472.5L454.5 533C444.1 551 434.5 592.167 431 610.5H456.5V600.5L550.5 602V608Z',
  },
  {
    id: 'zone_meeting_8',
    d: 'M591 539V501.5H551.5L490 457C478.8 470.6 461.667 511.333 454.5 530L474.5 539H591Z',
  },
  {
    id: 'zone_lecturezone_open_space_1',
    d: 'M1180 231.5C1056.8 176.3 926.667 181.5 877 191L890 271.5L810 292L752 315L688 353.5L633.5 401L591.5 449.5V497.5H629V532.5H680.5V455L803 442.5C880.5 436.5 1064.4 429.5 1180 449.5V371L1197 349.5L1140 318.5L1142 315L1180 231.5Z',
  },
  {
    id: 'zone_kitchen',
    d: 'M1317.5 500.5H1233.5V623.5L1317.5 608V500.5Z',
  },
  {
    id: 'zone_stock',
    d: 'M1317.5 478.5L1233.5 462.5V499.5H1317.5V478.5Z',
  },
  {
    id: 'zone_meeting_10',
    d: 'M944 760V679H903H862C863.333 693.167 862.5 724.5 862 739.5C861.508 754.243 865.5 757.5 873.5 758L944 760Z',
  },
  {
    id: 'zone_meeting_9',
    d: 'M1099 678.5H945V759C990 759.5 1082.1 760.2 1090.5 759C1098.9 757.8 1101 751.833 1101 749L1099 678.5Z',
  },
]

export function CrescentFloorSvg({
  zones,
  hoveredZoneId,
  onHoverZone,
  onClickZone,
}: CrescentFloorSvgProps) {
  const getZoneFillAndStroke = (zoneId: string) => {
    const zone = zones[zoneId]
    const isHovered = hoveredZoneId === zoneId
    const isLocked = zone ? zone.status === 'LOCKED' : false

    if (zoneId === 'zone_stock') {
      return {
        fill: isHovered ? '#1f1f3a' : '#0D0D17',
        stroke: '#6C5CE7',
        fillOpacity: 0.95,
      }
    }

    if (isLocked) {
      return {
        fill: isHovered ? '#34245c' : '#1b1833',
        stroke: isHovered ? '#f59e0b' : '#6C5CE7',
        fillOpacity: 0.92,
      }
    }

    return {
      fill: isHovered ? '#35356b' : '#252542',
      stroke: isHovered ? '#34d399' : '#6C5CE7',
      fillOpacity: 0.95,
    }
  }

  return (
    <svg
      viewBox="0 0 1920 1080"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full select-none"
    >
      <g id="xsolla_office_map">
        <g clipPath="url(#clip0_0_1)">
          <rect width="1920" height="1080" fill="#131324" />
          <ellipse
            id="Ellipse 1"
            cx="961"
            cy="529"
            rx="550"
            ry="345"
            fill="#D9D9D9"
            fillOpacity="0.18"
          />

          <g id="base_structure">
            <path
              id="Vector 1"
              d="M1122.5 450.5L959.5 442V645.5L1120 635.5L1122.5 450.5Z"
              fill="#0D0D17"
            />
            <path
              id="Vector 2"
              d="M692.5 624V461.5L798.5 450.5L795.5 637L692.5 624Z"
              fill="#0D0D17"
            />
            <path
              id="Vector 3"
              d="M1174 458L1126 453V635.5L1174 632V458Z"
              fill="#0D0D17"
            />
            <g id="Vector 21">
              <path
                d="M797 636L801.5 450.5L848 444.359V640.5L797 636Z"
                fill="#0D0D17"
              />
              <path
                d="M956 643.5L852.5 640.5V444.359L956 443V643.5Z"
                fill="#0D0D17"
              />
              <path
                d="M1229.5 466L1177 458V630.5L1229.5 622.5V466Z"
                fill="#0D0D17"
              />
              <path
                d="M801.5 450.5L797 636L848 640.5V444.359L801.5 450.5ZM852.5 640.5L956 643.5V443L852.5 444.359V640.5ZM1177 458L1229.5 466V622.5L1177 630.5V458Z"
                stroke="#0D0D17"
              />
            </g>
            <text
              x="960"
              y="545"
              textAnchor="middle"
              fill="#4b5563"
              fontSize="16"
              fontWeight="700"
              letterSpacing="3"
              className="pointer-events-none uppercase"
            >
              31st Floor Core · Elevators & Stairs
            </text>
          </g>

          {SVG_ZONES.map((item) => {
            const { fill, stroke, fillOpacity } = getZoneFillAndStroke(item.id)
            const isHovered = hoveredZoneId === item.id

            return (
              <path
                key={item.id}
                id={item.id}
                d={item.d}
                fill={fill}
                fillOpacity={fillOpacity}
                stroke={stroke}
                strokeWidth={isHovered ? 3.5 : 2}
                className="cursor-pointer transition-colors duration-200"
                onMouseEnter={() => onHoverZone(item.id)}
                onMouseLeave={() => onHoverZone(null)}
                onClick={(e) => {
                  e.stopPropagation()
                  onClickZone(item.id)
                }}
              />
            )
          })}

          <g id="su dispenseri icon" className="pointer-events-none">
            <path
              d="M810.796 406.306H815.417C815.693 406.306 815.917 406.53 815.917 406.806V418.049C815.917 418.325 815.693 418.549 815.417 418.549H810.796C810.52 418.549 810.296 418.325 810.296 418.049V406.806C810.296 406.53 810.52 406.306 810.796 406.306Z"
              strokeLinecap="round"
              stroke="#38bdf8"
              strokeWidth="1.5"
            />
            <path
              d="M809.337 403.5H816.652C816.928 403.5 817.152 403.724 817.152 404V405.591C817.152 405.868 816.928 406.091 816.652 406.091H809.337C809.061 406.091 808.837 405.868 808.837 405.591V404C808.837 403.724 809.061 403.5 809.337 403.5Z"
              strokeLinecap="round"
              stroke="#38bdf8"
              strokeWidth="1.5"
            />
          </g>

          <g id="su dispenseri icon_2" className="pointer-events-none">
            <path
              d="M1189.8 403.306H1194.42C1194.69 403.306 1194.92 403.53 1194.92 403.806V415.049C1194.92 415.325 1194.69 415.549 1194.42 415.549H1189.8C1189.52 415.549 1189.3 415.325 1189.3 415.049V403.806C1189.3 403.53 1189.52 403.306 1189.8 403.306Z"
              strokeLinecap="round"
              stroke="#38bdf8"
              strokeWidth="1.5"
            />
            <path
              d="M1188.34 400.5H1195.65C1195.93 400.5 1196.15 400.724 1196.15 401V402.591C1196.15 402.868 1195.93 403.091 1195.65 403.091H1188.34C1188.06 403.091 1187.84 402.868 1187.84 402.591V401C1187.84 400.724 1188.06 400.5 1188.34 400.5Z"
              strokeLinecap="round"
              stroke="#38bdf8"
              strokeWidth="1.5"
            />
          </g>

          <g id="su dispenseri icon_3" className="pointer-events-none">
            <path
              d="M1305.8 575.306H1310.42C1310.69 575.306 1310.92 575.53 1310.92 575.806V587.049C1310.92 587.325 1310.69 587.549 1310.42 587.549H1305.8C1305.52 587.549 1305.3 587.325 1305.3 587.049V575.806C1305.3 575.53 1305.52 575.306 1305.8 575.306Z"
              strokeLinecap="round"
              stroke="#38bdf8"
              strokeWidth="1.5"
            />
          </g>

          <g id="proyektor icon" className="pointer-events-none">
            <path
              d="M1247 449.5H1259.69C1260.51 449.5 1261.19 450.172 1261.19 451V456.471C1261.19 457.299 1260.51 457.971 1259.69 457.971H1247C1246.17 457.971 1245.5 457.299 1245.5 456.471V451C1245.5 450.172 1246.17 449.5 1247 449.5Z"
              stroke="#a78bfa"
              strokeWidth="1.5"
            />
          </g>

          <g id="proyektor icon_2" className="pointer-events-none">
            <path
              d="M947 723.5H959.686C960.515 723.5 961.186 724.172 961.186 725V730.471C961.186 731.299 960.515 731.971 959.686 731.971H947C946.172 731.971 945.5 731.299 945.5 730.471V725C945.5 724.172 946.172 723.5 947 723.5Z"
              stroke="#a78bfa"
              strokeWidth="1.5"
            />
          </g>

          <g id="proyektor icon_3" className="pointer-events-none">
            <path
              d="M864 727.5H876.686C877.515 727.5 878.186 728.172 878.186 729V734.471C878.186 735.299 877.515 735.971 876.686 735.971H864C863.172 735.971 862.5 735.299 862.5 734.471V729C862.5 728.172 863.172 727.5 864 727.5Z"
              stroke="#a78bfa"
              strokeWidth="1.5"
            />
          </g>

          {Object.entries(ZONE_LABEL_POSITIONS).map(([zoneId, pos]) => {
            const zone = zones[zoneId]
            const isLocked = zone ? zone.status === 'LOCKED' : false
            const isHovered = hoveredZoneId === zoneId

            return (
              <g
                key={`label-${zoneId}`}
                transform={`translate(${pos.cx}, ${pos.cy})`}
                className="pointer-events-none"
              >
                <rect
                  x={-54}
                  y={-14}
                  width={108}
                  height={28}
                  rx={8}
                  fill={isLocked ? '#141127' : '#0f2926'}
                  fillOpacity={0.88}
                  stroke={
                    isHovered
                      ? '#ffffff'
                      : isLocked
                        ? '#f59e0b'
                        : '#10b981'
                  }
                  strokeWidth={isHovered ? 1.8 : 1}
                />
                <text
                  x={0}
                  y={4}
                  textAnchor="middle"
                  fill={isLocked ? '#fde68a' : '#a7f3d0'}
                  fontSize="10.5"
                  fontWeight="700"
                >
                  {isLocked ? `🔒 ${pos.shortLabel}` : `✓ ${pos.shortLabel}`}
                </text>
              </g>
            )
          })}
        </g>
        <rect
          x="1.5"
          y="1.5"
          width="1917"
          height="1077"
          stroke="#3A3A5E"
          strokeWidth="3"
        />
      </g>
      <defs>
        <clipPath id="clip0_0_1">
          <rect width="1920" height="1080" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}
