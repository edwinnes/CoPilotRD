import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Dimensions, TouchableOpacity, Text, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

export default function CoPilotClientMap({ onLocationSelect }) {
  const webViewRef = useRef(null);
  const [loadingGps, setLoadingGps] = useState(false);
  const [userCoords, setUserCoords] = useState({ latitude: 18.4861, longitude: -69.9312 });

  // API Key proporcionada para Google Maps
  const apiKey = "AIzaSyB6WEz7qHq5qBsPkliSCGjgUgUxs3lFmgw";

  useEffect(() => {
    obtainUserLocationAndStream();
  }, []);

  const obtainUserLocationAndStream = async () => {
    setLoadingGps(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso de GPS', 'Se requiere acceso a la ubicación para la telemetría en tiempo real.');
        setLoadingGps(false);
        return;
      }

      // Suscripción a la posición en vivo (Motor de dirección en tiempo real)
      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 2,
        },
        (location) => {
          const { latitude, longitude } = location.coords;
          setUserCoords({ latitude, longitude });

          if (webViewRef.current) {
            webViewRef.current.postMessage(JSON.stringify({
              type: 'UPDATE_LOCATION',
              latitude,
              longitude
            }));
          }

          if (onLocationSelect) {
            onLocationSelect({ latitude, longitude });
          }
        }
      );
    } catch (error) {
      console.warn('Error en la telemetría GPS:', error);
    } finally {
      setLoadingGps(false);
    }
  };

  const mapHtmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <style>
          html, body, #map { width: 100%; height: 100%; margin: 0; padding: 0; background-color: #0A0E1A; }
          .gm-style-cc, .gmnoprint, a[href^="https://maps.google.com/maps"] { display: none !important; }
        </style>
        <script src="https://maps.googleapis.com/maps/api/js?key=${apiKey}"></script>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map;
          var userMarker;

          var darkStyle = [
            { "elementType": "geometry", "stylers": [{ "color": "#0F172A" }] },
            { "elementType": "labels.text.fill", "stylers": [{ "color": "#94A3B8" }] },
            { "elementType": "labels.text.stroke", "stylers": [{ "color": "#0F172A" }] },
            { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#CBD5E1" }] },
            { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#64748B" }] },
            { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#111E2E" }] },
            { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#1E293B" }] },
            { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#0F172A" }] },
            { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#334155" }] },
            { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#060B14" }] }
          ];

          function initMap() {
            var startPos = { lat: ${userCoords.latitude}, lng: ${userCoords.longitude} };

            map = new google.maps.Map(document.getElementById('map'), {
              center: startPos,
              zoom: 17,
              styles: darkStyle,
              disableDefaultUI: true,
              gestureHandling: 'greedy'
            });

            // Ícono personalizado y avanzado para la posición en vivo
            userMarker = new google.maps.Marker({
              position: startPos,
              map: map,
              icon: {
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 7,
                fillColor: '#38BDF8',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2,
                rotation: 0
              }
            });

            document.addEventListener("message", handleNativeMessage);
            window.addEventListener("message", handleNativeMessage);
          }

          function handleNativeMessage(event) {
            try {
              var data = JSON.parse(event.data);
              if (data.type === 'UPDATE_LOCATION') {
                var newPos = { lat: data.latitude, lng: data.longitude };
                map.panTo(newPos);
                userMarker.setPosition(newPos);
              }
            } catch (e) {}
          }

          window.onload = initMap;
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.mapContainer}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: mapHtmlContent }}
        style={styles.webView}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: width,
    height: height,
    backgroundColor: '#0A0E1A',
    zIndex: 1,
  },
  webView: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
});
