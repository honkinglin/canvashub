import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GalleryPage } from './pages/GalleryPage';
import { DemoPage } from './pages/DemoPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GalleryPage />} />
        <Route path="/demo/:id" element={<DemoPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
