import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { hasCoordinates } from '../lib/mapResults.js';

export default function AdventureMap({adventures}) {
  const container = useRef(null);
  const [tileError, setTileError] = useState(false);
  const located = adventures.filter(hasCoordinates);
  const missing = adventures.filter(place => !hasCoordinates(place));

  useEffect(() => {
    if (!container.current || !located.length) return;
    setTileError(false);
    const map = L.map(container.current, {scrollWheelZoom: false}).setView([33.9, 35.8], 8);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      referrerPolicy: 'strict-origin-when-cross-origin'
    }).on('tileerror', () => setTileError(true)).addTo(map);
    const icon = L.divIcon({className: 'adventure-map-pin', html: '<span></span>', iconSize: [28, 28], iconAnchor: [14, 28]});
    const bounds = [];
    for (const place of located) {
      const point = [place.latitude, place.longitude];
      bounds.push(point);
      // Build DOM nodes instead of interpolating admin-entered text as HTML.
      const popup = document.createElement('div');
      popup.className = 'adventure-map-popup';
      if (place.imageUrl && (place.imageUrl.startsWith('https://') || /^\/photos\/[a-zA-Z0-9._-]+$/.test(place.imageUrl))) {
        const photo = document.createElement('img');
        photo.src = place.imageUrl; photo.alt = place.title; photo.loading = 'lazy';
        photo.addEventListener('error', () => photo.remove());
        popup.append(photo);
      }
      const title = document.createElement('strong'); title.textContent = place.title;
      const details = document.createElement('p');
      details.textContent = `${place.location} · ${place.costStatus === 'unknown' ? 'Cost unknown' : `$${place.estimatedCost} per person (${place.costStatus || 'estimate'})`}`;
      const link = document.createElement('a'); link.href = `/adventures/${encodeURIComponent(place._id)}`; link.textContent = 'View details →';
      popup.append(title, details, link);
      L.marker(point, {icon, title: place.title, alt: place.title, keyboard: true}).addTo(map).bindPopup(popup);
    }
    map.fitBounds(bounds, {padding: [35, 35], maxZoom: 12});
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => map.invalidateSize());
    observer?.observe(container.current);
    return () => { observer?.disconnect(); map.remove(); };
  }, [adventures]);

  return <div className="adventure-map-section">
    <p className="subtle" role="status">{located.length} of {adventures.length} matching places shown on the map. Markers indicate place areas, not confirmed entrances.</p>
    {tileError && <p role="alert" className="map-notice">Some map tiles could not load. Check your internet connection. You can still open places below or switch to List.</p>}
    {located.length > 0 ? <div ref={container} className="adventure-map" role="region" aria-label="Map of matching adventures"/> : <p>No matching places have coordinates yet. An admin can add coordinates in Edit place.</p>}
    <details className="map-place-links"><summary>Browse mapped places ({located.length})</summary><ul>{located.map(place => <li key={place._id}><Link to={`/adventures/${place._id}`}>{place.title}</Link></li>)}</ul></details>
    {missing.length > 0 && <div className="map-place-links"><h3>Places without coordinates ({missing.length})</h3><ul>{missing.map(place => <li key={place._id}><Link to={`/adventures/${place._id}`}>{place.title}</Link></li>)}</ul></div>}
  </div>;
}
