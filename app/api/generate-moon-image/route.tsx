import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// 200 brightest stars (mag < 4.0) from celestial database
const BRIGHT_STARS = [
  { ra: 101.2872, dec: -16.7161, mag: -1.44, bv: 0.009 },
  { ra: 95.988, dec: -52.6957, mag: -0.62, bv: 0.164 },
  { ra: -146.0847, dec: 19.1824, mag: -0.05, bv: 1.239 },
  { ra: -140.0979, dec: -60.834, mag: -0.01, bv: 0.710 },
  { ra: -80.7653, dec: 38.7837, mag: 0.03, bv: -0.001 },
  { ra: 79.1723, dec: 45.998, mag: 0.08, bv: 0.795 },
  { ra: 78.6345, dec: -8.2016, mag: 0.18, bv: -0.030 },
  { ra: 114.8255, dec: 5.225, mag: 0.4, bv: 0.432 },
  { ra: 24.4285, dec: -57.2368, mag: 0.45, bv: -0.158 },
  { ra: 88.7929, dec: 7.4071, mag: 0.45, bv: 1.500 },
  { ra: -149.0441, dec: -60.373, mag: 0.61, bv: -0.231 },
  { ra: -62.3042, dec: 8.8683, mag: 0.76, bv: 0.221 },
  { ra: -173.3504, dec: -63.0991, mag: 0.77, bv: -0.243 },
  { ra: 68.9802, dec: 16.5093, mag: 0.87, bv: 1.538 },
  { ra: -158.7018, dec: -11.1613, mag: 0.98, bv: -0.235 },
  { ra: -112.6481, dec: -26.432, mag: 1.06, bv: 1.865 },
  { ra: 116.329, dec: 28.0262, mag: 1.16, bv: 0.991 },
  { ra: -15.5873, dec: -29.6222, mag: 1.17, bv: 0.145 },
  { ra: -168.0697, dec: -59.6888, mag: 1.25, bv: -0.238 },
  { ra: -49.642, dec: 45.2803, mag: 1.25, bv: 0.092 },
  { ra: -140.1038, dec: -60.8372, mag: 1.35, bv: 0.900 },
  { ra: 152.093, dec: 11.9672, mag: 1.36, bv: -0.087 },
  { ra: 104.6565, dec: -28.9721, mag: 1.5, bv: -0.211 },
  { ra: 113.6494, dec: 31.8883, mag: 1.58, bv: 0.034 },
  { ra: -172.2085, dec: -57.1132, mag: 1.59, bv: 1.600 },
  { ra: -96.5978, dec: -37.1038, mag: 1.62, bv: -0.231 },
  { ra: 81.2828, dec: 6.3497, mag: 1.64, bv: -0.224 },
  { ra: 81.573, dec: 28.6075, mag: 1.65, bv: -0.130 },
  { ra: 138.2999, dec: -69.7172, mag: 1.67, bv: 0.070 },
  { ra: 84.0534, dec: -1.2019, mag: 1.69, bv: -0.184 },
  { ra: -27.9417, dec: -46.961, mag: 1.73, bv: -0.070 },
  { ra: 85.1897, dec: -1.9426, mag: 1.74, bv: -0.199 },
  { ra: 122.3831, dec: -47.3366, mag: 1.75, bv: -0.145 },
  { ra: -166.4927, dec: 55.9598, mag: 1.76, bv: -0.022 },
  { ra: 51.0807, dec: 49.8612, mag: 1.79, bv: 0.481 },
  { ra: -83.957, dec: -34.3846, mag: 1.79, bv: -0.031 },
  { ra: 165.932, dec: 61.751, mag: 1.81, bv: 1.061 },
  { ra: 107.0979, dec: -26.3932, mag: 1.83, bv: 0.671 },
  { ra: -153.1148, dec: 49.3133, mag: 1.85, bv: -0.099 },
  { ra: 125.6285, dec: -59.5095, mag: 1.86, bv: 1.196 },
  { ra: -95.6703, dec: -42.9978, mag: 1.86, bv: 0.406 },
  { ra: 89.8822, dec: 44.9474, mag: 1.9, bv: 0.077 },
  { ra: -107.8338, dec: -69.0277, mag: 1.91, bv: 1.447 },
  { ra: 99.4279, dec: 16.3993, mag: 1.93, bv: 0.001 },
  { ra: 131.1759, dec: -54.7088, mag: 1.93, bv: 0.043 },
  { ra: -53.5881, dec: -56.7351, mag: 1.94, bv: -0.118 },
  { ra: 37.9545, dec: 89.2641, mag: 1.97, bv: 0.636 },
  { ra: 95.6749, dec: -17.9559, mag: 1.98, bv: -0.240 },
  { ra: 141.8968, dec: -8.6586, mag: 1.99, bv: 1.440 },
  { ra: 31.7934, dec: 23.4624, mag: 2.01, bv: 1.151 },
  { ra: 154.9931, dec: 19.8415, mag: 2.01, bv: 1.128 },
  { ra: 10.8974, dec: -17.9866, mag: 2.04, bv: 1.019 },
  { ra: -76.1836, dec: -26.2967, mag: 2.05, bv: -0.134 },
  { ra: -148.3294, dec: -36.37, mag: 2.06, bv: 1.011 },
  { ra: 2.0969, dec: 29.0904, mag: 2.07, bv: -0.038 },
  { ra: 17.433, dec: 35.6206, mag: 2.07, bv: 1.576 },
  { ra: 86.9391, dec: -9.6696, mag: 2.07, bv: -0.168 },
  { ra: -137.3236, dec: 74.1555, mag: 2.07, bv: 1.465 },
  { ra: -19.3331, dec: -46.8846, mag: 2.07, bv: 1.610 },
  { ra: -96.2664, dec: 12.56, mag: 2.08, bv: 0.155 },
  { ra: 47.0422, dec: 40.9556, mag: 2.09, bv: -0.003 },
  { ra: 30.9748, dec: 42.3297, mag: 2.1, bv: 1.370 },
  { ra: 177.2649, dec: 14.5721, mag: 2.14, bv: 0.090 },
  { ra: 14.1772, dec: 60.7167, mag: 2.15, bv: -0.046 },
  { ra: -169.6207, dec: -48.9599, mag: 2.2, bv: -0.023 },
  { ra: 120.896, dec: -40.0031, mag: 2.21, bv: -0.269 },
  { ra: 139.2725, dec: -59.2752, mag: 2.21, bv: 0.189 },
  { ra: -126.328, dec: 26.7147, mag: 2.22, bv: 0.032 },
  { ra: 136.999, dec: -43.4326, mag: 2.23, bv: 1.665 },
  { ra: -159.0186, dec: 54.9254, mag: 2.23, bv: 0.057 },
  { ra: -54.4429, dec: 40.2567, mag: 2.23, bv: 0.673 },
  { ra: 10.1268, dec: 56.5373, mag: 2.24, bv: 1.170 },
  { ra: -90.8485, dec: 51.4889, mag: 2.24, bv: 1.521 },
  { ra: 83.0017, dec: -0.2991, mag: 2.25, bv: -0.175 },
  { ra: 2.2945, dec: 59.1498, mag: 2.28, bv: 0.380 },
  { ra: -155.0281, dec: -53.4664, mag: 2.29, bv: -0.171 },
  { ra: -119.9166, dec: -22.6217, mag: 2.29, bv: -0.117 },
  { ra: -107.4591, dec: -34.2932, mag: 2.29, bv: 1.144 },
  { ra: -139.5177, dec: -47.3882, mag: 2.3, bv: -0.154 },
  { ra: -141.1232, dec: -42.1578, mag: 2.33, bv: -0.157 },
  { ra: 165.4603, dec: 56.3824, mag: 2.34, bv: 0.033 },
  { ra: -138.7533, dec: 27.0742, mag: 2.35, bv: 0.966 },
  { ra: -33.9535, dec: 9.875, mag: 2.38, bv: 1.520 },
  { ra: -94.378, dec: -39.03, mag: 2.39, bv: -0.171 },
  { ra: 6.571, dec: -42.306, mag: 2.4, bv: 1.083 },
  { ra: 178.4577, dec: 53.6948, mag: 2.41, bv: 0.044 },
  { ra: -102.4055, dec: -15.7249, mag: 2.43, bv: 0.059 },
  { ra: -14.0564, dec: 28.0828, mag: 2.44, bv: 1.655 },
  { ra: 111.0238, dec: -29.3031, mag: 2.45, bv: -0.083 },
  { ra: -40.3551, dec: 62.5856, mag: 2.45, bv: 0.257 },
  { ra: 140.5284, dec: -55.0107, mag: 2.47, bv: -0.141 },
  { ra: -48.4472, dec: 33.9703, mag: 2.48, bv: 1.021 },
  { ra: -13.8098, dec: 15.2053, mag: 2.49, bv: -0.002 },
  { ra: 45.5699, dec: 4.0897, mag: 2.54, bv: 1.630 },
  { ra: -110.7103, dec: -10.5671, mag: 2.54, bv: 0.038 },
  { ra: -151.1151, dec: -47.2884, mag: 2.55, bv: -0.176 },
  { ra: 168.5271, dec: 20.5237, mag: 2.56, bv: 0.128 },
  { ra: -118.6407, dec: -19.8055, mag: 2.56, bv: -0.065 },
  { ra: 83.1826, dec: -17.8223, mag: 2.58, bv: 0.211 },
  { ra: -177.9104, dec: -50.7224, mag: 2.58, bv: -0.128 },
  { ra: -176.0485, dec: -17.5419, mag: 2.58, bv: -0.107 },
  { ra: -74.347, dec: -29.8801, mag: 2.6, bv: 0.062 },
  { ra: -130.7483, dec: -9.3829, mag: 2.61, bv: -0.071 },
  { ra: -123.933, dec: 6.4256, mag: 2.63, bv: 1.167 },
  { ra: 28.66, dec: 20.808, mag: 2.64, bv: 0.165 },
  { ra: 84.9122, dec: -34.0741, mag: 2.65, bv: -0.120 },
  { ra: 89.9303, dec: 37.2126, mag: 2.65, bv: -0.083 },
  { ra: -171.4032, dec: -23.3968, mag: 2.65, bv: 0.893 },
  { ra: 21.454, dec: 60.2353, mag: 2.66, bv: 0.160 },
  { ra: -151.3288, dec: 18.3977, mag: 2.68, bv: 0.580 },
  { ra: -135.367, dec: -43.134, mag: 2.68, bv: -0.184 },
  { ra: 74.2484, dec: 33.1661, mag: 2.69, bv: 1.490 },
  { ra: 161.6924, dec: -49.4203, mag: 2.69, bv: 0.901 },
  { ra: -170.7041, dec: -69.1356, mag: 2.69, bv: -0.176 },
  { ra: -97.309, dec: -37.2958, mag: 2.7, bv: -0.179 },
  { ra: 109.2857, dec: -37.0975, mag: 2.71, bv: 1.616 },
  { ra: -84.7515, dec: -29.8281, mag: 2.72, bv: 1.380 },
  { ra: -63.4351, dec: 10.6133, mag: 2.72, bv: 1.507 },
  { ra: -116.4136, dec: -3.6943, mag: 2.73, bv: 1.584 },
  { ra: -114.0021, dec: 61.5142, mag: 2.73, bv: 0.910 },
  { ra: 160.7392, dec: -64.3945, mag: 2.74, bv: -0.220 },
  { ra: -169.5848, dec: -1.4494, mag: 2.74, bv: 0.368 },
  { ra: 83.8583, dec: -5.9099, mag: 2.75, bv: -0.210 },
  { ra: -159.8508, dec: -36.7123, mag: 2.75, bv: 0.068 },
  { ra: -137.2804, dec: -16.0418, mag: 2.75, bv: 0.147 },
  { ra: -94.1319, dec: 4.5673, mag: 2.76, bv: 1.168 },
  { ra: 76.9624, dec: -5.0864, mag: 2.78, bv: 0.161 },
  { ra: -112.445, dec: 21.4896, mag: 2.78, bv: 0.947 },
  { ra: -101.3381, dec: 14.3903, mag: 2.78, bv: 1.164 },
  { ra: -176.2137, dec: -58.7489, mag: 2.79, bv: -0.193 },
  { ra: -97.3918, dec: 52.3014, mag: 2.79, bv: 0.954 },
  { ra: -126.2148, dec: -41.1668, mag: 2.8, bv: -0.216 },
  { ra: 82.0613, dec: -20.7594, mag: 2.81, bv: 0.807 },
  { ra: -109.6785, dec: 31.6027, mag: 2.81, bv: 0.650 },
  { ra: 6.4378, dec: -77.2542, mag: 2.82, bv: 0.618 },
  { ra: -111.0294, dec: -28.216, mag: 2.82, bv: -0.206 },
  { ra: -83.0073, dec: -25.4217, mag: 2.82, bv: 1.025 },
  { ra: 3.309, dec: 15.1836, mag: 2.83, bv: -0.190 },
  { ra: 121.886, dec: -24.3043, mag: 2.83, bv: 0.458 },
  { ra: -121.2143, dec: -63.4307, mag: 2.83, bv: 0.315 },
  { ra: 58.533, dec: 31.8836, mag: 2.84, bv: 0.271 },
  { ra: -98.675, dec: -55.5299, mag: 2.84, bv: 1.479 },
  { ra: -97.0396, dec: -49.8761, mag: 2.84, bv: -0.136 },
  { ra: 56.8712, dec: 24.1051, mag: 2.85, bv: -0.086 },
  { ra: -164.4558, dec: 10.9592, mag: 2.85, bv: 0.934 },
  { ra: -33.2398, dec: -16.1273, mag: 2.85, bv: 0.180 },
  { ra: 29.6925, dec: -61.5699, mag: 2.86, bv: 0.290 },
  { ra: -63.7563, dec: 45.1308, mag: 2.86, bv: -0.002 },
  { ra: 95.7401, dec: 22.5136, mag: 2.87, bv: 1.621 },
  { ra: -130.2726, dec: -68.6795, mag: 2.87, bv: 0.014 },
  { ra: -25.3746, dec: -60.2596, mag: 2.87, bv: 1.390 },
  { ra: 44.5653, dec: -40.3047, mag: 2.88, bv: 0.128 },
  { ra: -72.559, dec: -21.0236, mag: 2.88, bv: 0.377 },
  { ra: 111.7877, dec: 8.2893, mag: 2.89, bv: -0.097 },
  { ra: -165.9931, dec: 38.3184, mag: 2.89, bv: -0.115 },
  { ra: -120.287, dec: -26.1141, mag: 2.89, bv: -0.180 },
  { ra: 59.4635, dec: 40.0102, mag: 2.9, bv: -0.199 },
  { ra: -114.7028, dec: -25.5928, mag: 2.9, bv: 0.299 },
  { ra: -37.1103, dec: -5.5712, mag: 2.9, bv: 0.828 },
  { ra: 46.1991, dec: 53.5064, mag: 2.91, bv: 0.716 },
  { ra: 146.7755, dec: -65.072, mag: 2.92, bv: 0.273 },
  { ra: -19.2494, dec: 30.2212, mag: 2.93, bv: 0.852 },
  { ra: 102.484, dec: -50.6146, mag: 2.94, bv: 1.207 },
  { ra: -172.5339, dec: -16.5154, mag: 2.94, bv: -0.012 },
  { ra: -28.554, dec: -0.3199, mag: 2.95, bv: 0.969 },
  { ra: 59.5074, dec: -13.5085, mag: 2.97, bv: 1.588 },
  { ra: 84.4112, dec: 21.1425, mag: 2.97, bv: -0.148 },
  { ra: 146.4628, dec: 23.7743, mag: 2.97, bv: 0.808 },
  { ra: -88.548, dec: -30.4241, mag: 2.98, bv: 0.981 },
  { ra: -160.2696, dec: -23.1715, mag: 2.99, bv: 0.920 },
  { ra: -93.1038, dec: -40.127, mag: 2.99, bv: 0.509 },
  { ra: -73.6475, dec: 13.8635, mag: 2.99, bv: 0.014 },
  { ra: 32.3859, dec: 34.9873, mag: 3, bv: 0.140 },
  { ra: 167.4159, dec: 44.4985, mag: 3, bv: 1.144 },
  { ra: -129.8179, dec: 71.834, mag: 3, bv: 0.058 },
  { ra: -107.0324, dec: -38.0474, mag: 3, bv: -0.200 },
  { ra: -31.5178, dec: -37.3649, mag: 3, bv: -0.084 },
  { ra: 55.7313, dec: 47.7876, mag: 3.01, bv: -0.125 },
  { ra: 95.0783, dec: -30.0634, mag: 3.02, bv: -0.160 },
  { ra: 105.7561, dec: -23.8333, mag: 3.02, bv: -0.077 },
  { ra: -177.4688, dec: -22.6198, mag: 3.02, bv: 1.326 },
  { ra: 75.4922, dec: 43.8233, mag: 3.03, bv: 0.537 },
  { ra: -168.43, dec: -68.1081, mag: 3.04, bv: -0.178 },
  { ra: -141.9805, dec: 38.3083, mag: 3.04, bv: 0.191 },
  { ra: -67.3197, dec: 27.9597, mag: 3.05, bv: 1.088 },
  { ra: -54.7472, dec: -14.7814, mag: 3.05, bv: 0.790 },
  { ra: 100.983, dec: 25.1311, mag: 3.06, bv: 1.377 },
  { ra: 155.5823, dec: 41.4995, mag: 3.06, bv: 1.603 },
  { ra: -71.8612, dec: 67.6615, mag: 3.07, bv: 0.990 },
  { ra: -85.5932, dec: -36.7617, mag: 3.1, bv: 1.582 },
  { ra: 133.8484, dec: 5.9456, mag: 3.11, bv: 0.978 },
  { ra: 162.4062, dec: -16.1936, mag: 3.11, bv: 1.232 },
  { ra: 173.9454, dec: -63.0198, mag: 3.11, bv: -0.044 },
  { ra: -50.6082, dec: -47.2915, mag: 3.11, bv: 0.998 },
  { ra: 87.74, dec: -35.7683, mag: 3.12, bv: 1.146 },
  { ra: 134.8019, dec: 48.0418, mag: 3.12, bv: 0.223 },
  { ra: -105.345, dec: -55.9901, mag: 3.12, bv: 1.552 },
  { ra: -101.242, dec: 24.8392, mag: 3.12, bv: 0.080 },
  { ra: -135.2096, dec: -42.1042, mag: 3.13, bv: -0.208 },
  { ra: 140.2638, dec: 34.3926, mag: 3.14, bv: 1.550 },
];

