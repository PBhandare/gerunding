import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const REGIONS = {
  USA: {
    countries: ["USA"],
    center: [-95, 37],
    color: "#FF6B6B",
    bounds: [[-125, 24], [-66, 49]]
  },
  GRECO: {
    countries: ["ITA", "GRC", "TUR", "EGY", "LBY", "ISR", "JOR", "LBN", "SYR", "IRQ"],
    center: [30, 35],
    color: "#4ECDC4",
    bounds: [[10, 25], [50, 45]]
  },
  INDO: {
    countries: ["IRN", "AFG", "PAK", "IND", "BGD", "NPL", "LKA", "MMR", "THA", "KHM", "VNM", "MYS", "IDN", "CHN", "JPN"],
    center: [100, 25],
    color: "#45B7D1",
    bounds: [[44, -10], [145, 50]]
  },
  DANE: {
    countries: [],
    center: [-89.4, 43.07],
    color: "#96CEB4",
    bounds: [[-89.9, 42.8], [-88.9, 43.4]],
    geojson: "/danecounty.geojson",
    offset: [0, -30] // Offset up by 30px
  },
  ABOUTME: {
    countries: [],
    center: [-89.4008, 43.0722],
    color: "#FFA07A",
    bounds: [[-89.5, 43.0], [-89.3, 43.15]],
    offset: [0, 30] // Offset down by 30px
  }
};

const DEFAULT_CENTER = [78, 21];
const DEFAULT_ZOOM = 2;

