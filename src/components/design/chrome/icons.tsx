// Inline SVG icons of the public chrome, copied verbatim from design-reference/snapshots/index.html
// (header top bar, navbar toggler, account icon — also the footer's supporters stat — footer stats and contact). Decorative: aria-hidden.
// Attributes are the snapshot's, so `fill`/`stroke` values here are the design's own markup, not new tokens.

export function TopbarMailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="17" viewBox="0 0 20 17" fill="none" className="img-fluid" aria-hidden="true">
      <path d="M14.2353 16H5.41176C2.76471 16 1 14.6765 1 11.5882V5.41176C1 2.32353 2.76471 1 5.41176 1H14.2353C16.8824 1 18.6471 2.32353 18.6471 5.41176V11.5882C18.6471 14.6765 16.8824 16 14.2353 16Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" /><path d="M14.2356 5.85278L11.4739 8.05867C10.565 8.78219 9.07387 8.78219 8.16505 8.05867L5.41211 5.85278" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TopbarPhoneIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none" className="img-fluid" aria-hidden="true">
      <path d="M15.9775 13.2475C15.9775 13.5175 15.9175 13.795 15.79 14.065C15.6625 14.335 15.4975 14.59 15.28 14.83C14.9125 15.235 14.5075 15.5275 14.05 15.715C13.6 15.9025 13.1125 16 12.5875 16C11.8225 16 11.005 15.82 10.1425 15.4525C9.28 15.085 8.4175 14.59 7.5625 13.9675C6.7 13.3375 5.8825 12.64 5.1025 11.8675C4.33 11.0875 3.6325 10.27 3.01 9.415C2.395 8.56 1.9 7.705 1.54 6.8575C1.18 6.0025 1 5.185 1 4.405C1 3.895 1.09 3.4075 1.27 2.9575C1.45 2.5 1.735 2.08 2.1325 1.705C2.6125 1.2325 3.1375 1 3.6925 1C3.9025 1 4.1125 1.045 4.3 1.135C4.495 1.225 4.6675 1.36 4.8025 1.555L6.5425 4.0075C6.6775 4.195 6.775 4.3675 6.8425 4.5325C6.91 4.69 6.9475 4.8475 6.9475 4.99C6.9475 5.17 6.895 5.35 6.79 5.5225C6.6925 5.695 6.55 5.875 6.37 6.055L5.8 6.6475C5.7175 6.73 5.68 6.8275 5.68 6.9475C5.68 7.0075 5.6875 7.06 5.7025 7.12C5.725 7.18 5.7475 7.225 5.7625 7.27C5.8975 7.5175 6.13 7.84 6.46 8.23C6.7975 8.62 7.1575 9.0175 7.5475 9.415C7.9525 9.8125 8.3425 10.18 8.74 10.5175C9.13 10.8475 9.4525 11.0725 9.7075 11.2075C9.745 11.2225 9.79 11.245 9.8425 11.2675C9.9025 11.29 9.9625 11.2975 10.03 11.2975C10.1575 11.2975 10.255 11.2525 10.3375 11.17L10.9075 10.6075C11.095 10.42 11.275 10.2775 11.4475 10.1875C11.62 10.0825 11.7925 10.03 11.98 10.03C12.1225 10.03 12.2725 10.06 12.4375 10.1275C12.6025 10.195 12.775 10.2925 12.9625 10.42L15.445 12.1825C15.64 12.3175 15.775 12.475 15.8575 12.6625C15.9325 12.85 15.9775 13.0375 15.9775 13.2475Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" /><path d="M13.3745 6.25C13.3745 5.8 13.022 5.11 12.497 4.5475C12.017 4.03 11.3795 3.625 10.7495 3.625" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M15.9995 6.25C15.9995 3.3475 13.652 1 10.7495 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MenuIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12H12m-8.25 5.25h16.5" />
    </svg>
  );
}

export function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  );
}

export function FooterDollarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

export function FooterMailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  );
}

export function FooterPhoneIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 3.75 18 6m0 0 2.25 2.25M18 6l2.25-2.25M18 6l-2.25 2.25m1.5 13.5c-8.284 0-15-6.716-15-15V4.5A2.25 2.25 0 0 1 4.5 2.25h1.372c.516 0 .966.351 1.091.852l1.106 4.423c.11.44-.054.902-.417 1.173l-1.293.97a1.062 1.062 0 0 0-.38 1.21 12.035 12.035 0 0 0 7.143 7.143c.441.162.928-.004 1.21-.38l.97-1.293a1.125 1.125 0 0 1 1.173-.417l4.423 1.106c.5.125.852.575.852 1.091V19.5a2.25 2.25 0 0 1-2.25 2.25h-2.25Z" />
    </svg>
  );
}

export function FooterPinIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  );
}
