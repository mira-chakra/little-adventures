import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup,fireEvent,render,screen,waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { AdventureCard } from './components/AdventureCard.jsx';
import Explore from './pages/Explore.jsx';
import PickForMe from './pages/PickForMe.jsx';
import PlaceExtras from './components/PlaceExtras.jsx';
import { api } from './lib/api.js';
vi.mock('./lib/api.js',()=>({api:vi.fn(),queryString:params=>'?' + new URLSearchParams(Object.entries(params).filter(([,v])=>v!==''))}));
const item={_id:'123456789012345678901234',title:'Museum afternoon',location:'Beirut',region:'Beirut',moods:['culture'],estimatedCost:10,durationMinutes:90,imageUrl:'/photos/place-12.jpg',imageCredit:'Photographer',imageSource:'https://commons.wikimedia.org/wiki/File:Photo.jpg',imageLicense:'CC BY 4.0'};
beforeEach(()=>vi.clearAllMocks());afterEach(cleanup);
describe('Expanded catalogue flows',()=>{
 it('credits real photos and shows an honest fallback on image failure',()=>{
  render(<MemoryRouter><AdventureCard adventure={item}/></MemoryRouter>);
  expect(screen.getByRole('link',{name:'Photo: Photographer'})).toHaveAttribute('href',item.imageSource);
  fireEvent.error(screen.getByRole('img'));expect(screen.getByText('Photo unavailable')).toBeInTheDocument();
 });
 it('filters reset pagination and next page requests more records',async()=>{
  api.mockImplementation(path=>Promise.resolve(path.includes('/options')?{regions:['Beirut']}:{adventures:[item],total:50,pages:3}));
  render(<MemoryRouter><Explore/></MemoryRouter>);await screen.findByText('50 adventures to discover');
  fireEvent.click(screen.getByRole('button',{name:'Next'}));await waitFor(()=>expect(api).toHaveBeenCalledWith(expect.stringContaining('page=2'),expect.anything()));
  fireEvent.change(screen.getByLabelText('Search places'),{target:{value:'museum'}});fireEvent.click(screen.getByRole('button',{name:'Apply filters'}));
  await waitFor(()=>expect(api).toHaveBeenCalledWith(expect.stringMatching(/q=museum.*page=1/),expect.anything()));
 });
 it('unavailable weather does not fabricate a forecast',async()=>{
  api.mockResolvedValue({weather:{available:false,message:'Weather provider unavailable.'}});
  render(<PlaceExtras item={item}/>);expect(await screen.findByText('Weather provider unavailable.')).toBeInTheDocument();expect(screen.queryByText(/°C/)).not.toBeInTheDocument();
 });
 it('recommendation show-more keeps the submitted preferences even after the form changes',async()=>{
  api.mockImplementation((path,{body})=>Promise.resolve({recommendations:[{...item,_id:String(body.page),title:'Result '+body.page}],page:body.page,pages:2,totalMatches:2}));
  render(<MemoryRouter><PickForMe/></MemoryRouter>);fireEvent.click(screen.getByRole('button',{name:'Find my adventures'}));
  await screen.findByRole('heading',{name:'Result 1'});
  fireEvent.change(screen.getByLabelText('Maximum estimated activity budget ($)'),{target:{value:'90'}});
  fireEvent.click(screen.getByRole('button',{name:'Show more suggestions'}));await screen.findByRole('heading',{name:'Result 2'});
  expect(api.mock.calls[1][1].body.budget).toBe(30);expect(screen.getByRole('heading',{name:'Result 1'})).toBeInTheDocument();
 });
});
