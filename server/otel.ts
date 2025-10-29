import { NodeSDK, type NodeSDKConfiguration } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

const serviceName = process.env.OTEL_SERVICE_NAME || 'docss-server';
const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318';

const traceExporter = new OTLPTraceExporter({ url: `${otlpEndpoint}/v1/traces` });
const metricExporter = new OTLPMetricExporter({ url: `${otlpEndpoint}/v1/metrics` });

let sdk: NodeSDK | undefined;

try {
  const metricReader = new PeriodicExportingMetricReader({ 
    exporter: metricExporter,
    exportIntervalMillis: 60000,
  });

  sdk = new NodeSDK({
    resource: new Resource({
      [ATTR_SERVICE_NAME]: serviceName,
      'deployment.environment': process.env.NODE_ENV || 'development',
    }),
    traceExporter,
    metricReader: metricReader as any, // Type compatibility issue between OTEL SDK versions
    instrumentations: [getNodeAutoInstrumentations()],
  });

  try {
    sdk.start();
    console.log('OpenTelemetry SDK started successfully');
  } catch (startErr) {
    console.error('Failed to start OpenTelemetry SDK', startErr);
  }
} catch (err) {
  console.warn('OpenTelemetry SDK initialization failed, continuing without monitoring:', err);
}

process.on('SIGTERM', () => {
  sdk?.shutdown().finally(() => process.exit(0));
});

process.on('SIGINT', () => {
  sdk?.shutdown().finally(() => process.exit(0));
});


