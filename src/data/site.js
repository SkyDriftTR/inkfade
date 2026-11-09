// Stüdyo iletişim bilgileri. Sitedeki tüm linkler buradan beslenir.
const phoneDigits = '905437349849';

export const site = {
  name: 'Inkfade Tattoo & Piercing',
  instagram: 'inkfade.sinop',
  instagramUrl: 'https://www.instagram.com/inkfade.sinop/',
  phone: '+90 543 734 98 49',
  phoneUrl: `tel:+${phoneDigits}`,
  whatsappUrl: `https://wa.me/${phoneDigits}?text=${encodeURIComponent('Merhaba, randevu almak istiyorum.')}`,
  location: 'Sinop Merkez',
  address: 'Camikebir, Sakarya Cd. Göçgünoğlu Pasajı D:50/10P, 57000 Sinop Merkez/Sinop',
  // Google Haritalar'daki "INKFADE TATTOO&PIERCING" kaydının konumu
  lat: 42.0261229,
  lng: 35.1463521,
  mapsUrl: 'https://www.google.com/maps/place/INKFADE+TATTOO%26PIERCING/@42.0261229,35.1463521,17z/data=!3m1!4b1!4m6!3m5!1s0x408f134744eade3d:0x5f6bbfc2611a51db!8m2!3d42.0261229!4d35.1463521!16s%2Fg%2F11y6qzvr7s',
  directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=42.0261229,35.1463521',
};
