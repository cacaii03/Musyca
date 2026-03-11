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
import { musicalNotes } from 'ionicons/icons';

interface MenuProps {
  contentId: string;
}

const Menu: React.FC<MenuProps> = ({ contentId }) => {
  return (
    <IonMenu contentId={contentId}>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Musyca</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="ion-padding">
        <IonList>
          <IonMenuToggle autoHide={false}>
            <IonItem button routerLink="/music" routerDirection="root" detail={false}>
              <IonIcon icon={musicalNotes} slot="start" />
              <IonLabel>Music Player</IonLabel>
            </IonItem>
          </IonMenuToggle>
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default Menu;