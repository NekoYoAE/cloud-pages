import { BrowserRouter } from 'react-router-dom';

import { PageStage } from '@/components/PageStage';
import { useCursor } from '@/hooks/useCursor';

export default function App() {
  useCursor();

  return (
    <BrowserRouter>
      <PageStage />
    </BrowserRouter>
  );
}