// Convert B-V color index to star color
function bvToColor(bv: number): string {
  if (bv < -0.2) return '#aaccff';
  if (bv < 0.0) return '#cad8ff';
  if (bv < 0.3) return '#f8f7ff';
  if (bv < 0.6) return '#fff4e8';
  if (bv < 1.0) return '#ffd2a1';
  return '#ffb56c';
}

// Calculate Julian Date
function dateToJD(date: Date): number {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate() + date.getUTCHours() / 24 + date.getUTCMinutes() / 1440;
  let jy = y, jm = m;
  if (m <= 2) { jy = y - 1; jm = m + 12; }
  const a = Math.floor(jy / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (jy + 4716)) + Math.floor(30.6001 * (jm + 1)) + d + b - 1524.5;
}

// Calculate Local Sidereal Time
function calculateLST(date: Date, longitude: number): number {
  const jd = dateToJD(date);
  const t = (jd - 2451545.0) / 36525;
  let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * t * t;
  gmst = gmst % 360;
  if (gmst < 0) gmst += 360;
  let lst = gmst + longitude;
  lst = lst % 360;
  if (lst < 0) lst += 360;
  return lst;
}

// Project star to poster coordinates
function projectStar(ra: number, dec: number, lst: number, width: number, height: number) {
  const raOffset = (ra - lst + 360) % 360;
  const x = (raOffset / 360) * width;
  const y = ((90 - dec) / 180) * height;
  return { x, y };
}

