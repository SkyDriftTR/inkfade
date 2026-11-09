// Özel renkli harita: MapLibre + OpenFreeMap (anahtar gerektirmez, ücretsiz).
// Hazır stilin bütün katmanları sitenin paletine göre yeniden boyanır.
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const STYLE_URL = 'https://tiles.openfreemap.org/styles/positron';

const C = {
  land: '#090b13',
  landAlt: '#0c0f1a',
  water: '#0b1838',
  waterLine: '#16306e',
  park: '#0c1320',
  building: '#141a2c',
  buildingLine: '#1c2440',
  roadMajor: '#3653b8',
  roadMid: '#2a3a72',
  roadMinor: '#1d2748',
  casing: '#06070c',
  rail: '#262d44',
  boundary: '#323a58',
  label: '#9aa2bf',
  labelMajor: '#d5d8e6',
  halo: '#06070c',
};

const has = (id, re) => re.test(id);

function recolor(style) {
  const keep = [];
  for (const l of style.layers) {
    const id = l.id.toLowerCase();
    const p = (l.paint = l.paint || {});
    if (l.type === 'background') { p['background-color'] = C.land; keep.push(l); continue; }
    if (l.type === 'fill') {
      if (has(id, /water|ocean|sea|lake|river/)) p['fill-color'] = C.water;
      else if (has(id, /park|grass|wood|forest|green|landcover|cemetery|pitch|garden/)) p['fill-color'] = C.park;
      else if (has(id, /building/)) { p['fill-color'] = C.building; p['fill-outline-color'] = C.buildingLine; }
      else p['fill-color'] = C.landAlt;
      delete p['fill-pattern'];
      keep.push(l); continue;
    }
    if (l.type === 'fill-extrusion') { p['fill-extrusion-color'] = C.building; keep.push(l); continue; }
    if (l.type === 'line') {
      if (has(id, /water|river|stream|canal|ditch/)) p['line-color'] = C.waterLine;
      else if (has(id, /rail|transit|ferry/)) p['line-color'] = C.rail;
      else if (has(id, /boundary|admin|border/)) p['line-color'] = C.boundary;
      else if (has(id, /casing|outline/)) p['line-color'] = C.casing;
      else if (has(id, /motorway|trunk|primary/)) p['line-color'] = C.roadMajor;
      else if (has(id, /secondary|tertiary/)) p['line-color'] = C.roadMid;
      else p['line-color'] = C.roadMinor;
      delete p['line-pattern'];
      keep.push(l); continue;
    }
    if (l.type === 'symbol') {
      // ikonlu yer işaretleri (dükkan, durak vb.) gizlenir; yalnızca yer ve sokak adları kalır
      if (has(id, /poi|shield|icon|aerodrome|airport|station/)) continue;
      p['text-color'] = has(id, /place|city|town|country|state/) ? C.labelMajor : C.label;
      p['text-halo-color'] = C.halo;
      p['text-halo-width'] = 1.4;
      if (l.layout) delete l.layout['icon-image'];
      keep.push(l); continue;
    }
    if (l.type === 'circle' || l.type === 'heatmap' || l.type === 'hillshade') continue;
    keep.push(l);
  }
  style.layers = keep;
  return style;
}

export async function initMap(el) {
  const lat = +el.dataset.lat, lng = +el.dataset.lng;
  const res = await fetch(STYLE_URL);
  if (!res.ok) throw new Error('style ' + res.status);
  const style = recolor(await res.json());

  const map = new maplibregl.Map({
    container: el,
    style,
    center: [lng, lat],
    zoom: 15.6,
    pitch: 35,
    bearing: -12,
    attributionControl: { compact: true },
    cooperativeGestures: true,
    locale: {
      'CooperativeGesturesHandler.WindowsHelpText': 'Yakınlaştırmak için Ctrl + kaydırma',
      'CooperativeGesturesHandler.MacHelpText': 'Yakınlaştırmak için ⌘ + kaydırma',
      'CooperativeGesturesHandler.MobileHelpText': 'Haritayı iki parmakla hareket ettir',
      'NavigationControl.ZoomIn': 'Yakınlaştır',
      'NavigationControl.ZoomOut': 'Uzaklaştır',
      'NavigationControl.ResetBearing': 'Kuzeye çevir',
    },
  });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');

  // konum işaretçisi: Inkfade logosu + nabız halkası
  const m = document.createElement('div');
  m.className = 'map-pin';
  m.innerHTML = `<span class="map-pin-pulse"></span><img src="${el.dataset.pin}" alt="" /><span class="map-pin-stem"></span>`;
  new maplibregl.Marker({ element: m, anchor: 'bottom' }).setLngLat([lng, lat]).addTo(map);

  map.once('load', () => el.classList.add('ready'));
  return map;
}
