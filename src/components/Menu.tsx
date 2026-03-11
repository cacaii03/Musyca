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
import { musicalNotes, gameController } from 'ionicons/icons';

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
            <IonItem button routerLink="/music" routerDirection="root" detail={false}>
              <IonIcon icon={musicalNotes} slot="start" color="primary" />
              <IonLabel>Music Player</IonLabel>
            </IonItem>
            
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