import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api.js';
const AuthContext=createContext(null);
export function AuthProvider({children}) {
  const [user,setUser]=useState(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{ let active=true;
    api('/auth/me').then(data=>{if(active)setUser(data.user);}).catch(()=>{if(active)setUser(null);}).finally(()=>{if(active)setLoading(false);});
    return ()=>{active=false;};
  },[]);
  const login=async(credentials)=>{const data=await api('/auth/login',{method:'POST',body:credentials});setUser(data.user);return data.user;};
  const register=async(credentials)=>{const data=await api('/auth/register',{method:'POST',body:credentials});setUser(data.user);return data.user;};
  const logout=async()=>{try{await api('/auth/logout',{method:'POST'});}finally{setUser(null);}};
  return <AuthContext.Provider value={{user,loading,login,register,logout}}>{children}</AuthContext.Provider>;
}
export function useAuth(){const state=useContext(AuthContext);if(!state)throw new Error('Missing AuthProvider');return state;}
