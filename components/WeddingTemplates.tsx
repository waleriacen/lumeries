'use client';

type TemplateProps = {
  couple: string;
  date: string;
  venue: string;
  time?: string;
};

export function BohoFloralTemplate({ couple, date, venue, time }: TemplateProps) {
  return (
    <svg
      viewBox="0 0 500 700"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background */}
      <rect width="500" height="700" fill="#FFF9F5" />

      {/* Decorative Border */}
      <rect
        x="20"
        y="20"
        width="460"
        height="660"
        fill="none"
        stroke="#D4A574"
        strokeWidth="2"
        rx="5"
      />

      {/* Floral Decorations - Top */}
      <g opacity="0.7">
        {/* Left flower */}
        <circle cx="80" cy="80" r="15" fill="#F4C2C2" opacity="0.6" />
        <circle cx="90" cy="75" r="12" fill="#F4C2C2" opacity="0.5" />
        <circle cx="85" cy="90" r="10" fill="#F4C2C2" opacity="0.7" />
        <circle cx="75" cy="88" r="11" fill="#FFE4E1" opacity="0.6" />

        {/* Right flower */}
        <circle cx="420" cy="80" r="15" fill="#E8D5B7" opacity="0.6" />
        <circle cx="410" cy="75" r="12" fill="#E8D5B7" opacity="0.5" />
        <circle cx="415" cy="90" r="10" fill="#E8D5B7" opacity="0.7" />
        <circle cx="425" cy="88" r="11" fill="#F5E6D3" opacity="0.6" />
      </g>

      {/* Leaves */}
      <g opacity="0.5">
        <ellipse cx="100" cy="95" rx="20" ry="8" fill="#C9D5B5" transform="rotate(45 100 95)" />
        <ellipse cx="400" cy="95" rx="20" ry="8" fill="#C9D5B5" transform="rotate(-45 400 95)" />
      </g>

      {/* Main Content */}
      <text
        x="250"
        y="180"
        textAnchor="middle"
        fill="#8B7355"
        fontSize="16"
        fontFamily="serif"
        letterSpacing="4"
      >
        YOU ARE INVITED TO
      </text>

      <text
        x="250"
        y="220"
        textAnchor="middle"
        fill="#5D4E37"
        fontSize="14"
        fontFamily="serif"
        letterSpacing="2"
      >
        THE WEDDING OF
      </text>

      {/* Couple Names - Large */}
      <text
        x="250"
        y="320"
        textAnchor="middle"
        fill="#8B4513"
        fontSize="48"
        fontFamily="'Brush Script MT', cursive"
        fontWeight="400"
      >
        {couple}
      </text>

      {/* Decorative Line */}
      <line
        x1="150"
        y1="360"
        x2="350"
        y2="360"
        stroke="#D4A574"
        strokeWidth="1"
        opacity="0.6"
      />
      <circle cx="250" cy="360" r="3" fill="#D4A574" />

      {/* Date */}
      <text
        x="250"
        y="420"
        textAnchor="middle"
        fill="#6B5D4F"
        fontSize="28"
        fontFamily="serif"
      >
        {date}
      </text>

      {/* Time */}
      {time && (
        <text
          x="250"
          y="455"
          textAnchor="middle"
          fill="#8B7355"
          fontSize="18"
          fontFamily="serif"
        >
          {time}
        </text>
      )}

      {/* Venue */}
      <text
        x="250"
        y="500"
        textAnchor="middle"
        fill="#6B5D4F"
        fontSize="22"
        fontFamily="serif"
        fontStyle="italic"
      >
        {venue}
      </text>

      {/* Bottom Florals */}
      <g opacity="0.7">
        <circle cx="250" cy="600" r="12" fill="#F4C2C2" opacity="0.5" />
        <circle cx="265" cy="605" r="10" fill="#E8D5B7" opacity="0.6" />
        <circle cx="235" cy="605" r="10" fill="#FFE4E1" opacity="0.5" />
        <ellipse cx="250" cy="620" rx="25" ry="10" fill="#C9D5B5" opacity="0.4" />
      </g>

      {/* Footer Text */}
      <text
        x="250"
        y="650"
        textAnchor="middle"
        fill="#8B7355"
        fontSize="14"
        fontFamily="serif"
        letterSpacing="3"
      >
        JOIN US IN CELEBRATION
      </text>
    </svg>
  );
}

