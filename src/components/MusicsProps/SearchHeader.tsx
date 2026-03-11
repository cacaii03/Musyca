import React from 'react';
import { IonHeader, IonToolbar, IonTitle, IonSearchbar, IonBadge } from '@ionic/react';
import './SearchHeader.css';

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
    <IonHeader className="search-header">
      <IonToolbar className="search-toolbar">
        <IonTitle className="search-title">{title}</IonTitle>
        {resultCount !== undefined && searchText && (
          <IonBadge color="secondary" className="result-badge" slot="end">
            {resultCount} {resultCount === 1 ? 'result' : 'results'}
          </IonBadge>
        )}
      </IonToolbar>
      <IonToolbar className="searchbar-toolbar">
        <div className="searchbar-wrapper">
          <div className="searchbar-container">
            <IonSearchbar
              value={searchText}
              onIonInput={e => onSearch(e.detail.value || '')}
              onIonClear={() => onSearch('')}
              placeholder="Search by title or artist"
              animated
              showCancelButton="focus"
              cancelButtonText="Clear"
              className="custom-searchbar"
            />
          </div>
        </div>
      </IonToolbar>
    </IonHeader>
  );
};

export default SearchHeader;