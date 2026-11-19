import { afterEach,beforeEach,expect,it,vi } from 'vitest';
import { cleanup,fireEvent,render,screen,waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { api } from './lib/api.js';
import Submissions from './pages/Submissions.jsx';
import ReviewSubmissions from './pages/ReviewSubmissions.jsx';
import History from './pages/History.jsx';
vi.mock('./lib/api.js',()=>({api:vi.fn()}));
beforeEach(()=>vi.clearAllMocks());afterEach(cleanup);
const place={_id:'123',title:'Village walk',location:'Daraya',region:'Chouf',description:'A wonderful village walk.',moods:['nature'],estimatedCost:0,durationMinutes:60,status:'pending'};
it('submitting a place shows pending status and confirmation',async()=>{
 api.mockImplementation((url,opts)=>Promise.resolve(opts?.method==='POST'?{submission:place}:{submissions:[]}));
 render(<MemoryRouter><Submissions/></MemoryRouter>);
 await screen.findByText('You have not suggested a place yet.');
 for(const [label,value] of [['Place name',place.title],['Region',place.region],['Town / location',place.location],['Description',place.description]])fireEvent.change(screen.getByLabelText(label),{target:{value}});
 fireEvent.click(screen.getByRole('button',{name:'Submit for review'}));
 await screen.findByText('Pending review');
 expect(api.mock.calls.find(([,o])=>o?.method==='POST')[1].body.status).toBeUndefined();
});
it('admin rejection requires a reason and removes the reviewed item',async()=>{
 api.mockImplementation((url,opts)=>Promise.resolve(opts?{submission:{...place,status:'rejected'}}:{submissions:[place]}));
 render(<MemoryRouter><ReviewSubmissions/></MemoryRouter>);
 await screen.findByRole('heading',{name:place.title});
 expect(screen.getByRole('button',{name:'Reject suggestion'})).toBeDisabled();
 fireEvent.change(screen.getByLabelText(/Feedback for/),{target:{value:'Please clarify the location.'}});
 fireEvent.click(screen.getByRole('button',{name:'Reject suggestion'}));
 await screen.findByText('All caught up');
 expect(api).toHaveBeenCalledWith('/submissions/123/review',{method:'PATCH',body:{decision:'reject',reason:'Please clarify the location.'}});
});
it('history supports an existing undated visit, date editing and removal',async()=>{
 let date=null;
 api.mockImplementation((url,opts)=>{
 if(opts?.method==='PUT'){date=opts.body.visitedOn;return Promise.resolve({});}
 if(opts?.method==='DELETE')return Promise.resolve({});
 return Promise.resolve({visits:[{_id:'v1',adventure:place,visitedOn:date}]});
 });
 render(<MemoryRouter><History/></MemoryRouter>);
 await screen.findByText(/date not recorded/);
 fireEvent.change(screen.getByLabelText('Visit date (optional)'),{target:{value:'2026-01-01'}});
 fireEvent.click(screen.getByRole('button',{name:'Save as visited'}));
 await screen.findByText(/Visited on 2026-01-01/);
 fireEvent.click(screen.getByRole('button',{name:'Remove from history'}));
 await waitFor(()=>expect(screen.getByText('Your story starts here')).toBeInTheDocument());
});
