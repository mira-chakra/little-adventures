import History from './pages/History.jsx';
import Submissions from './pages/Submissions.jsx';
import ReviewSubmissions from './pages/ReviewSubmissions.jsx';
import { Route, Routes, Link } from 'react-router';
import { Layout, AuthRequired, Empty } from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Explore from './pages/Explore.jsx';
import Detail from './pages/Detail.jsx';
import PickForMe from './pages/PickForMe.jsx';
import AuthPage from './pages/AuthPage.jsx';
import Favorites from './pages/Favorites.jsx';
import { AdminDashboard, AdminForm } from './pages/Admin.jsx';
export default function App(){return <Layout><Routes>
  <Route path="/" element={<Home/>}/>
  <Route path="/explore" element={<Explore/>}/>
  <Route path="/adventures/:id" element={<Detail/>}/>
  <Route path="/pick-for-me" element={<PickForMe/>}/>
  <Route path="/login" element={<AuthPage/>}/>
  <Route path="/signup" element={<AuthPage signup/>}/>
  <Route path="/favorites" element={<AuthRequired><Favorites/></AuthRequired>}/>
  <Route path="/history" element={<AuthRequired><History/></AuthRequired>}/>
  <Route path="/suggest" element={<AuthRequired><Submissions/></AuthRequired>}/>
  <Route path="/admin/review" element={<AuthRequired admin><ReviewSubmissions/></AuthRequired>}/>
  <Route path="/admin" element={<AuthRequired admin><AdminDashboard/></AuthRequired>}/>
  <Route path="/admin/new" element={<AuthRequired admin><AdminForm/></AuthRequired>}/>
  <Route path="/admin/edit/:id" element={<AuthRequired admin><AdminForm/></AuthRequired>}/>
  <Route path="*" element={<div className="shell page-section"><Empty title="This page took a little detour" text="There's nothing here, but plenty more to explore." action={<Link to="/explore" className="button button-primary">See adventures</Link>}/></div>}/>
</Routes></Layout>}