export function ModernMinimalistTemplate({ couple, date, venue, time }: TemplateProps) {
  return (
    <svg
      viewBox="0 0 500 700"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background */}
      <rect width="500" height="700" fill="#FFFFFF" />

      {/* Geometric Border */}
      <rect
        x="40"
        y="40"
        width="420"
        height="620"
        fill="none"
        stroke="#2C3E50"
        strokeWidth="1"
      />
      <rect
        x="50"
        y="50"
        width="400"
        height="600"
        fill="none"
        stroke="#95A5A6"
        strokeWidth="0.5"
        opacity="0.5"
      />

      {/* Top Line Accent */}
      <line x1="150" y1="120" x2="350" y2="120" stroke="#2C3E50" strokeWidth="2" />

      {/* Main Text */}
      <text
        x="250"
        y="180"
        textAnchor="middle"
        fill="#7F8C8D"
        fontSize="12"
        fontFamily="'Helvetica Neue', sans-serif"
        letterSpacing="6"
        fontWeight="300"
      >
        TOGETHER WITH THEIR FAMILIES
      </text>

      {/* Couple Names */}
      <text
        x="250"
        y="300"
        textAnchor="middle"
        fill="#2C3E50"
        fontSize="52"
        fontFamily="'Helvetica Neue', sans-serif"
        fontWeight="200"
        letterSpacing="-1"
      >
        {couple}
      </text>

      {/* Invite Text */}
      <text
        x="250"
        y="340"
        textAnchor="middle"
        fill="#7F8C8D"
        fontSize="14"
        fontFamily="'Helvetica Neue', sans-serif"
        letterSpacing="4"
        fontWeight="300"
      >
        REQUEST THE HONOR OF YOUR PRESENCE
      </text>

      {/* Date */}
      <text
        x="250"
        y="420"
        textAnchor="middle"
        fill="#2C3E50"
        fontSize="32"
        fontFamily="'Helvetica Neue', sans-serif"
        fontWeight="300"
      >
        {date}
      </text>

      {/* Time */}
      {time && (
        <text
          x="250"
          y="460"
          textAnchor="middle"
          fill="#95A5A6"
          fontSize="18"
          fontFamily="'Helvetica Neue', sans-serif"
          fontWeight="300"
        >
          {time}
        </text>
      )}

      {/* Venue */}
      <text
        x="250"
        y="520"
        textAnchor="middle"
        fill="#34495E"
        fontSize="24"
        fontFamily="'Helvetica Neue', sans-serif"
        fontWeight="300"
      >
        {venue}
      </text>

      {/* Bottom Line Accent */}
      <line x1="150" y1="600" x2="350" y2="600" stroke="#2C3E50" strokeWidth="2" />

      {/* Bottom Text */}
      <text
        x="250"
        y="640"
        textAnchor="middle"
        fill="#95A5A6"
        fontSize="11"
        fontFamily="'Helvetica Neue', sans-serif"
        letterSpacing="5"
        fontWeight="300"
      >
        RECEPTION TO FOLLOW
      </text>
    </svg>
  );
}