const getRegionContent = (regionName) => {
  switch(regionName) {
    case 'DANE':
      return {
        title: 'Dane County',
        content: (
          <>
            <p style={{ lineHeight: '1.8', color: '#666' }}>
              Dane County content: (probably try to implement some clickable tile here) Sed ut 
              perspiciatis unde omnis iste natus error sit voluptatem 
              accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore 
              veritatis et quasi architecto beatae vitae dicta sunt explicabo.

              <a href = "https://storymaps.arcgis.com/stories/359cf2306140444081c7419511c63bf9">Link</a> to a project. 

              (maybe there's a cool embed preview design choice I could make here)
            </p>
            <p style={{ lineHeight: '1.8', color: '#666' }}>
              Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia 
              consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
            </p>
          </>
        )
      };
    case 'ABOUTME':
      return {
        title: 'About Me',
        content: (
          <>
            <p style={{ lineHeight: '1.8', color: '#666' }}>
              About Me content: Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, 
              consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore 
              et dolore magnam aliquam quaerat voluptatem.
            </p>
            <p style={{ lineHeight: '1.8', color: '#666' }}>
              Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, 
              nisi ut aliquid ex ea commodi consequatur.
            </p>
          </>
        )
      };
    default:
      return {
        title: regionName,
        content: (
          <>
            <p style={{ lineHeight: '1.8', color: '#666' }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod 
              tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, 
              quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu 
              fugiat nulla pariatur.
            </p>
            <p style={{ lineHeight: '1.8', color: '#666' }}>
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt 
              mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit 
              voluptatem accusantium doloremque laudantium, totam rem aperiam.
            </p>
          </>
        )
      };
  }
};

export default function Map() {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const idleTimerRef = useRef(null);
    const panIntervalRef = useRef(null);
    const isPopupOpenRef = useRef(false);
    const markersRef = useRef([]);
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [sidePanelWidth, setSidePanelWidth] = useState(0);
    const isAnimatingRef = useRef(false);

    useEffect(() => {
        const map = new mapboxgl.Map({
            container: mapRef.current,
            style: "mapbox://styles/pbhandare/cmirquboo000j01s686300mvt",
            center: DEFAULT_CENTER,
            zoom: DEFAULT_ZOOM,
        });

        mapInstanceRef.current = map;

        const stopPanning = () => {
            if (panIntervalRef.current) {
                clearInterval(panIntervalRef.current);
                panIntervalRef.current = null;
            }
        };

        const clearIdleTimer = () => {
            if (idleTimerRef.current) {
                clearTimeout(idleTimerRef.current);
                idleTimerRef.current = null;
            }
        };

        const startPanning = () => {
            // Extra safety check - don't pan if region panel is open
            if (selectedRegion) return;
            
            stopPanning();
            
            // Smooth continuous panning using easeTo
            const panContinuously = () => {
                if (!isPopupOpenRef.current && mapInstanceRef.current && !selectedRegion) {
                    const currentCenter = mapInstanceRef.current.getCenter();
                    mapInstanceRef.current.easeTo({
                        center: [currentCenter.lng + 5, currentCenter.lat],
                        duration: 5000,
                        easing: (t) => t // Linear easing for smooth motion
                    });
                }
            };
            
            panContinuously();
            panIntervalRef.current = setInterval(panContinuously, 5000);
        };

        const handleIdle = () => {
            // Don't start idle timer if popup is open OR region panel is open
            if (isPopupOpenRef.current || selectedRegion) {
                stopPanning();
                clearIdleTimer();
                return;
            }
            
            clearIdleTimer();
            idleTimerRef.current = setTimeout(() => {
                if (!isPopupOpenRef.current && !selectedRegion) {
                    startPanning();
                }
            }, 10000);
        };

        const handleUserInteraction = () => {
            stopPanning();
            clearIdleTimer();
        };

        map.on('load', async () => {
            // Load Dane County GeoJSON
            try {
                const response = await fetch('/danecounty.geojson');
                const daneData = await response.json();
                
                map.addSource('dane-county', {
                    type: 'geojson',
                    data: daneData
                });

                map.addLayer({
                    id: 'dane-county-fill',
                    type: 'fill',
                    source: 'dane-county',
                    paint: {
                        'fill-color': REGIONS.DANE.color,
                        'fill-opacity': 0.5
                    }
                });

                map.addLayer({
                    id: 'dane-county-outline',
                    type: 'line',
                    source: 'dane-county',
                    paint: {
                        'line-color': REGIONS.DANE.color,
                        'line-width': 2
                    }
                });

                // Make Dane County clickable
                map.on('click', 'dane-county-fill', () => {
                    handleRegionClick('DANE');
                });

                map.on('mouseenter', 'dane-county-fill', () => {
                    map.getCanvas().style.cursor = 'pointer';
                });

                map.on('mouseleave', 'dane-county-fill', () => {
                    map.getCanvas().style.cursor = '';
                });
            } catch (error) {
                console.log('Dane County GeoJSON not found');
            }

            // Add country highlighting layers for each region (except DANE and ABOUTME)
            Object.entries(REGIONS).forEach(([name, config]) => {
                if (config.countries.length > 0) {
                    map.addLayer({
                        id: `${name}-countries`,
                        type: 'fill',
                        source: {
                            type: 'vector',
                            url: 'mapbox://mapbox.country-boundaries-v1'
                        },
                        'source-layer': 'country_boundaries',
                        paint: {
                            'fill-color': config.color,
                            'fill-opacity': 0.4
                        },
                        filter: ['in', 'iso_3166_1_alpha_3', ...config.countries]
                    });

                    map.addLayer({
                        id: `${name}-countries-outline`,
                        type: 'line',
                        source: {
                            type: 'vector',
                            url: 'mapbox://mapbox.country-boundaries-v1'
                        },
                        'source-layer': 'country_boundaries',
                        paint: {
                            'line-color': config.color,
                            'line-width': 2
                        },
                        filter: ['in', 'iso_3166_1_alpha_3', ...config.countries]
                    });

                    // Make countries clickable
                    map.on('click', `${name}-countries`, () => {
                        handleRegionClick(name);
                    });

                    map.on('mouseenter', `${name}-countries`, () => {
                        map.getCanvas().style.cursor = 'pointer';
                    });

                    map.on('mouseleave', `${name}-countries`, () => {
                        map.getCanvas().style.cursor = '';
                    });
                }
            });

            const handleRegionClick = (name) => {
                if (isAnimatingRef.current) return;
                
                stopPanning();
                clearIdleTimer();
                isAnimatingRef.current = true;
                
                const config = REGIONS[name];
                
                // Open side panel immediately to trigger resize
                setSelectedRegion(name);
                
                // Animate panel width smoothly
                let currentWidth = 0;
                const targetWidth = window.innerWidth / 2;
                const step = targetWidth / 20; // 20 steps for smooth animation
                
                const widthInterval = setInterval(() => {
                    if (currentWidth < targetWidth) {
                        currentWidth += step;
                        setSidePanelWidth(Math.min(currentWidth, targetWidth));
                        
                        // Trigger map resize
                        if (mapInstanceRef.current) {
                            mapInstanceRef.current.resize();
                        }
                    } else {
                        clearInterval(widthInterval);
                        
                        // After panel is fully open, fly to region
                        setTimeout(() => {
                            if (mapInstanceRef.current) {
                                mapInstanceRef.current.fitBounds(config.bounds, {
                                    padding: 100,
                                    duration: 2000,
                                    maxZoom: name === 'ABOUTME' ? 12 : 6
                                });
                            }
                            
                            setTimeout(() => {
                                isAnimatingRef.current = false;
                            }, 2000);
                        }, 100);
                    }
                }, 50); // Update every 50ms for smooth animation
            };

            // Create floating labels for each region
            Object.entries(REGIONS).forEach(([name, config]) => {
                const el = document.createElement('div');
                el.className = 'region-label';
                el.textContent = name === 'ABOUTME' ? 'ABOUT ME' : name;
                el.style.cssText = `
                    background: ${config.color};
                    color: white;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-weight: bold;
                    cursor: pointer;
                    font-size: 14px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                    transition: transform 0.2s;
                    pointer-events: auto;
                    user-select: none;
                `;

                el.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleRegionClick(name);
                });

                const marker = new mapboxgl.Marker({
                    element: el,
                    anchor: 'center',
                    offset: config.offset || [0, 0] // Apply offset if defined
                })
                    .setLngLat(config.center)
                    .addTo(map);

                markersRef.current.push(marker);
            });

            map.on('idle', handleIdle);
            map.on('dragstart', handleUserInteraction);
            map.on('zoomstart', handleUserInteraction);
            map.on('pitchstart', handleUserInteraction);
            map.on('rotatestart', handleUserInteraction);
            map.on('mousedown', handleUserInteraction);
            map.on('touchstart', handleUserInteraction);
        });

        return () => {
            stopPanning();
            clearIdleTimer();
            markersRef.current.forEach(marker => marker.remove());
            map.remove();
        };
    }, [selectedRegion]); // Re-run effect when selectedRegion changes to stop panning

    const handleClose = () => {
        if (isAnimatingRef.current) return;
        
        isAnimatingRef.current = true;
        
        // First, fly back to default view while panel is still open
        if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo({
                center: DEFAULT_CENTER,
                zoom: DEFAULT_ZOOM,
                duration: 2000
            });
        }
        
        // Wait for fly animation to complete, then close panel
        setTimeout(() => {
            // Animate panel width closing smoothly
            let currentWidth = sidePanelWidth;
            const step = currentWidth / 20; // 20 steps for smooth animation
            
            const widthInterval = setInterval(() => {
                if (currentWidth > 0) {
                    currentWidth -= step;
                    setSidePanelWidth(Math.max(currentWidth, 0));
                    
                    // Trigger map resize
                    if (mapInstanceRef.current) {
                        mapInstanceRef.current.resize();
                    }
                } else {
                    clearInterval(widthInterval);
                    setSelectedRegion(null);
                    
                    // Start idle timer after everything is complete
                    setTimeout(() => {
                        isAnimatingRef.current = false;
                        
                        if (idleTimerRef.current) {
                            clearTimeout(idleTimerRef.current);
                        }
                        idleTimerRef.current = setTimeout(() => {
                            if (!isPopupOpenRef.current && mapInstanceRef.current && !selectedRegion) {
                                const stopPanning = () => {
                                    if (panIntervalRef.current) {
                                        clearInterval(panIntervalRef.current);
                                        panIntervalRef.current = null;
                                    }
                                };
                                const startPanning = () => {
                                    stopPanning();
                                    
                                    const panContinuously = () => {
                                        if (mapInstanceRef.current && !selectedRegion) {
                                            const currentCenter = mapInstanceRef.current.getCenter();
                                            mapInstanceRef.current.easeTo({
                                                center: [currentCenter.lng + 5, currentCenter.lat],
                                                duration: 5000,
                                                easing: (t) => t
                                            });
                                        }
                                    };
                                    
                                    panContinuously();
                                    panIntervalRef.current = setInterval(panContinuously, 5000);
                                };
                                startPanning();
                            }
                        }, 10000);
                    }, 100);
                }
            }, 50); // Update every 50ms for smooth animation
        }, 2000); // Wait for flyTo to complete
    };

    const regionContent = selectedRegion ? getRegionContent(selectedRegion) : null;

    return (
        <div style={{ display: 'flex', width: '100%', height: '100vh', position: 'relative' }}>
            <div 
                ref={mapRef} 
                style={{ 
                    width: `${window.innerWidth - sidePanelWidth}px`,
                    height: '100%',
                    transition: 'none' // Remove CSS transition, use interval-based resize
                }} 
            />
            
            <div 
                style={{
                    width: `${sidePanelWidth}px`,
                    height: '100%',
                    background: 'white',
                    overflow: 'auto',
                    transition: 'none', // Remove CSS transition, use interval-based resize
                    position: 'relative',
                    padding: selectedRegion ? '40px' : '0',
                    boxSizing: 'border-box'
                }}
            >
                {selectedRegion && regionContent && (
                    <>
                        <button
                            onClick={handleClose}
                            style={{
                                position: 'absolute',
                                top: '20px',
                                right: '20px',
                                background: '#333',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                cursor: 'pointer',
                                fontSize: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 1000
                            }}
                        >
                            ×
                        </button>
                        
                        <h1 style={{ marginTop: 0, color: REGIONS[selectedRegion].color }}>
                            {regionContent.title}
                        </h1>
                        
                        {regionContent.content}
                    </>
                )}
            </div>
        </div>
    );
}
