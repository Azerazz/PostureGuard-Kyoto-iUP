// Projection Mercator commune à la carte de fond et au rendu vectoriel.
// Zone couverte : longitude -30° → 160°, latitude -13° → 78°.
export const PX_PER_RAD = 16384 / (2 * Math.PI);
const rad = (d) => (d * Math.PI) / 180;
const merc = (lat) => Math.log(Math.tan(Math.PI / 4 + rad(lat) / 2));
export const LON0 = -30, LON1 = 160, LAT0 = -13, LAT1 = 78;
export const MAP_W = Math.round(rad(LON1 - LON0) * PX_PER_RAD);
export const MAP_H = Math.round((merc(LAT1) - merc(LAT0)) * PX_PER_RAD);
export const TX = -rad(LON0) * PX_PER_RAD;
export const TY = merc(LAT1) * PX_PER_RAD;
// lon/lat (degrés) → pixel de la carte de fond
export const project = ([lon, lat]) => [rad(lon) * PX_PER_RAD + TX, -merc(lat) * PX_PER_RAD + TY];
