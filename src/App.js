import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LoadingGif from './components/utils/LoadingGif';
import { MetadataProvider } from './components/context/metadataContext';
import { SearchProvider } from './components/context/SearchContext';

const HomePage = lazy(() => import('./components/pages/HomePage'));
const AboutPage = lazy(() => import('./components/pages/About'));
const MetadataBrowser = lazy(() => import('./components/pages/MetadataBrowser'));
const TextPage = lazy(() => import('./components/pages/TextPage'));
const AuthorPage = lazy(() => import('./components/pages/AuthorPage'));
const SearchPage = lazy(() => import('./components/pages/SearchPage'));
const Reader = lazy(() => import('./components/pages/Reader'));

function App() {
  return (
    <MetadataProvider>
      <Router>
        <Layout>
          <Suspense fallback={<LoadingGif />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/metadata" element={<MetadataBrowser />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/text/:textId" element={<TextPage />} />
              <Route path="/author/:authorId" element={<AuthorPage />} />
              <Route path="/search" element={
                <SearchProvider>
                  <SearchPage />
                </SearchProvider>
              } />
              <Route path="/reader/:textId/:vol/:pageNum?" element={<Reader />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </MetadataProvider>
  );
}

const NotFound = () => <h1>404 - Page Not Found</h1>;

export default App;