// Moon phase calculation using accurate algorithm
function getMoonPhase(date: Date): { phase: number; illumination: number; name: string; nameEn: string } {
  // Reference new moon: January 6, 2000 at 18:14 UTC
  const knownNewMoon = new Date(Date.UTC(2000, 0, 6, 18, 14, 0));
  const daysSinceKnown = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const lunarCycle = 29.53059;
  let phase = (daysSinceKnown % lunarCycle) / lunarCycle;
  if (phase < 0) phase += 1;

  // Calculate illumination using cosine function
  const illumination = (1 - Math.cos(phase * 2 * Math.PI)) / 2;

  let name = '', nameEn = '';
  if (phase < 0.03 || phase > 0.97) { name = 'Neumond'; nameEn = 'New Moon'; }
  else if (phase < 0.22) { name = 'Zunehmende Sichel'; nameEn = 'Waxing Crescent'; }
  else if (phase < 0.28) { name = 'Erstes Viertel'; nameEn = 'First Quarter'; }
  else if (phase < 0.47) { name = 'Zunehmender Mond'; nameEn = 'Waxing Gibbous'; }
  else if (phase < 0.53) { name = 'Vollmond'; nameEn = 'Full Moon'; }
  else if (phase < 0.72) { name = 'Abnehmender Mond'; nameEn = 'Waning Gibbous'; }
  else if (phase < 0.78) { name = 'Letztes Viertel'; nameEn = 'Last Quarter'; }
  else { name = 'Abnehmende Sichel'; nameEn = 'Waning Crescent'; }

  return { phase, illumination, name, nameEn };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const title = searchParams.get('title') || 'The Night We Met';
    const names = searchParams.get('names') || 'Sarah & Michael';
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const coordinates = searchParams.get('coordinates') || '';
    const tagline = searchParams.get('tagline') || '';
    const style = searchParams.get('style') || 'midnight';
    const lang = searchParams.get('lang') || 'de';
    const scale = parseInt(searchParams.get('scale') || '2');

    const parsedDate = new Date(date);
    const moonData = getMoonPhase(parsedDate);

    // Calculate LST for star positions (using Berlin longitude as default)
    const lst = calculateLST(parsedDate, 13.405);

    // Format date
    const dateLocales: Record<string, string> = { de: 'de-DE', en: 'en-US', fr: 'fr-FR', es: 'es-ES' };
    const formattedDate = parsedDate.toLocaleDateString(dateLocales[lang] || 'en-US', {
      day: '2-digit', month: 'long', year: 'numeric'
    });

    // Color schemes
    const colors: Record<string, { bg1: string; bg2: string; accent: string; text: string; textSecondary: string; textMuted: string }> = {
      midnight: { bg1: '#0a0e1a', bg2: '#040610', accent: '#c9a227', text: '#ffffff', textSecondary: '#9aa8c0', textMuted: '#4a5a70' },
      dark: { bg1: '#0f0f15', bg2: '#050508', accent: '#d4af37', text: '#ffffff', textSecondary: '#b8b8c8', textMuted: '#6a6a7a' },
      blue: { bg1: '#0a1628', bg2: '#050c18', accent: '#7eb8da', text: '#ffffff', textSecondary: '#a0b8d0', textMuted: '#5a7090' },
    };
    const c = colors[style] || colors.midnight;

    // Calculate visible stars for this date
    const visibleStars = BRIGHT_STARS.map((star, index) => {
      const { x, y } = projectStar(star.ra, star.dec, lst, 500, 700);
      const brightnessRatio = Math.pow(2.512, -star.mag);
      const size = Math.max(0.3, Math.min(1.5, brightnessRatio * 12));
      const opacity = Math.max(0.1, Math.min(0.5, brightnessRatio * 3));
      const variation = (Math.sin(index * 12.9898 + 78.233) * 43758.5453) % 1 * 0.2;
      return { x, y, size: size * (1 + variation), opacity, color: bvToColor(star.bv) };
    });

    // Moon phase shadow calculation
    const isWaxing = moonData.phase < 0.5;
    const illumination = moonData.illumination;
    const isCrescent = illumination < 0.5;
    const terminatorRx = Math.abs(Math.cos(illumination * Math.PI)) * 50;

    // Build SVG path for moon shadow
    let shadowPath = '';
    if (illumination < 0.98) {
      if (illumination < 0.08) {
        shadowPath = 'M 50,0 A 50,50 0 1,1 50,100 A 50,50 0 1,1 50,0 Z';
      } else if (isCrescent) {
        if (isWaxing) {
          shadowPath = `M 50,0 A 50,50 0 1,0 50,100 A ${Math.max(0.1, terminatorRx)},50 0 0,0 50,0 Z`;
        } else {
          shadowPath = `M 50,0 A 50,50 0 1,1 50,100 A ${Math.max(0.1, terminatorRx)},50 0 0,1 50,0 Z`;
        }
      } else {
        if (isWaxing) {
          shadowPath = `M 50,0 A 50,50 0 0,0 50,100 A ${Math.max(0.1, terminatorRx)},50 0 0,1 50,0 Z`;
        } else {
          shadowPath = `M 50,0 A 50,50 0 0,1 50,100 A ${Math.max(0.1, terminatorRx)},50 0 0,0 50,0 Z`;
        }
      }
    }

    // Moon rotation based on date (simulates libration)
    const dayOfYear = Math.floor((parsedDate.getTime() - new Date(parsedDate.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const moonRotation = (dayOfYear * 0.5) % 360;

    const phaseName = lang === 'de' ? moonData.name : moonData.nameEn;
    const width = 500 * scale;
    const height = 700 * scale;

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            background: `radial-gradient(ellipse at 50% 35%, ${c.bg1} 0%, ${c.bg2} 100%)`,
            fontFamily: 'Georgia, Times New Roman, serif',
            position: 'relative',
          }}
        >
          {/* Real astronomical stars based on date */}
          {visibleStars.map((star, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${(star.x / 500) * 100}%`,
                top: `${(star.y / 700) * 100}%`,
                width: star.size * scale,
                height: star.size * scale,
                borderRadius: '50%',
                background: star.color,
                opacity: star.opacity,
              }}
            />
          ))}

          {/* Moon container - rotated 25 degrees like original */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '38%',
              transform: 'translate(-50%, -50%) rotate(25deg)',
              width: '75%',
              maxWidth: 375 * scale,
              aspectRatio: '1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Moon texture with rotation based on date */}
            <img
              src="https://www.lumeries.com/moon-texture.jpg"
              width={375 * scale}
              height={375 * scale}
              style={{
                borderRadius: '50%',
                transform: `rotate(${moonRotation}deg)`,
                filter: 'brightness(0.85) contrast(1.15) saturate(0.75)',
              }}
            />

            {/* 3D lighting overlay */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.05) 0%, transparent 25%, rgba(0,0,0,0.2) 55%, rgba(0,0,0,0.55) 80%, rgba(0,0,0,0.75) 100%)',
              }}
            />

            {/* Moon phase shadow */}
            {shadowPath && (
              <svg
                viewBox="0 0 100 100"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                }}
              >
                <defs>
                  <clipPath id="moonClip">
                    <circle cx="50" cy="50" r="50" />
                  </clipPath>
                  <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
                  </filter>
                </defs>
                <g clipPath="url(#moonClip)">
                  <path d={shadowPath} fill="rgba(0,0,0,0.65)" />
                  <path d={shadowPath} fill="rgba(0,0,0,0.65)" filter="url(#blur)" />
                </g>
              </svg>
            )}
          </div>

          {/* Text content */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              bottom: `${8 * scale}%`,
              width: '85%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            {/* Title */}
            <div
              style={{
                color: c.text,
                fontSize: 12 * scale,
                fontWeight: 300,
                letterSpacing: 3 * scale,
                marginBottom: 10 * scale,
                textTransform: 'uppercase',
                fontFamily: 'Helvetica, Arial, sans-serif',
              }}
            >
              {title}
            </div>

            {/* Names */}
            <div
              style={{
                color: c.accent,
                fontSize: 16 * scale,
                letterSpacing: 1 * scale,
                marginBottom: 10 * scale,
                fontStyle: 'italic',
              }}
            >
              {names}
            </div>

            {/* Date */}
            <div
              style={{
                color: c.textSecondary,
                fontSize: 9 * scale,
                letterSpacing: 2 * scale,
                marginBottom: 4 * scale,
                fontFamily: 'Helvetica, Arial, sans-serif',
                fontWeight: 300,
                textTransform: 'uppercase',
              }}
            >
              {formattedDate}
            </div>

            {/* Coordinates */}
            {coordinates && (
              <div
                style={{
                  color: c.textMuted,
                  fontSize: 8 * scale,
                  letterSpacing: 1.5 * scale,
                  marginBottom: 8 * scale,
                  fontFamily: 'Monaco, Consolas, monospace',
                }}
              >
                {coordinates}
              </div>
            )}

            {/* Tagline */}
            {tagline && (
              <div
                style={{
                  color: c.textMuted,
                  fontSize: 7 * scale,
                  letterSpacing: 2 * scale,
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  textTransform: 'uppercase',
                }}
              >
                {tagline}
              </div>
            )}
          </div>

          {/* Moon phase name */}
          <div
            style={{
              position: 'absolute',
              bottom: `${3 * scale}%`,
              color: c.textMuted,
              fontSize: 6 * scale,
              letterSpacing: 1 * scale,
              opacity: 0.5,
              fontFamily: 'Helvetica, Arial, sans-serif',
            }}
          >
            {phaseName}
          </div>
        </div>
      ),
      { width, height }
    );
  } catch (error) {
    console.error('Error generating moon poster image:', error);
    return new Response('Error generating image', { status: 500 });
  }
}
