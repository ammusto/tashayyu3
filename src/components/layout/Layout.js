import React from 'react';
import Header from './Header';
import Footer from './Footer';
import './Layout.css';

const Layout = ({ children }) => {
  return (
    <>
      <Header />
      <main>
        <div className='container'>
          {children}

        </div>
      </main>
      <Footer />
    </>
  );
};

export default Layout;
