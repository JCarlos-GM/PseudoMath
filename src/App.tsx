import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';

// Páginas (Crearemos placeholders en el siguiente paso)
import Home from './pages/Home';
import Generators from './pages/Generators';
import Validators from './pages/Validators';
import Theory from './pages/Theory';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="generadores" element={<Generators />} />
          <Route path="validadores" element={<Validators />} />
          <Route path="teoria" element={<Theory />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;