export function RusticWoodlandTemplate({ couple, date, venue, time }: TemplateProps) {
  return (
    <svg
      viewBox="0 0 500 700"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background - kraft paper texture */}
      <rect width="500" height="700" fill="#E8DCC4" />

      {/* Wood texture overlay */}
      <rect width="500" height="700" fill="url(#woodGrain)" opacity="0.1" />

      <defs>
        <pattern id="woodGrain" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="100" y2="100" stroke="#8B7355" strokeWidth="0.5" opacity="0.3" />
          <line x1="0" y1="50" x2="100" y2="150" stroke="#8B7355" strokeWidth="0.5" opacity="0.2" />
        </pattern>
      </defs>

      {/* Greenery - Top Left */}
      <g opacity="0.8">
        <ellipse cx="60" cy="60" rx="30" ry="12" fill="#7A9D54" transform="rotate(-30 60 60)" />
        <ellipse cx="80" cy="70" rx="25" ry="10" fill="#8FAF5F" transform="rotate(-20 80 70)" />
        <ellipse cx="50" cy="80" rx="28" ry="11" fill="#6B8E4E" transform="rotate(-40 50 80)" />
      </g>

      {/* Greenery - Top Right */}
      <g opacity="0.8">
        <ellipse cx="440" cy="60" rx="30" ry="12" fill="#7A9D54" transform="rotate(30 440 60)" />
        <ellipse cx="420" cy="70" rx="25" ry="10" fill="#8FAF5F" transform="rotate(20 420 70)" />
        <ellipse cx="450" cy="80" rx="28" ry="11" fill="#6B8E4E" transform="rotate(40 450 80)" />
      </g>

      {/* Pine branches */}
      <g opacity="0.6">
        <line x1="100" y1="100" x2="140" y2="140" stroke="#4A6741" strokeWidth="3" strokeLinecap="round" />
        <line x1="400" y1="100" x2="360" y2="140" stroke="#4A6741" strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* Main Content */}
      <text
        x="250"
        y="160"
        textAnchor="middle"
        fill="#5D4E37"
        fontSize="14"
        fontFamily="'Courier New', monospace"
        letterSpacing="3"
      >
        JOIN US FOR
      </text>

      <text
        x="250"
        y="200"
        textAnchor="middle"
        fill="#3E2723"
        fontSize="16"
        fontFamily="'Courier New', monospace"
        letterSpacing="4"
        fontWeight="bold"
      >
        A WOODLAND CELEBRATION
      </text>

      {/* Couple Names */}
      <text
        x="250"
        y="300"
        textAnchor="middle"
        fill="#4A3728"
        fontSize="46"
        fontFamily="'Georgia', serif"
        fontStyle="italic"
      >
        {couple}
      </text>

      {/* Wooden Banner */}
      <rect x="100" y="340" width="300" height="60" fill="#8B6F47" opacity="0.3" rx="5" />

      {/* Date on Banner */}
      <text
        x="250"
        y="375"
        textAnchor="middle"
        fill="#3E2723"
        fontSize="26"
        fontFamily="'Courier New', monospace"
        fontWeight="bold"
      >
        {date}
      </text>

      {/* Time */}
      {time && (
        <text
          x="250"
          y="450"
          textAnchor="middle"
          fill="#5D4E37"
          fontSize="20"
          fontFamily="'Georgia', serif"
        >
          {time}
        </text>
      )}

      {/* Venue */}
      <text
        x="250"
        y="510"
        textAnchor="middle"
        fill="#4A3728"
        fontSize="24"
        fontFamily="'Georgia', serif"
        fontStyle="italic"
      >
        {venue}
      </text>

      {/* Bottom Greenery */}
      <g opacity="0.7">
        <ellipse cx="250" cy="600" rx="80" ry="20" fill="#7A9D54" opacity="0.4" />
        <ellipse cx="230" cy="610" rx="40" ry="15" fill="#8FAF5F" opacity="0.5" />
        <ellipse cx="270" cy="610" rx="40" ry="15" fill="#6B8E4E" opacity="0.5" />
      </g>

      {/* Pine cone decorations */}
      <g opacity="0.6">
        <ellipse cx="200" cy="630" rx="8" ry="12" fill="#8B6F47" />
        <ellipse cx="300" cy="630" rx="8" ry="12" fill="#8B6F47" />
      </g>

      <text
        x="250"
        y="665"
        textAnchor="middle"
        fill="#5D4E37"
        fontSize="13"
        fontFamily="'Courier New', monospace"
        letterSpacing="2"
      >
        RSVP REQUESTED
      </text>
    </svg>
  );
}
