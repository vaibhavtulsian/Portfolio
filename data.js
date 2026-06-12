/* ============================================================
   DEV PORTFOLIO — Configuration
   Set your GitHub username below to automatically fetch repos
   ============================================================ */

window.CONFIG = {
  GITHUB_USERNAME: 'vaibhavtulsian',

  NAME: 'Vaibhav Tulsian',
  ROLE: 'Software Developer & Open Source Contributor',
  BIO: 'I build software and contribute to open source. Passionate about creating efficient, scalable solutions.',
  LONG_BIO: 'Hi, Vaibhav this side and currently studying my BTech from PES University and as a Software Developer, my focus is bridging the gap between complex architectural problems and elegant, maintainable code. I thrive on contributing to open source projects, learning cutting-edge frameworks, and building tools that developers love to use.',
  EMAIL: 'vaibhavtulsian@gmail.com',
  LOCATION: 'India',

  SOCIALS: {
    github: 'https://github.com/vaibhavtulsian',
    linkedin: 'https://linkedin.com/in/vaibhavtulsian',
    twitter: 'https://twitter.com/vaibhavtulsian'
  }
};

// We will fetch the repos dynamically from the GitHub API in app.js
window.PROJECTS = [];

const CATEGORIES = [
  { id: 'all', label: 'All', icon: '📁' },
  { id: 'javascript', label: 'JavaScript', icon: '🟨' },
  { id: 'typescript', label: 'TypeScript', icon: '🟦' },
  { id: 'python', label: 'Python', icon: '🐍' },
  { id: 'html', label: 'HTML/CSS', icon: '🌐' }
];

// Color palettes for generated project thumbnails
const PROJECT_PALETTES = [
  ['#7B2FBE', '#2DD4BF', '#0D0D0D'],
  ['#FF6B6B', '#FFA07A', '#1A1A2E'],
  ['#00B4D8', '#0077B6', '#0D0D0D'],
  ['#E040FB', '#7B2FBE', '#1A1A2E'],
  ['#2DD4BF', '#059669', '#0D0D0D'],
  ['#F5A623', '#FF6B6B', '#24243E'],
  ['#667EEA', '#764BA2', '#0D0D0D'],
  ['#F093FB', '#F5576C', '#1A1A2E'],
  ['#4FACFE', '#00F2FE', '#0D0D0D'],
  ['#43E97B', '#38F9D7', '#1A1A2E'],
  ['#FA709A', '#FEE140', '#0D0D0D'],
  ['#A18CD1', '#FBC2EB', '#24243E'],
];

