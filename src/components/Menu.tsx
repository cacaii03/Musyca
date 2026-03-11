import React from 'react';
import {
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonMenuToggle,
} from '@ionic/react';
import { home, musicalNotes, gameController, settings } from 'ionicons/icons';
import './Menu.css';

interface MenuProps {
  contentId: string;
}

const Menu: React.FC<MenuProps> = ({ contentId }) => {
  return (
    <IonMenu contentId={contentId} side="start" type="overlay">
      <IonHeader>
        <IonToolbar className="menu-toolbar">
          <IonTitle className="menu-title">MUSYCA</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="menu-content">
        <IonList className="menu-list">
          <IonMenuToggle autoHide={false}>
            {/* Home Link */}
            <IonItem 
              button 
              routerLink="/home" 
              routerDirection="root" 
              detail={false}
              className="menu-item"
            >
              <IonIcon icon={home} slot="start" className="menu-icon home-icon" />
              <IonLabel className="menu-label">Home</IonLabel>
            </IonItem>
            
            {/* Music Player Link */}
            <IonItem 
              button 
              routerLink="/music" 
              routerDirection="root" 
              detail={false}
              className="menu-item"
            >
              <IonIcon icon={musicalNotes} slot="start" className="menu-icon music-icon" />
              <IonLabel className="menu-label">Music Player</IonLabel>
            </IonItem>
            
            {/* Games Link */}
            <IonItem 
              button 
              routerLink="/games" 
              routerDirection="root" 
              detail={false}
              className="menu-item"
            >
              <IonIcon icon={gameController} slot="start" className="menu-icon games-icon" />
              <IonLabel className="menu-label">Games</IonLabel>
            </IonItem>

            {/* Settings Link */}
            <IonItem 
              button 
              routerLink="/settings" 
              routerDirection="root" 
              detail={false}
              className="menu-item"
            >
              <IonIcon icon={settings} slot="start" className="menu-icon settings-icon" />
              <IonLabel className="menu-label">Settings</IonLabel>
            </IonItem>
          </IonMenuToggle>
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default Menu;