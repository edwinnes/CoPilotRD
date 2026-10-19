import React, { useRef, useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

export default function CoPilotClientMap({ onLocationSelect, isExpanded }) {
  const webViewRef = useRef(null);
  const [isMapReady, setIsMapReady] = useState(false);

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
          /* Expansión agresiva hacia abajo para eliminar por completo el logotipo y barras de Google */
          #map {
            width: 100%;
            height: calc(100% + 90px);
            position: absolute;
            top: 0;
            left: 0;
            margin-bottom: -90px;
          }
          /* Ocultar elementos de atribución y controles */
          .gmnoprint, .gm-style-cc, a[href^="https://maps.google.com/maps"], .gm-fullscreen-control {
            display: none !important;
          }
        </style>
        <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyB6WEz7qHq5qBsPkliSCGjgUgUxs3lFmgw"></script>
      </head>
      <body>
        <div id="map"></div>
        <script>
          let map, userMarker, destMarker, routePolyline;
          let hasInitiallyCentered = false;

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
              styles: [
                { elementType: "geometry", stylers: [{ color: "#0F172A" }] },
                { elementType: "labels.text.fill", stylers: [{ color: "#94A3B8" }] },
                { elementType: "labels.text.stroke", stylers: [{ color: "#0F172A" }] },
                { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#CBD5E1" }] },
                { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#64748B" }] },
                { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#111E2E" }] },
                { featureType: "road", elementType: "geometry", stylers: [{ color: "#1E293B" }] },
                { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#0F172A" }] },
                { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#334155" }] },
                { featureType: "water", elementType: "geometry", stylers: [{ color: "#060B14" }] }
              ]
            });

            userMarker = new google.maps.Marker({
              position: currentPos,
              map: map,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#38BDF8",
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
    let subscription;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000,
          distanceInterval: 5,
        },
        (loc) => {
          const { latitude, longitude } = loc.coords;
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
    })();

    return () => {
      if (subscription) subscription.remove();
    };
  }, [isMapReady]);

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: mapHtml }}
        style={styles.webview}
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: width,
    height: height + 90,
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
