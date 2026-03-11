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
import Loading from './components/MusicsProps/Loading';
import Menu from './components/Menu';

setupIonicReact();

const UserMusics = lazy(() => import('./pages/UserMusics'));
const Games = lazy(() => import('./pages/Games'));

const App: React.FC = () => {
  return (
    <IonApp>
      <IonReactRouter>
        <Menu contentId="main" />
        
        <IonRouterOutlet id="main">
          <Suspense fallback={<Loading />}>
            <Route exact path="/" component={UserMusics} />
            <Route exact path="/music" component={UserMusics} />
            <Route exact path="/games" component={Games} />
          </Suspense>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;