import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { StrictMode } from 'react';
import { api } from './lib/api.js';
import { hasCoordinates, loadMapResults } from './lib/mapResults.js';
import AdventureMap from './components/AdventureMap.jsx';
import Explore from './pages/Explore.jsx';
vi.mock('./lib/api.js', () => ({api: vi.fn(), queryString: params => '?' + new URLSearchParams(Object.entries(params).filter(([,v]) => v !== ''))}));
const place = {_id:'123', title:'A mountain walk', location:'Chouf', latitude:33.7, longitude:35.6, estimatedCost:10, costStatus:'estimate'};
beforeEach(() => vi.clearAllMocks());
afterEach(cleanup);
it('rejects missing and out-of-range coordinates without rejecting zero', () => {
  expect(hasCoordinates({...place, latitude:0, longitude:0})).toBe(true);
  for (const latitude of [null, undefined, '', '33', NaN, 91]) expect(hasCoordinates({...place, latitude})).toBe(false);
});
it('loads all result pages with filters and cancellation, deduplicating IDs', async () => {
  api.mockResolvedValueOnce({adventures:[place], pages:2}).mockResolvedValueOnce({adventures:[place, {...place,_id:'456'}], pages:2});
  const signal = new AbortController().signal;
  const data = await loadMapResults({region:'Mount Lebanon',page:8},signal);
  expect(data.total).toBe(2);
  expect(api.mock.calls.map(([url]) => new URLSearchParams(url.split('?')[1]).get('page'))).toEqual(['1','2']);
  expect(api.mock.calls.every(([url,options]) => url.includes('region=Mount+Lebanon') && options.signal===signal)).toBe(true);
});
it('cleans up under StrictMode, opens safe popups and keeps unlocated places accessible', () => {
  const unsafe = {...place,title:'<img src=x onerror=alert(1)>'};
  const {unmount} = render(<StrictMode><MemoryRouter><AdventureMap adventures={[unsafe,{...place,_id:'456',title:'Unlocated museum',latitude:null}]}/></MemoryRouter></StrictMode>);
  expect(screen.getByText(/1 of 2 matching/)).toBeInTheDocument();
  expect(screen.getByRole('link',{name:'Unlocated museum'})).toHaveAttribute('href','/adventures/456');
  fireEvent.click(screen.getByRole('button',{name:unsafe.title}));
  expect(screen.getByRole('link',{name:'View details →'})).toHaveAttribute('href','/adventures/123');
  expect(document.querySelector('img[onerror]')).toBeNull();
  unmount();
});
it('switches to map and applies filters without showing list pagination', async () => {
  api.mockImplementation(url => Promise.resolve(url.includes('/options') ? {regions:['Chouf']} : {adventures:[place],pages:1,total:1}));
  render(<MemoryRouter><Explore/></MemoryRouter>);
  await screen.findByText('1 adventures to discover');
  fireEvent.click(screen.getByRole('button',{name:'Map',exact:true}));
  await screen.findByRole('region',{name:'Map of matching adventures'});
  fireEvent.change(screen.getByLabelText('Search places'),{target:{value:'mountain'}});
  fireEvent.click(screen.getByRole('button',{name:'Apply filters'}));
  await waitFor(()=>expect(api).toHaveBeenCalledWith(expect.stringMatching(/q=mountain.*limit=100/),expect.anything()));
  expect(screen.queryByRole('navigation',{name:'Results pages'})).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'List',exact:true}));
  await screen.findByRole('heading',{name:'A mountain walk'});
});
