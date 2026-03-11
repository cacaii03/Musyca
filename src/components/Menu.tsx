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
import { home, musicalNotes, gameController } from 'ionicons/icons'; // Add home icon

interface MenuProps {
  contentId: string;
}

const Menu: React.FC<MenuProps> = ({ contentId }) => {
  return (
    <IonMenu contentId={contentId} side="start" type="overlay">
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Musyca</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent>
        <IonList>
          <IonMenuToggle autoHide={false}>
            {/* Home Link */}
            <IonItem button routerLink="/home" routerDirection="root" detail={false}>
              <IonIcon icon={home} slot="start" color="tertiary" />
              <IonLabel>Home</IonLabel>
            </IonItem>
            
            {/* Music Player Link */}
            <IonItem button routerLink="/music" routerDirection="root" detail={false}>
              <IonIcon icon={musicalNotes} slot="start" color="primary" />
              <IonLabel>Music Player</IonLabel>
            </IonItem>
            
            {/* Games Link */}
            <IonItem button routerLink="/games" routerDirection="root" detail={false}>
              <IonIcon icon={gameController} slot="start" color="secondary" />
              <IonLabel>Games</IonLabel>
            </IonItem>
          </IonMenuToggle>
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default Menu;