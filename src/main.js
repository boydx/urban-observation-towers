import 'maplibre-gl/dist/maplibre-gl.css'
import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.js'
import maplibregl from 'maplibre-gl'
import { ImageService, imageService, ImageMapLayer, imageMapLayer, Identify, identify } from 'esri-leaflet'

const ui = {
  height: document.querySelector('#height'),
  elevation: document.querySelector('#elevation'),
  surface: document.querySelector('#surface'),
  spinner: document.querySelector('.spinner'),
  geojson: {
    "type": "FeatureCollection",
    "name": "samples",
    "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
    "features": []
  }
}

const map = new maplibregl.Map({
  container: 'map', // container id
  "zoom": 17,
  // "minZoom": 17,
  "maxZoom": 22,
  "pitch": 45,
  "maxPitch": 85,
  // "minPitch": 45,
  "hash": true,
  "bearing": 0,
  "center": [-84.5, 38.03],
  // pitchWithRotate: false,
  style: {
    "id": "shaded-relief",
    "version": 8,
    "glyphs": "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
    "sources": {
      'raster-tiles': {
        type: 'raster',
        tiles: [
          'https://nyc3.digitaloceanspaces.com/astoria/tiles/lex-2025-dsm/{z}/{x}/{y}.jpg'
        ],
        tileSize: 512
      },
      'canopy-tiles': {
        type: 'raster',
        tiles: [
          // "../assets/data/lex-2025-rgb-dem/{z}/{x}/{y}.png"
          'https://nyc3.digitaloceanspaces.com/astoria/tiles/canopy_lex_2019/{z}/{x}/{y}.png'
        ],
        tms: 1,
        tileSize: 256
      },
      'photo-tiles': {
        type: 'raster',
        tiles: [
          "https://kygisserver.ky.gov/arcgis/rest/services/WGS84WM_Services/Ky_Imagery_2019_6IN_WGS84WM/MapServer/tile/{z}/{y}/{x}"
        ],
        tms: 1,
        tileSize: 256
      },
      'state-mask': {
        type: 'geojson',
        data: 'new_circle_knockout.geojson'
      },
      'tower-source': {
        type: 'geojson',
        data: 'data-footprints.geojson'
      },
      'terrain': {
        'type': 'raster-dem',
        'url': 'index.terrain.json',
        'tileSize': 512,
        'encoding': 'custom',
        'redFactor': 256,
        'greenFactor': 1,
        'blueFactor': 1 / 256,
      }
      ,
      'sample': {
        type: 'geojson',
        data: ui.geojson
      }
    },
    "layers": [
      {
        'id': 'dsm-layer',
        'type': 'raster',
        'source': 'raster-tiles',
        'paint': {
          "raster-opacity": 1,
          "raster-resampling": "nearest",
          "raster-contrast": 0,
          "raster-brightness-min": 0.5
        }
      },
      {
        'id': 'canopy-layer',
        'type': 'raster',
        'source': 'canopy-tiles',
        'paint': {
          "raster-opacity": 0.2,
          "raster-resampling": "nearest",
          "raster-saturation": 0.6,
          "raster-hue-rotate": 10
        }
      },
      // {
      //     'id': 'photo-layer',
      //     'type': 'raster',
      //     'source': 'photo-tiles',
      //     'paint': {
      //         "raster-opacity": 0.1,
      //         "raster-resampling": "nearest",
      //         "raster-saturation": 0.7,
      //         "raster-hue-rotate": 0
      //     }
      // },
      {
        'id': 'geojson-layer',
        'type': 'fill',
        'source': 'state-mask',
        'paint': {
          'fill-color': 'lightgray',
          'fill-opacity': 1,

        }
      },
      {
        'id': 'geojson-outline',
        'type': 'line',
        'source': 'state-mask',
        'paint': {
          'line-color': 'black',
          'line-width': 0
        }
      },
      {
        'id': 'tower-layer',
        'type': 'fill',
        'source': 'tower-source',
        'paint': {
          'fill-color': 'red',
          'fill-opacity': 0.1,

        }
      },
      {
        'id': 'tower-layer-line',
        'type': 'line',
        'source': 'tower-source',
        'paint': {
          'line-color': 'red',
          'line-width': 2

        }
      },
      {
        'id': 'sample-layer',
        'type': 'circle',
        'source': 'sample',
        'paint': {
          'circle-radius': 5,
          'circle-color': 'blue',
          'circle-opacity': 0.5,
          'circle-stroke-color': 'black',
          'circle-stroke-width': 1
        }
      },
      {
        'id': 'tower-label',
        'type': 'symbol',
        'source': 'tower-source',
        'filter': ['has', 'height'],
        'layout': {
          'text-field': ['get', 'label'],
          'text-size': 10,
          'text-offset': [0, 0],
          'text-anchor': 'center',
          'text-allow-overlap': true
        },
        'paint': {
          'text-color': 'black',
          'text-halo-color': 'white', // Halo color for better visibility
          'text-halo-width': 1 // Width of the halo   
        }

      },
      {
        'id': 'sample-label',
        'type': 'symbol',
        'source': 'sample',
        'layout': {
          'text-field': ['get', 'height'],
          'text-size': 10,
          'text-offset': [0, -2],
          'text-anchor': 'top',
          'text-allow-overlap': true
        },
        'paint': {
          'text-color': 'black',
          'text-halo-color': 'white', // Halo color for better visibility
          'text-halo-width': 1 // Width of the halo   
        }

      },
    ]
  },
  // style: 'https://demotiles.maplibre.org/style.json', // style URL

});