// Helper to generate highly complex gradient SVG data URI for project thumbnails
window.generateProjectThumbnail = function (palette, seed) {
  const [c1, c2] = palette;
  const angle = (seed * 37) % 360;
  const shapes = [];

  // Generate extremely detailed blueprint grid and dot matrix patterns
  const gridPattern = `
    <pattern id="grid${seed}" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M 60 0 L 0 0 0 60" fill="none" stroke="${c1}" stroke-width="0.5" opacity="0.15"/>
      <path d="M 30 0 L 30 60 M 0 30 L 60 30" fill="none" stroke="${c2}" stroke-width="0.5" opacity="0.05" stroke-dasharray="2 2"/>
    </pattern>
    <pattern id="dots${seed}" width="15" height="15" patternUnits="userSpaceOnUse">
      <circle cx="1.5" cy="1.5" r="1" fill="${c2}" opacity="0.25"/>
    </pattern>
    <pattern id="stripes${seed}" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="0" y2="10" stroke="${c1}" stroke-width="1" opacity="0.1"/>
    </pattern>
  `;

  // 1. Procedural sine waves (Data flow representation)
  let wavePath = `M 0,${250 + (seed % 100)}`;
  for (let x = 0; x <= 800; x += 20) {
    let y = 250 + (seed % 100) + Math.sin(x * 0.02 + seed) * 80 + Math.cos(x * 0.05) * 30;
    wavePath += ` L ${x},${y}`;
  }
  shapes.push(`<path d="${wavePath}" fill="none" stroke="${c1}" stroke-width="2" opacity="0.4"/>`);
  shapes.push(`<path d="${wavePath}" fill="none" stroke="${c2}" stroke-width="1" opacity="0.3" transform="translate(0, 10)"/>`);

  // 2. Procedural Sci-Fi HUD Concentric Rings
  for (let i = 0; i < 3; i++) {
    const cx = 150 + ((seed * (i + 1) * 43) % 500);
    const cy = 150 + ((seed * (i + 1) * 47) % 200);
    const r1 = 30 + ((seed * (i + 1) * 17) % 60);
    const r2 = r1 + 15;
    const r3 = r2 + 10;

    // Solid ring
    shapes.push(`<circle cx="${cx}" cy="${cy}" r="${r1}" fill="none" stroke="${c1}" stroke-width="1" opacity="0.4"/>`);
    // Segmented dashed ring
    shapes.push(`<circle cx="${cx}" cy="${cy}" r="${r2}" fill="none" stroke="${c2}" stroke-width="4" opacity="0.5" stroke-dasharray="${5 + (seed % 15)} ${10 + (seed % 10)}"/>`);
    // Outer thin ring
    shapes.push(`<circle cx="${cx}" cy="${cy}" r="${r3}" fill="none" stroke="${c1}" stroke-width="0.5" opacity="0.3"/>`);
    // Crosshair lines
    shapes.push(`<line x1="${cx - r3 - 10}" y1="${cy}" x2="${cx + r3 + 10}" y2="${cy}" stroke="${c2}" stroke-width="0.5" opacity="0.5"/>`);
    shapes.push(`<line x1="${cx}" y1="${cy - r3 - 10}" x2="${cx}" y2="${cy + r3 + 10}" stroke="${c2}" stroke-width="0.5" opacity="0.5"/>`);
  }

  // 3. Network circuitry paths with nodes
  let polylines = '';
  for (let i = 0; i < 6; i++) {
    let points = [];
    let px = (seed * (i + 1) * 11) % 800;
    let py = (seed * (i + 1) * 17) % 500;
    for (let j = 0; j < 6; j++) {
      points.push(`${px},${py}`);
      shapes.push(`<circle cx="${px}" cy="${py}" r="${3 + (j % 4)}" fill="${i % 2 === 0 ? c1 : c2}" opacity="0.9"/>`);
      shapes.push(`<circle cx="${px}" cy="${py}" r="${8 + (j % 4)}" fill="none" stroke="${c1}" stroke-width="1" opacity="0.5"/>`);

      // Strict 90-degree or 45-degree angled paths for a circuit board look
      if (j % 2 === 0) {
        px += ((seed * (j + 1) * 23) % 200) - 50;
      } else {
        py += ((seed * (j + 1) * 29) % 200) - 100;
      }
    }
    polylines += `<polyline points="${points.join(' ')}" fill="none" stroke="${i % 2 === 0 ? c1 : c2}" stroke-width="1.5" opacity="0.7" stroke-dasharray="6 3"/>`;
  }

  // 4. Abstract intersecting geometric polygons
  for (let i = 0; i < 4; i++) {
    const cx = 100 + ((seed * (i + 1) * 31) % 600);
    const cy = 100 + ((seed * (i + 1) * 37) % 300);
    const r = 50 + ((seed * (i + 1) * 13) % 100);
    const sides = 3 + ((seed + i) % 4); // Triangle to hexagon

    let polyPoints = [];
    for (let s = 0; s < sides; s++) {
      const a = (Math.PI * 2 * s) / sides + (angle * Math.PI / 180);
      polyPoints.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
    }

    shapes.push(`<polygon points="${polyPoints.join(' ')}" fill="url(#stripes${seed})" opacity="0.4" stroke="${c2}" stroke-width="1"/>`);
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">
    <defs>
      ${gridPattern}
      <linearGradient id="bgGlow${seed}" x1="0%" y1="0%" x2="100%" y2="100%" gradientTransform="rotate(${angle})">
        <stop offset="0%" style="stop-color:#FFFFFF"/>
        <stop offset="50%" style="stop-color:#F2F6F9"/>
        <stop offset="100%" style="stop-color:#E4EBF2"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#bgGlow${seed})"/>
    <rect width="100%" height="100%" fill="url(#grid${seed})"/>
    <rect width="100%" height="100%" fill="url(#dots${seed})"/>
    ${shapes.join('\n    ')}
    ${polylines}
  </svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

// Helper: generate avatar SVG
window.generateAvatar = function (name, color) {
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
    <defs>
      <linearGradient id="ag" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color}"/>
        <stop offset="100%" style="stop-color:${color};stop-opacity:0.5"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="#1A1A2E"/>
    <circle cx="200" cy="150" r="80" fill="url(#ag)" opacity="0.3"/>
    <circle cx="200" cy="160" r="55" fill="${color}" opacity="0.6"/>
    <text x="200" y="175" text-anchor="middle" font-family="sans-serif" font-size="40" font-weight="600" fill="white">${initials}</text>
    <rect x="120" y="260" width="160" height="140" rx="20" fill="${color}" opacity="0.2"/>
  </svg>`)}`;
};

window.TEAM = [
  {
    name: window.CONFIG.NAME,
    role: window.CONFIG.ROLE,
    bio: window.CONFIG.LONG_BIO,
    color: '#7B2FBE',
    avatar: 'profile.jpg'
  }
];

window.BUDGET_TIERS = [
  { label: 'Small / Open Source', range: 'Free - $1k', desc: 'Consulting, code reviews, small fixes' },
  { label: 'Project', range: '$1k - $5k', desc: 'MVP, specific feature development' },
  { label: 'Retainer', range: '$5k+', desc: 'Ongoing development, architecture' }
];

window.PROJECT_PALETTES = PROJECT_PALETTES;
window.CATEGORIES = CATEGORIES;
