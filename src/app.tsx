import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage/HomePage';
import TopicsPage from '@/pages/TopicsPage/TopicsPage';
import TopicDetailPage from '@/pages/TopicDetailPage/TopicDetailPage';
import PracticePage from '@/pages/PracticePage/PracticePage';
import MistakesPage from '@/pages/MistakesPage/MistakesPage';
import ProgressPage from '@/pages/ProgressPage/ProgressPage';
import GespPage from '@/pages/GespPage/GespPage';
import ReadingPage from '@/pages/ReadingPage/ReadingPage';
import MapPage from '@/pages/MapPage/MapPage';
import NotFoundPage from '@/pages/NotFoundPage/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="topics" element={<TopicsPage />} />
        <Route path="topics/:topicId" element={<TopicDetailPage />} />
        <Route path="practice" element={<PracticePage />} />
        <Route path="reading" element={<ReadingPage />} />
        <Route path="mistakes" element={<MistakesPage />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="gesp" element={<GespPage />} />
        <Route path="map" element={<MapPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