map.on('load', function () {

  // map.setTerrain({ 'source': 'terrain', 'exaggeration': exaggeration });

  map.addControl(
    new maplibregl.NavigationControl({
      visualizePitch: true,
      showZoom: true,
      showCompass: true
    })
  );

  const exaggeration = 1 / (3.28084 * 1);
  map.addControl(
    new maplibregl.TerrainControl({
      source: 'terrain',
      exaggeration: exaggeration
    })
  );

  map.addControl(
    new maplibregl.FullscreenControl({
      container: document.querySelector('body')
    })
  );
  map.addControl(
    new maplibregl.ScaleControl({
      maxWidth: 80,
      unit: 'imperial'
    })
  );

  let geolocate = new maplibregl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    trackUserLocation: true,
    showCompass: true,
    // showAccuracyCircle: true,
  });
  map.addControl(geolocate);
  geolocate.on('geolocate', (e) => {
    console.log('A geolocate event has occurred.', e);
    const coords = {
      lngLat:
      {
        lng: e.coords.longitude,
        lat: e.coords.latitude
      }
    }
    getHeight(coords);
  });

  map.setSky({
    'sky-color': "skyblue",
    'sky-horizon-blend': 1,
    'horizon-color': "whitesmoke",
    'horizon-fog-blend': 0,
    'fog-color': "whitesmoke",
    'fog-ground-blend': 0,
  });

  map.on('click', getHeight);

  // When a click event occurs on a feature in the states layer, open a popup at the
  // location of the click, with description HTML from its properties.
  map.on('click', 'tower-layer', (e) => {
    const props = e.features[0].properties;
    const popup = `<h3>${props.name}</h3>
    Floors: ${props.height}</br>
    Type: ${props.type}`
    console.log(popup);
    new maplibregl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(popup)
      .addTo(map);
  });


  map.getCanvas().style.cursor = 'crosshair';


  // Change it back to a pointer when it leaves.
  map.on('mouseleave', 'states-layer', () => {
    map.getCanvas().style.cursor = '';
  });
});

