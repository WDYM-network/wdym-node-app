import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
// import '../../assets/fonts.css';

import Layout from '../components/layout';
import Home from '../pages/landing';
import Mywallet from '../pages/my-wallet';
import Keys from '../pages/key';
import Dashboard from '../pages/dashboard';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="my-wallet" element={<Mywallet />} />
          <Route path="get-nodes" element={<Home />} />
          <Route path="keys" element={<Keys />} />
          <Route path="dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}
