import { z } from 'zod'

// Schema for path configuration form - validates user input
// Note: name is required for the form but optional in PathConf interface
export const PathConfigSchema = z.object({
  // Basic Settings
  name: z.string().min(1, 'Path name is required'),
  source: z.string().optional(),
  sourceFingerprint: z.string().optional(),
  sourceOnDemand: z.boolean().optional(),
  sourceOnDemandStartTimeout: z.string().optional(),
  sourceOnDemandCloseAfter: z.string().optional(),
  maxReaders: z.coerce.number().optional(),
  sourceRedirect: z.string().optional(),
  fallback: z.string().optional(),

  // Recording Settings
  record: z.boolean().optional(),

  // Authentication Settings
  publishUser: z.string().optional(),
  publishPass: z.string().optional(),
  publishIPs: z.array(z.string()).optional(),
  readUser: z.string().optional(),
  readPass: z.string().optional(),
  readIPs: z.array(z.string()).optional(),
  overridePublisher: z.boolean().optional(),

  // SRT Settings
  srtReadPassphrase: z.string().optional(),
  srtPublishPassphrase: z.string().optional(),

  // RTSP Settings
  rtspTransport: z.string().optional(),
  rtspAnyPort: z.boolean().optional(),
  rtspRangeType: z.string().optional(),
  rtspRangeStart: z.string().optional(),

  // Raspberry Pi Camera Settings
  rpiCameraCamID: z.coerce.number().optional(),
  rpiCameraWidth: z.coerce.number().optional(),
  rpiCameraHeight: z.coerce.number().optional(),
  rpiCameraHFlip: z.boolean().optional(),
  rpiCameraVFlip: z.boolean().optional(),
  rpiCameraBrightness: z.coerce.number().optional(),
  rpiCameraContrast: z.coerce.number().optional(),
  rpiCameraSaturation: z.coerce.number().optional(),
  rpiCameraSharpness: z.coerce.number().optional(),
  rpiCameraExposure: z.string().optional(),
  rpiCameraAWB: z.string().optional(),
  rpiCameraDenoise: z.string().optional(),
  rpiCameraShutter: z.coerce.number().optional(),
  rpiCameraMetering: z.string().optional(),
  rpiCameraGain: z.coerce.number().optional(),
  rpiCameraEV: z.coerce.number().optional(),
  rpiCameraROI: z.string().optional(),
  rpiCameraHDR: z.boolean().optional(),
  rpiCameraTuningFile: z.string().optional(),
  rpiCameraMode: z.string().optional(),
  rpiCameraFPS: z.coerce.number().optional(),
  rpiCameraIDRPeriod: z.coerce.number().optional(),
  rpiCameraBitrate: z.coerce.number().optional(),
  rpiCameraProfile: z.string().optional(),
  rpiCameraLevel: z.string().optional(),
  rpiCameraAfMode: z.string().optional(),
  rpiCameraAfRange: z.string().optional(),
  rpiCameraAfSpeed: z.string().optional(),
  rpiCameraLensPosition: z.coerce.number().optional(),
  rpiCameraAfWindow: z.string().optional(),
  rpiCameraTextOverlayEnable: z.boolean().optional(),
  rpiCameraTextOverlay: z.string().optional(),

  // Run On Commands
  runOnInit: z.string().optional(),
  runOnInitRestart: z.boolean().optional(),
  runOnDemand: z.string().optional(),
  runOnDemandRestart: z.boolean().optional(),
  runOnDemandStartTimeout: z.string().optional(),
  runOnDemandCloseAfter: z.string().optional(),
  runOnUnDemand: z.string().optional(),
  runOnReady: z.string().optional(),
  runOnReadyRestart: z.boolean().optional(),
  runOnNotReady: z.string().optional(),
  runOnRead: z.string().optional(),
  runOnReadRestart: z.boolean().optional(),
  runOnUnread: z.string().optional(),
  runOnRecordSegmentCreate: z.string().optional(),
  runOnRecordSegmentComplete: z.string().optional(),
})

export type PathConfigFormData = z.infer<typeof PathConfigSchema>
