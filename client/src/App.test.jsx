import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import Home from './pages/Home.jsx';
import { AdventureCard, formatDuration } from './components/AdventureCard.jsx';

describe('Little Adventures frontend',()=>{
  it('shows real homepage calls to action and introductory feature cards',()=>{
    render(<MemoryRouter><Home/></MemoryRouter>);
    expect(screen.getByRole('heading',{name:/Small plans/i})).toBeInTheDocument();
    expect(screen.getByRole('link',{name:/Explore adventures/i})).toHaveAttribute('href','/explore');
    expect(screen.getByRole('link',{name:/Pick one for me/i})).toHaveAttribute('href','/pick-for-me');
  });
  it('displays adventure data supplied by the backend rather than hard-coded cards',()=>{
    render(<MemoryRouter><AdventureCard adventure={{_id:'abc',title:'A Study Break',location:'Beirut',region:'Beirut',estimatedCost:0,durationMinutes:90,moods:['relax'],cover:'city'}}/></MemoryRouter>);
    expect(screen.getByRole('heading',{name:'A Study Break'})).toBeInTheDocument();
    expect(screen.getByText('$0 est.')).toBeInTheDocument();
    expect(screen.getByText('1h 30m')).toBeInTheDocument();
  });
  it('formats time consistently',()=>{
    expect(formatDuration(45)).toBe('45m');expect(formatDuration(120)).toBe('2h');
  });
});
