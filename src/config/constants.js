
/**
 * Centralized constants for external URLs and assets.
 * This ensures all hardcoded strings are managed in a single place.
 */

// API & Service URLs
export const UI_AVATARS_BASE_URL = 'https://ui-avatars.com/api/';

// Map Services
export const MAPBOX_STATIC_PLACEHOLDER = 'https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/46.7,24.7,11,0/1200x800?access_token=pk.xxx';
export const LEAFLET_TILE_DARK = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
export const LEAFLET_TILE_LIGHT = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

// Backgrounds & Textures
export const CHAT_BACKGROUND_IMAGE = 'https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png';
export const TEXTURE_CUBES_BG = 'https://www.transparenttextures.com/patterns/cubes.png';
export const SVG_DOT_PATTERN = "data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E";

// Placeholders
export const PLACEHOLDER_LOGO = 'https://via.placeholder.com/200x75?text=LOGO';
export const IMAGE_NOT_FOUND = 'https://placehold.co/400?text=Image+Not+Found';

// Leaflet Icons (Note: Usually imported from local assets in prod, but keeping CDN for now)
export const LEAFLET_ICON_RETINA = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png';
export const LEAFLET_ICON_DEFAULT = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png';
export const LEAFLET_ICON_SHADOW = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png';

export const GOOGLE_MAPS_PLACEHOLDER = 'https://goo.gl/maps/...';
