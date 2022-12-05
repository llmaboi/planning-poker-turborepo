// import Header from '../components/Header';
import { RoomDisplaysProvider } from '../providers/roomDisplays.provider';
import { Outlet } from 'react-router-dom';
import './Auth.layout.css';
import Header from '../components/Header';

function AuthLayout() {
  return (
    <RoomDisplaysProvider>
      <Header />
      <section className='auth-body'>
        <Outlet />
      </section>
    </RoomDisplaysProvider>
  );
}

export default AuthLayout;
