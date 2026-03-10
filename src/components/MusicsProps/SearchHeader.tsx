import React from 'react';
import { IonHeader, IonToolbar, IonTitle, IonSearchbar, IonBadge } from '@ionic/react';

interface SearchHeaderProps {
  title: string;
  searchText: string;
  onSearch: (query: string) => void;
  resultCount?: number;
}

const SearchHeader: React.FC<SearchHeaderProps> = ({ 
  title, 
  searchText, 
  onSearch,
  resultCount 
}) => {
  return (
    <IonHeader>
      <IonToolbar>
        <IonTitle>{title}</IonTitle>
        {resultCount !== undefined && searchText && (
          <IonBadge color="primary" slot="end" style={{ marginRight: '10px' }}>
            {resultCount} {resultCount === 1 ? 'result' : 'results'}
          </IonBadge>
        )}
      </IonToolbar>
      <IonToolbar>
        <IonSearchbar
          value={searchText}
          onIonInput={e => onSearch(e.detail.value || '')}
          onIonClear={() => onSearch('')}
          placeholder="Search by title or artist"
          animated
          showCancelButton="focus"
          cancelButtonText="Clear"
        />
      </IonToolbar>
    </IonHeader>
  );
};

export default SearchHeader;