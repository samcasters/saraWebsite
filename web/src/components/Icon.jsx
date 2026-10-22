const common = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

function Kayak() {
  return (
    <>
      <path {...common} d="M10 40c10 8 34 8 44 0" />
      <path {...common} d="M16 40c2-8 8-14 16-14s14 6 16 14" />
      <circle cx="32" cy="22" r="3" {...common} />
      <path {...common} d="M24 24l16 8M40 24L24 32" />
      <path {...common} d="M8 48c4 2 6 2 8 0s4-2 8 0 4 2 8 0 4-2 8 0 4 2 8 0 4-2 8 0" />
    </>
  );
}

function Bike() {
  return (
    <>
      <circle cx="18" cy="42" r="8" {...common} />
      <circle cx="46" cy="42" r="8" {...common} />
      <path {...common} d="M18 42l10-16h12l6 16M28 26l8 16" />
      <path {...common} d="M32 14l4 6M30 14h8" />
      <path {...common} d="M44 18l6-6 4 2" />
    </>
  );
}

function Hike() {
  return (
    <>
      <circle cx="34" cy="14" r="4" {...common} />
      <path {...common} d="M34 18v16M34 24l-8 8M34 24l8 6M34 34l-6 14M34 34l8 14" />
      <path {...common} d="M26 22h-8l2 16h6" />
    </>
  );
}

function Fish() {
  return (
    <>
      <path {...common} d="M18 40c8-10 18-12 28-6-6 4-6 10 0 14-10 6-20 4-28-8z" />
      <path {...common} d="M18 40l-8 6 2-6-2-6z" />
      <circle cx="38" cy="36" r="1" fill="currentColor" />
      <path {...common} d="M44 18c6 2 8 8 6 14" />
      <path {...common} d="M48 16c2 6-2 10-6 12" />
    </>
  );
}

function Bowl() {
  return (
    <>
      <path {...common} d="M30 14c-6 0-8 8-4 12h8c4-4 2-12-4-12z" />
      <path {...common} d="M26 26h8l-1 16h-6zM24 42h12" />
      <circle cx="46" cy="40" r="8" {...common} />
      <circle cx="46" cy="40" r="2" {...common} />
    </>
  );
}

function Golf() {
  return (
    <>
      <path {...common} d="M30 50c8-6 16-8 24-4" />
      <path {...common} d="M36 46V16" />
      <path {...common} d="M36 16h12l-8 6z" />
      <circle cx="24" cy="46" r="2" {...common} />
    </>
  );
}

function Bread() {
  return (
    <path {...common} d="M16 36c0-10 8-16 16-16 6 0 8 4 10 4s4-4 8-4c6 0 10 6 10 12 0 8-6 12-14 12H28c-8 0-12-4-12-8z" />
  );
}

function Meat() {
  return (
    <>
      <path {...common} d="M24 14v28M40 14v28" />
      <path {...common} d="M20 20h8M20 28h8M20 36h8M36 20h8M36 28h8M36 36h8" />
      <path {...common} d="M22 14h4M38 14h4" />
    </>
  );
}

function Cart() {
  return (
    <>
      <path {...common} d="M14 18h6l4 22h22l4-16H22" />
      <circle cx="28" cy="48" r="3" {...common} />
      <circle cx="44" cy="48" r="3" {...common} />
      <path {...common} d="M40 16v8M36 20h8" />
    </>
  );
}

function Cafe() {
  return (
    <>
      <path {...common} d="M16 24h26v14a8 8 0 0 1-8 8H24a8 8 0 0 1-8-8z" />
      <path {...common} d="M42 26h6a6 6 0 0 1 0 12h-6" />
      <path {...common} d="M22 16c0 4 4 4 4 8M30 14c0 4 4 4 4 8" />
    </>
  );
}

function Dine() {
  return (
    <>
      <path {...common} d="M24 12v36M20 12v10a4 4 0 0 0 8 0V12" />
      <path {...common} d="M42 12c6 6 6 12 0 16v20" />
    </>
  );
}

function Pharmacy() {
  return (
    <>
      <rect x="16" y="16" width="32" height="32" rx="2" {...common} />
      <path {...common} d="M32 22v20M22 32h20" />
      <path {...common} d="M24 40c2-4 4-4 6 0s4 4 6 0 4-4 6 0" />
    </>
  );
}

function Fuel() {
  return (
    <>
      <rect x="16" y="14" width="22" height="34" rx="2" {...common} />
      <path {...common} d="M38 20h6l4 6v16a4 4 0 0 1-8 0v-8" />
      <path {...common} d="M20 22h14" />
    </>
  );
}

const drawings = {
  kayak: Kayak,
  bike: Bike,
  hike: Hike,
  fish: Fish,
  bowl: Bowl,
  golf: Golf,
  bread: Bread,
  meat: Meat,
  cart: Cart,
  cafe: Cafe,
  dine: Dine,
  pharmacy: Pharmacy,
  fuel: Fuel,
};

export default function Icon({ name }) {
  const Drawing = drawings[name];
  if (!Drawing) return null;
  return (
    <svg className="icon" viewBox="0 0 64 64" aria-hidden="true">
      <Drawing />
    </svg>
  );
}
