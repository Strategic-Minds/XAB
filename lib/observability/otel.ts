/**
 * OpenTelemetry SDK initialization — call once at app startup
 * Exports traces to OTLP endpoint (Grafana/Jaeger/Honeycomb compatible)
 */

export function initOTel(): void {
  if (typeof window !== 'undefined') return // client-side skip
  if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
    // Defer import to avoid edge runtime issues
    import('@opentelemetry/sdk-node').then(({ NodeSDK }) => {
      import('@opentelemetry/resources').then(({ Resource }) => {
        import('@opentelemetry/semantic-conventions').then(({ SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_VERSION }) => {
          const sdk = new NodeSDK({
            resource: new Resource({
              [SEMRESATTRS_SERVICE_NAME]: 'xab-system',
              [SEMRESATTRS_SERVICE_VERSION]: process.env.NEXT_PUBLIC_APP_VERSION ?? '1.0.0',
            }),
          })
          sdk.start()
          process.on('SIGTERM', () => sdk.shutdown())
        })
      })
    }).catch(() => { /* OTel not critical */ })
  }
}
