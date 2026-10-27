import React, { useRef, useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions, AppState } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { useAppTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function CoPilotClientMap({ onLocationSelect, isExpanded }) {
  const webViewRef = useRef(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const { theme } = useAppTheme();
  const dark = theme === 'dark';

  const mapHtml = useMemo(() => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <style>
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background-color: #0A0E1A;
            touch-action: pan-x pan-y;
          }
          #map {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
          }
        </style>
        <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyB6WEz7qHq5qBsPkliSCGjgUgUxs3lFmgw"></script>
      </head>
      <body>
        <div id="map"></div>
        <script>
          let map, userMarker, destMarker, routePolyline;
          let hasInitiallyCentered = false;
          window.currentMapTheme = 'dark';

          window.getChromeMapStyles = function(mode) {
            const dark = mode === 'dark';

            const palette = dark
              ? {
                  geometry: '#202429',
                  labels: '#B9C0C7',
                  stroke: '#202429',
                  locality: '#D2D7DC',
                  poi: '#929AA3',
                  park: '#292F32',
                  road: '#414850',
                  roadStroke: '#252A30',
                  highway: '#737C85',
                  water: '#151B20'
                }
              : {
                  geometry: '#E6E8EA',
                  labels: '#535B63',
                  stroke: '#F0F1F2',
                  locality: '#353D45',
                  poi: '#707981',
                  park: '#D6DAD7',
                  road: '#F5F6F7',
                  roadStroke: '#C2C8CE',
                  highway: '#AEB6BE',
                  water: '#D1D8DE'
                };

            return [
              { elementType: 'geometry', stylers: [{ color: palette.geometry }] },
              { elementType: 'labels.text.fill', stylers: [{ color: palette.labels }] },
              { elementType: 'labels.text.stroke', stylers: [{ color: palette.stroke }] },
              { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: palette.locality }] },
              { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: palette.poi }] },
              { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: palette.park }] },
              { featureType: 'road', elementType: 'geometry', stylers: [{ color: palette.road }] },
              { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: palette.roadStroke }] },
              { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: palette.highway }] },
              { featureType: 'water', elementType: 'geometry', stylers: [{ color: palette.water }] }
            ];
          };

          window.applyChromeMapTheme = function(mode) {
            window.currentMapTheme = mode === 'light' ? 'light' : 'dark';

            if (map) {
              map.setOptions({
                styles: window.getChromeMapStyles(window.currentMapTheme)
              });
            }
          };


          let currentPos = { lat: 18.4861, lng: -69.9312 };
          let destPos = { lat: 18.4723, lng: -69.8921 };

          function initMap() {
            map = new google.maps.Map(document.getElementById('map'), {
              center: currentPos,
              zoom: 16,
              disableDefaultUI: true,
              gestureHandling: 'greedy',
              draggable: true,
              clickableIcons: false,
              styles: window.getChromeMapStyles(window.currentMapTheme)
            });

            userMarker = new google.maps.Marker({
              position: currentPos,
              map: map,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#C4CCD4",
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: "#FFFFFF"
              }
            });

            destMarker = new google.maps.Marker({
              position: destPos,
              map: map,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#EF4444",
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: "#FFFFFF"
              }
            });

            routePolyline = new google.maps.Polyline({
              path: [currentPos, destPos],
              geodesic: true,
              strokeColor: "#94A3B8",
              strokeOpacity: 0.9,
              strokeWeight: 5,
              map: map,
            });

            setTimeout(() => {
              if (map) google.maps.event.trigger(map, 'resize');
            }, 300);

            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MAP_READY' }));
          }

          window.resizeMap = function() {
            if (map) {
              google.maps.event.trigger(map, 'resize');
            }
          };

          window.updateLocation = function(lat, lng) {
            currentPos = { lat: Number(lat), lng: Number(lng) };
            if (!map || !userMarker) return;

            const pos = new google.maps.LatLng(lat, lng);
            userMarker.setPosition(pos);

            if (routePolyline) {
              routePolyline.setPath([pos, destPos]);
            }

            if (!hasInitiallyCentered) {
              map.setCenter(pos);
              hasInitiallyCentered = true;
            }
          };

          window.onload = initMap;
        </script>
      </body>
    </html>
  `, []);

  useEffect(() => {
    if (!isMapReady || !webViewRef.current) return;

    const mode = dark ? 'dark' : 'light';

    webViewRef.current.injectJavaScript(
      "if (window.applyChromeMapTheme) " +
      "window.applyChromeMapTheme('" + mode + "'); true;"
    );
  }, [dark, isMapReady]);

  useEffect(() => {
    if (webViewRef.current && isMapReady) {
      webViewRef.current.injectJavaScript(`
        setTimeout(() => {
          if (window.resizeMap) window.resizeMap();
        }, 150);
        true;
      `);
    }
  }, [isExpanded, isMapReady]);

  useEffect(() => {
    let subscription = null;
    let cancelled = false;
    let starting = false;

    const startLocationTracking = async () => {
      if (cancelled || starting || subscription) return;
      starting = true;

      try {
        const { status } =
          await Location.requestForegroundPermissionsAsync();

        if (cancelled || status !== 'granted') return;

        const servicesEnabled =
          await Location.hasServicesEnabledAsync();

        if (cancelled) return;

        if (!servicesEnabled) {
          return;
        }

        const watcher = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 2000,
            distanceInterval: 5,
          },
          (loc) => {
            if (cancelled) return;

            const { latitude, longitude } = loc.coords;

            if (
              !Number.isFinite(latitude) ||
              !Number.isFinite(longitude)
            ) return;

            if (webViewRef.current && isMapReady) {
              webViewRef.current.injectJavaScript(`
                if (window.updateLocation) {
                  window.updateLocation(${latitude}, ${longitude});
                }
                true;
              `);
            }
          }
        );

        if (cancelled) {
          watcher.remove();
        } else {
          subscription = watcher;
        }
      } catch (error) {
        if (!cancelled) {
          console.warn(
            '[CoPilotRD GPS] No fue posible iniciar el seguimiento:',
            error?.message || String(error)
          );
        }
      } finally {
        starting = false;
      }
    };

    startLocationTracking();

    const appStateSubscription = AppState.addEventListener(
      'change',
      (state) => {
        if (state === 'active') {
          startLocationTracking();
        }
      }
    );

    return () => {
      cancelled = true;
      appStateSubscription.remove();
      if (subscription) {
        subscription.remove();
        subscription = null;
      }
    };
  }, [isMapReady]);

  return (
    <View style={[
      styles.container,
      { backgroundColor: dark ? '#181B1F' : '#E6E8EA' }
    ]}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: mapHtml }}
        style={[
          styles.webview,
          { backgroundColor: dark ? '#181B1F' : '#E6E8EA' }
        ]}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        nestedScrollEnabled={true}
        androidLayerType="hardware"
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'MAP_READY') {
              setIsMapReady(true);
            }
          } catch (e) {}
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#0A0E1A',
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#0A0E1A',
  },
});
