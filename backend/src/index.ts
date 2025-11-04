import app from './app';
import { config } from './types/config';

const PORT = config.port;
const HOST = '0.0.0.0'; // Bind to all interfaces (required by many PaaS providers like Render)

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`📱 Environment: ${config.nodeEnv}`);
  console.log(`🏠 App: ${config.appName}`);
});

