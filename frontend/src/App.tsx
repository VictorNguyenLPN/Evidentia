import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ChatProvider } from './contexts';
import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/LandingPage';
import ChatPage from './pages/ChatPage';
import LawsPage from './pages/LawsPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <ChatProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          {/* Main Layout with Persistent Sidebar */}
          <Route element={<MainLayout />}>
            <Route path="/chats" element={<ChatPage />} />
            <Route path="/chats/:chatId" element={<ChatPage />} />
            <Route path="/laws" element={<LawsPage />} />
            <Route path="/laws/:documentId" element={<LawsPage />} />
          </Route>

          {/* Fallback route for all unmatched URLs and sub-URLs */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ChatProvider>
  );
}

export default App;
