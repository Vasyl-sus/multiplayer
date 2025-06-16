import React, {useState, useEffect} from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import Home from "./pages/Home";
import Lobby from "./pages/Lobby";
import customFont from "./assets/fonts/PHOTOGRAPHS.woff";
import "./App.css";
import "./assets/css/game.css";
import Play from "./pages/Play";
import Test from "./pages/Test";
import {GameProvider} from "./providers/GameProvider";
import {AnimationProvider} from "./providers/AnimationProvider";
import PrivateLobby from "./pages/PrivateLobby";
import Loading from "./components/Loading";
import frames from "./data"

function App() {
  const [fontLoaded, setFontLoaded] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadedImages, setLoadedImages] = useState([]);

  useEffect(() => {
    loadFont();
    loadImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loadedImages.length === 8) {
      setImagesLoaded(true);
    }
  }, [loadedImages]);

  const loadImages = () => {
    Object.keys(frames).forEach(it => {
      if (it.includes("_image")) {
        const img = new Image();
        img.onload = onImageLoadFinal(it);
        img.onerror = onImageLoadFinal(it);
        img.src = frames[it];
      }
    });
  };

  const onImageLoadFinal = (it) => () => {
    setLoadedImages(prevState => ([...prevState, it]));
  };

  const loadFont = async () => {
    try {
      const font = new FontFace('Photograph', `url(${customFont})`);
      // wait for font to be loaded
      await font.load();
      // add font to document
      document.fonts.add(font);
    } catch (e) {
      console.log('font load error', e);
    } finally {
      setFontLoaded(true);
    }
  }

  return (
    (fontLoaded && imagesLoaded) ? (
      <Router>
        <Switch>
          <Route path="/home">
            <Home/>
          </Route>
          <Route
            path="/lobby/:id/:session"
            render={({match: {params}}) => (
              <Lobby
                id={params.id}
                session={params.session}
              />
            )}
          />

          <Route
            path="/play/:id/:session"
            render={({match: {params}}) => (
              <AnimationProvider>
                <GameProvider
                  id={params.id}
                  session={params.session}
                >
                  <Play/>
                </GameProvider>
              </AnimationProvider>
            )}
          >
          </Route>

          <Route
            path="/private-lobby/:id/:session"
            render={({match: {params}}) => (
              <AnimationProvider>
                <GameProvider
                  id={params.id}
                  session={params.session}
                >
                  <PrivateLobby
                    id={params.id}
                    session={params.session}
                  />
                </GameProvider>
              </AnimationProvider>
            )
            }
          >
          </Route>

          <Route
            path="/test"
          >
            <Test/>
          </Route>

          <Redirect to="/home"/>
        </Switch>
      </Router>
    ) : (
      <div>
        <Loading/>
      </div>
    )
  );
}

export default App;
