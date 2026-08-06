export default function IconSprite() {
  return <div style={{ display: 'none' }} aria-hidden="true" dangerouslySetInnerHTML={{ __html: SPRITE_INNER }} />;
}

const SPRITE_INNER = `

  <symbol id="icon-Drivers" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 20 L14 7" />
    <path d="M14 7 C19 5.5 21 8 20 11.5 C19 15 15.5 15.5 13 13.5 C11 11.8 11.8 8.6 14 7 Z" />
  </symbol>
  <symbol id="icon-Woods" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 20 L13 8.5" />
    <path d="M13 8.5 C17 7.3 18.5 9.6 17.6 12.4 C16.7 15 13.9 15.2 12 13.4 C10.5 11.9 11.1 9.7 13 8.5 Z" />
  </symbol>
  <symbol id="icon-LongIrons" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 20 L15 9" />
    <path d="M15 9 L21 6.2 L18.4 12.5 L15 9 Z" />
  </symbol>
  <symbol id="icon-ShortIrons" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M5 20 L14.5 10.5" />
    <path d="M14.5 10.5 L20.5 9 L16.7 14 L14.5 10.5 Z" />
  </symbol>
  <symbol id="icon-Wedges" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M5 20 L13.5 11.5" />
    <path d="M13.5 11.5 L20.5 11.2 L15.3 15.8 L13.5 11.5 Z" />
    <path d="M15.3 12 L17.6 13.9" />
    <path d="M16.4 10.9 L18.6 12.9" />
  </symbol>
  <symbol id="icon-RoughIrons" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M5 20 L14.5 10.5" />
    <path d="M14.5 10.5 L20.5 9 L16.7 14 L14.5 10.5 Z" />
    <path d="M2.5 20 q1.5 -3 3 0" />
    <path d="M5.5 20 q1.5 -3.4 3 0" />
    <path d="M8.5 20 q1.5 -2.6 3 0" />
  </symbol>
  <symbol id="icon-SandWedges" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M5 20 L13.5 11.5" />
    <path d="M13.5 11.5 L20.5 11.2 L15.3 15.8 L13.5 11.5 Z" />
    <circle cx="16" cy="13.2" r="0.55" fill="currentColor" stroke="none" />
    <circle cx="17.6" cy="12.6" r="0.55" fill="currentColor" stroke="none" />
    <circle cx="18" cy="14.2" r="0.55" fill="currentColor" stroke="none" />
  </symbol>
  <symbol id="icon-flag" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 21 V4" />
    <path d="M6 4 L17 7.2 L6 10.4" />
    <ellipse cx="11" cy="21" rx="6" ry="1.1" opacity="0.4" />
  </symbol>
  <symbol id="icon-wind" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M2 9h13a3 3 0 1 0-2.5-4.7" />
    <path d="M2 14.5h16a3 3 0 1 1-2.5 4.7" />
    <path d="M2 19h8" />
  </symbol>
  <symbol id="icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
    <path d="M6 6 L18 18" />
    <path d="M18 6 L6 18" />
  </symbol>
  <symbol id="icon-minus" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
    <path d="M5 12 H19" />
  </symbol>
  <symbol id="icon-plus" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
    <path d="M12 5 V19" />
    <path d="M5 12 H19" />
  </symbol>
  <symbol id="icon-expand" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M9 4 H5 a1 1 0 0 0 -1 1 v4" />
    <path d="M15 4 h4 a1 1 0 0 1 1 1 v4" />
    <path d="M9 20 H5 a1 1 0 0 1 -1 -1 v-4" />
    <path d="M15 20 h4 a1 1 0 0 0 1 -1 v-4" />
  </symbol>

`;
