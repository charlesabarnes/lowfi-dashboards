import dotenv from 'dotenv';

dotenv.config();

export const config = {
  dashboard: {
    port: parseInt(process.env.DASHBOARD_PORT || '3792'),
  },
  live: {
    rotationInterval: parseInt(process.env.LIVE_ROTATION_INTERVAL || '30000'),
    autoRotate: process.env.LIVE_AUTO_ROTATE !== 'false',
    transitionDuration: parseInt(process.env.LIVE_TRANSITION_DURATION || '500'),
    dashboardOrder: process.env.LIVE_DASHBOARD_ORDER
      ? process.env.LIVE_DASHBOARD_ORDER.split(',').map(s => s.trim())
      : []
  }
};