import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import GalleryPage from './pages/GalleryPage';
import DemoDetailPage from './pages/DemoDetailPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<GalleryPage />} />
        <Route path="bg/:id" element={<DemoDetailPage />} />
      </Route>
    </Routes>
  );
}

export default App;
