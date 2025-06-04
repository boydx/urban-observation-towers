import 'maplibre-gl/dist/maplibre-gl.css'
import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import { setupCounter } from './counter.js'
import maplibregl from 'maplibre-gl'
import { ImageService, imageService, ImageMapLayer, imageMapLayer, Identify, identify } from 'esri-leaflet'

const ground = imageMapLayer({
  url: "https://kyraster.ky.gov/arcgis/rest/services/ElevationServices/Ky_DEM_KYAPED_2FT_Phase2/ImageServer",
})

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
    ]
  },
  // style: 'https://demotiles.maplibre.org/style.json', // style URL

});

// const elevations = [400.23, 512.233, 565.33, 1223.32]

const elev = (r, g, b) => {
  return ((r * 256) + g + (b / 256));
}

console.log(elev(3, 204, 30));
console.log(elev(3, 203, 217));



// const rgb = (e) => {
//     const a = Math.floor(e / 256);
//     const b = Math.floor(e % 256);
//     const c = Math.floor((e % 1) * 256);
//     return [a, b, c];
// }
// for (let i = 0; i < 256; i++) {
//     const x = Math.random() * 5000;
//     [a, b, c] = rgb(x);
//     const y = elev(a, b, c);
//     console.log(x, y, y / x);
// }

// elevations.forEach(e => {
//     const a = Math.floor(e / 256);
//     const b = Math.floor(e % 256);
//     const c = Math.floor((e % 1) * 256);
//     console.log(a, b, c);
//     console.log(elev(a, b, c));
// })

map.on('load', function () {
  const exaggeration = 1 / (3.28084 * 1);
  // map.setTerrain({ 'source': 'terrain', 'exaggeration': exaggeration });

  map.addControl(
    new maplibregl.NavigationControl({
      visualizePitch: true,
      showZoom: true,
      showCompass: true
    })
  );

  map.style.cursor = 'crosshair';

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

  map.setSky({
    'sky-color': "skyblue",
    'sky-horizon-blend': 1,
    'horizon-color': "whitesmoke",
    'horizon-fog-blend': 0.5,
    'fog-color': "whitesmoke",
    'fog-ground-blend': 1,
  });

  map.on('click', function (e) {
    const zoom = map.getZoom();
    map.setZoom(zoom + 0.001);
    console.log(`Zoom level: ${zoom}`);
    const tileSize = 512;
    const lng = e.lngLat.lng;
    console.log(`Longitude: ${lng}`);
    const lat = e.lngLat.lat;
    console.log(`Latitude: ${lat}`);
    let baseElevation = 0;

    // Calculate tile coordinates
    const z = 19 //Math.floor(zoom);
    console.log(`Zoom level (integer): ${z}`);
    const n = 2 ** z; // Number of tiles at zoom level z
    console.log(`Number of tiles at zoom level ${z}: ${n}`);
    const x = Math.floor((lng + 180) / 360 * n);
    console.log(`Tile X coordinate: ${x}`);
    const y = Math.floor(
      (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * n
    );
    console.log(`Tile Y coordinate: ${y}`);

    // Build tile URL (assumes index.terrain.json points to the correct tile URL template)
    const tileUrl = `https://nyc3.digitaloceanspaces.com/astoria/tiles/lex-2025-dsm-rgb-dem/${z}/${x}/${y}.png`;

    // Calculate pixel position in tile
    const worldX = ((lng + 180) / 360 * n * tileSize) % tileSize;
    console.log(`World X coordinate: ${worldX}`);
    const sinLat = Math.sin(lat * Math.PI / 180);
    console.log(`Sine of Latitude: ${sinLat}`);
    const worldY = ((0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * n * tileSize) % tileSize;
    console.log(`World Y coordinate: ${worldY}`);
    const px = Math.floor(worldX);
    const py = Math.floor(worldY);

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
      const [r, g, b] = pixel;
      const elevation = elev(r, g, b);
      console.log(`Elevation at clicked point: ${elevation.toFixed(2)}`);
      getHeight(ground, e.lngLat)
        .then((baseElev) => {
          baseElevation = baseElev;
          console.log(`Base elevation at clicked point: ${baseElevation}`);
          console.log("height", elevation - baseElevation);
        })
        .catch((error) => {
          console.error('Error fetching base elevation:', error);
        });

    };
    img.onerror = function () {
      alert('Failed to load DEM tile.');
    };
    img.src = tileUrl;
  });

});

function getHeight(elev, point) {
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

