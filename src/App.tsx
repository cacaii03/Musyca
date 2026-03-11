import { Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { lazy, Suspense } from 'react';

/* Core CSS imports */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Dark Mode */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme */
import './theme/variables.css';
import './theme/global.css'; // Import global styles
import Loading from './components/MusicsProps/Loading';
import Menu from './components/Menu';
import { BackgroundProvider } from './contexts/BackgroundContext';

setupIonicReact();

// Lazy load your pages for better performance
const Home = lazy(() => import('./pages/Home'));
const UserMusics = lazy(() => import('./pages/UserMusics'));
const Games = lazy(() => import('./pages/Games'));
const Settings = lazy(() => import('./pages/Settings'));

const App: React.FC = () => {
  return (
    <IonApp>
      <BackgroundProvider>
        <IonReactRouter>
          {/* Menu component - contentId matches router outlet */}
          <Menu contentId="main" />
          
          {/* Main content outlet */}
          <IonRouterOutlet id="main">
            <Suspense fallback={<Loading />}>
              {/* Specific routes first - ORDER MATTERS! */}
              <Route exact path="/settings" component={Settings} />
              <Route exact path="/games" component={Games} />
              <Route exact path="/music" component={UserMusics} />
              <Route exact path="/home" component={Home} />
              <Route exact path="/" component={Home} />
            </Suspense>
          </IonRouterOutlet>
        </IonReactRouter>
      </BackgroundProvider>
    </IonApp>
  );
};

export default App;