import React from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonMenuButton,
  IonIcon,
  IonButton,
} from '@ionic/react';
import { musicalNotes, gameController, arrowForward } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary" className="home-toolbar">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle className="home-title">MUSYCA</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="home-content">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-overlay">
            <div className="hero-content">
              <h1 className="hero-title">MUSYCA</h1>
              <p className="hero-quote">
                "Where rhythm meets soul, and every note tells a story."
              </p>
              <div className="hero-buttons">
                <IonButton 
                  className="hero-button music-button"
                  onClick={() => history.push('/music')}
                >
                  <IonIcon icon={musicalNotes} slot="start" />
                  Music Player
                </IonButton>
                <IonButton 
                  className="hero-button games-button"
                  onClick={() => history.push('/games')}
                >
                  <IonIcon icon={gameController} slot="start" />
                  Game Studio
                </IonButton>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="features-section">
          <h2 className="section-title">Experience Music Like Never Before</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎵</div>
              <h3>Your Music Library</h3>
              <p>Upload and manage your favorite songs. Create your personal collection.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🎸</div>
              <h3>Guitar Hero</h3>
              <p>Play along with rhythm games. Test your skills with falling notes.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🥁</div>
              <h3>Drum Kit</h3>
              <p>Professional drum set with realistic sounds. Play along to any song.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🎹</div>
              <h3>Grand Piano</h3>
              <p>2-octave piano with authentic grand piano sound. Perfect for melodies.</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="cta-section">
          <div className="cta-content">
            <h2>Ready to Start Your Musical Journey?</h2>
            <p>Join Musyca today and transform how you experience music.</p>
            <IonButton 
              className="cta-button"
              onClick={() => history.push('/music')}
            >
              Get Started
              <IonIcon icon={arrowForward} slot="end" />
            </IonButton>
          </div>
        </div>

        {/* Footer with Copyright */}
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-logo">MUSYCA</div>
            <div className="footer-links">
              <a href="#" onClick={(e) => { e.preventDefault(); history.push('/music'); }}>Music</a>
              <a href="#" onClick={(e) => { e.preventDefault(); history.push('/games'); }}>Games</a>
              <a href="#" onClick={(e) => { e.preventDefault(); }}>About</a>
              <a href="#" onClick={(e) => { e.preventDefault(); }}>Contact</a>
            </div>
            <div className="footer-copyright">
              © {new Date().getFullYear()} Musyca. All rights reserved.<br />
              Created by <span className="copyright-name">Maricar Balagan</span>
            </div>
          </div>
        </footer>
      </IonContent>
    </IonPage>
  );
};

export default Home;