function getHeight(point) {
  const elev = (r, g, b) => {
    return ((r * 256) + g + (b / 256));
  }
  ui.spinner.style.display = "block";

  // const rgb = (e) => {
  //     const a = Math.floor(e / 256);
  //     const b = Math.floor(e % 256);
  //     const c = Math.floor((e % 1) * 256);
  //     return [a, b, c];
  const zoom = map.getZoom();
  map.setZoom(zoom + 0.001);
  const tileSize = 512;
  const lng = point.lngLat.lng;
  const lat = point.lngLat.lat;
  let baseElevation = 0;

  // Calculate tile coordinates from longitude and latitude to Mercator coordinates 
  const z = 19 //Math.floor(zoom);
  const n = 2 ** z; // Number of tiles at zoom level z
  const x = Math.floor((lng + 180) / 360 * n);
  const y = Math.floor(
    (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * n
  );


  const tileUrl = `https://nyc3.digitaloceanspaces.com/astoria/tiles/lex-2025-dsm-rgb-dem/${z}/${x}/${y}.png`;

  // Calculate pixel position in tile
  const worldX = ((lng + 180) / 360 * n * tileSize) % tileSize;
  console.log(`World X coordinate: ${worldX}`);
  const sinLat = Math.sin(lat * Math.PI / 180);
  console.log(`Sine of Latitude: ${sinLat}`);
  const worldY = ((0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * n * tileSize) % tileSize;
  const px = Math.floor(worldX);
  const py = Math.floor(worldY);
  console.log(`Pixel coordinates in tile: (${px}, ${py})`);

  // Load tile image and sample pixel
  const img = new window.Image();
  img.crossOrigin = "Anonymous";
  img.onload = function () {
    const canvas = document.createElement('canvas');
    canvas.width = tileSize;
    canvas.height = tileSize;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const pixel = ctx.getImageData(px, py, 1, 1).data;
    console.log(`Pixel data at (${px}, ${py}):`, pixel);
    const [r, g, b] = pixel;
    const elevation = elev(r, g, b);

    // Now query the elevation service for the base elevation at the clicked point
    getElevation(point.lngLat)
      .then((baseElev) => {
        ui.height.innerHTML = `Height: ${Math.abs(elevation - baseElev).toFixed(1)} ft`;
        ui.surface.innerHTML = `Surface: ${elevation.toFixed(1)} ft`;
        ui.elevation.innerHTML = `Elevation: ${Number(baseElev).toFixed(1)} ft`;
        ui.spinner.style.display = "none";
        const feature = {
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [point.lngLat.lng, point.lngLat.lat]
          },
          "properties": {
            "elevation": Number(baseElev),
            "height": Number(Math.abs(elevation - baseElev).toFixed(1)),
            "surface": Number(elevation.toFixed(1)),
            "lng": point.lngLat.lng,
            "lat": point.lngLat.lat,
          }
        };
        ui.geojson.features.push(feature);
        map.getSource('sample').setData(ui.geojson);
        console.log('Feature added:', feature);
      })
      .catch((error) => {
        console.error('Error fetching base elevation:', error);
      });

  };
  img.onerror = function () {
    alert('Failed to load DEM tile.');
  };
  img.src = tileUrl;
  console.log(`Tile URL: ${tileUrl}`);
}

function getElevation(point) {
  const elev = imageMapLayer({
    url: "https://kyraster.ky.gov/arcgis/rest/services/ElevationServices/Ky_DEM_KYAPED_2FT_Phase2/ImageServer",
  })
  return new Promise((resolve, reject) => {
    elev
      .identify()
      .at(point)
      .run(function (error, results) {
        if (error) {
          console.error(error);
          reject(error);
          ui.modal.style.display = "block";
          ui.modalContent.innerHTML = `<p>Sorry. Service is down with the following error: </p>
                            <p>${error.code}</p>
                            <p>${error.message}</p>
                            <p>${error.details[0]}</p>
                            <p>Try again later and refresh your browser.</p>`
          ui.spinner.style.display = "none";
          return;
        }
        resolve(results.pixel.properties.value);
      });
  });
}

