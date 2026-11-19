import { api, queryString } from './api.js';

export function hasCoordinates(place) {
  return Number.isFinite(place.latitude) && Math.abs(place.latitude) <= 90 &&
    Number.isFinite(place.longitude) && Math.abs(place.longitude) <= 180;
}

// Fetch every matching page using the same validated filters as the list.
export async function loadMapResults(filters, signal) {
  const records = new Map();
  let page = 1, pages = 1;
  do {
    const data = await api('/adventures' + queryString({...filters, page, limit: 100}), {signal});
    data.adventures.forEach(place => records.set(place._id, place));
    pages = data.pages;
    page++;
  } while (page <= pages);
  const adventures = [...records.values()];
  return {adventures, total: adventures.length, pages: 1};
}
