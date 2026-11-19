/** All calls use a relative /api path, so dev proxy and production use the same origin. */
export async function api(path, { method = 'GET', body, signal } = {}) {
  const headers = { Accept: 'application/json' };
  if (method !== 'GET') {
    headers['Content-Type'] = 'application/json';
    headers['X-Requested-With'] = 'LittleAdventures';
  }
  let response;
  try {
    response = await fetch(`/api${path}`, {
      method, headers, credentials: 'same-origin',
      ...(body !== undefined ? { body: JSON.stringify(body) } : method !== 'GET' ? { body: '{}' } : {}),
      ...(signal ? { signal } : {})
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('Cannot reach the server. Check your internet connection or try again.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const details = data.details?.map(d => `${d.field || 'Field'}: ${d.message}`).join('; ');
    const error = new Error(details || data.error || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return data;
}
export const queryString = params => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key,value]) => { if (value !== '' && value !== undefined && value !== null) search.set(key, String(value)); });
  return search.toString() ? `?${search}` : '';
};
