import dotenv from 'dotenv';

dotenv.config();

export const config = {
  dashboard: {
    port: parseInt(process.env.DASHBOARD_PORT || '3002'),
  }
};