/**
 * Types for the Kingfisher REST API. Field names mirror the API's JSON response
 * shapes (snake_case as the gateway emits them).
 */

/** proto3 `google.protobuf.Timestamp` serializes to an RFC3339 string over the gateway. */
export type Timestamp = string;

/** proto3 `google.protobuf.Any` serializes with a `@type` discriminator plus its own fields. */
export interface ProtobufAny {
  "@type"?: string;
  [key: string]: unknown;
}

/** Error envelope returned by the Kingfisher API. */
export interface KingfisherError {
  code?: number;
  message?: string;
  status?: number;
  data?: ProtobufAny[];
}

/** Every RPC response wraps its payload as `{ result?, error? }`. */
export interface KingfisherEnvelope<T> {
  result?: T;
  error?: KingfisherError;
}

// ---------------------------------------------------------------------------
// References / identity
// ---------------------------------------------------------------------------

export interface UserReference {
  org: string;
  user: string;
}

export interface DeviceReference {
  org: string;
  device: string;
}

export interface OrgReference {
  org: string;
}

/** Best-guess shape. */
export interface GroupReference {
  org: string;
  group: string;
}

/** OwnerReference — a proto `oneof`, so at most one key is present in JSON. */
export interface OwnerReference {
  user?: UserReference;
  org?: OrgReference;
  group?: GroupReference;
}

// ---------------------------------------------------------------------------
// Device data
// ---------------------------------------------------------------------------

export interface DeviceFlags {
  is_rack?: boolean;
  has_video?: boolean;
  has_power?: boolean;
}

export interface DeviceFeature {
  name: string;
  enabled: boolean;
  effective_immediate?: boolean;
  config?: Record<string, string>;
}

export interface DeviceReservation {
  user?: UserReference;
  expires?: Timestamp;
  reservation_secret?: string;
}

/** The physical device record (populated on verbose reads). */
export interface Device {
  device_id: string;
  device_type?: string;
  device_model?: string;
  ecm_mac?: string;
  estb_mac?: string;
  status?: string;
  billing_status?: string;
  serial_number?: string;
  receiver_id?: string;
  friendly_name?: string;
  added_date?: Timestamp;
  updated_date?: Timestamp;
  moca_mac?: string;
  service_account_id?: string;
  wifi_mac?: string;
  ethernet_mac?: string;
  estb_ip?: string;
  other_properties?: Record<string, string>;
}

/** Rack/lab wiring info (populated only when `include_rack_data` is set). */
export interface RackData {
  ir_blaster_type?: string;
  ir_service_port?: string;
  ir_service_url?: string;
  rack_name?: string;
  slot_name?: string;
  video_camera?: string;
  video_source_url?: string;
  device_make?: string;
  power_service_url?: string;
  /** @deprecated use `power_outlet_address` */
  power_outlet?: number;
  serial_service_url?: string;
  power_outlet_address?: string;
}

/** DeviceMetadata — also returned directly by Lock/Unlock. */
export interface DeviceMetadata {
  name: string;
  labels?: Record<string, string>;
  reservation?: DeviceReservation;
  owner?: OwnerReference;
  features?: DeviceFeature[];
}

/** DeviceData — the element type of the device-list responses. `device`/`rackdata` are only populated on verbose / rack-data reads. */
export interface DeviceData {
  reference: DeviceReference;
  metadata: DeviceMetadata;
  device?: Device;
  rackdata?: RackData;
  device_flags?: DeviceFlags;
}

// ---------------------------------------------------------------------------
// CheckAlive
// ---------------------------------------------------------------------------

export interface AliveStatus {
  live?: boolean;
  locked?: boolean;
  locked_by?: UserReference;
  power_on?: boolean;
}

// ---------------------------------------------------------------------------
// LaunchApp — AppConfig and its sub-configs
// ---------------------------------------------------------------------------

export interface PlayerDimensions {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface ExitParamsConfig {
  url?: string;
  headers?: Record<string, string>;
  controller_type?: string;
  mime_type?: string;
  launch_once_id?: string;
  deeplink?: string;
  enable_prompt?: boolean;
}

/** Not surfaced; deep request-only leaf. */
export interface QuickLaunchTemplatePageConfig {
  [key: string]: unknown;
}

export interface QuickLaunchTemplateConfig {
  background_image_url?: string;
  transition_time_in_ms?: number;
  enable_rotation?: boolean;
  rotation_start_index?: number;
  pages?: QuickLaunchTemplatePageConfig[];
  content_url?: string;
  enabled_in_app?: boolean;
  minimum_visible_time_in_ms?: number;
  maximum_visible_time_in_ms?: number;
}

export interface UrlComponents {
  protocol?: string;
  host?: string;
  port?: number;
  path?: string;
  query?: Record<string, string>;
  fragment?: string;
}

export interface XscdConfig {
  duration_seconds?: number;
}

export interface AppConfig {
  app_name?: string;
  mute_player?: boolean;
  forward_player_keys?: boolean;
  player_config?: PlayerDimensions;
  page_timeout?: number;
  cookie_mode?: string;
  app_cookie_key?: string;
  exit_params?: ExitParamsConfig;
  splash_screen?: QuickLaunchTemplateConfig;
  url?: string;
  url_components?: UrlComponents;
  controller_type?: string;
  use_background?: boolean;
  /** @deprecated */
  enable_proxy?: boolean;
  load_money_badger?: boolean;
  enable_haxee?: boolean;
  use_web_filter?: boolean;
  template_data?: string;
  ua_template?: string;
  enable_cloud_cookie?: boolean;
  mime_type?: string;
  xscd?: XscdConfig;
  headers?: Record<string, string>;
  template_data_request_headers?: Record<string, string>;
  enable_console_logging?: boolean;
  account_link_partner_id?: string;
  use_app_specific_token?: boolean;
  template_data_content_url?: string;
  set_box_shadow?: boolean;
  local_storage_enabled?: boolean;
  mock_emails?: string[];
  use_mock_emails?: boolean;
  thor_token_mode?: string;
  non_composited_web_g_l_enabled?: boolean;
  /** proto `int64` — serialized as a string over the gateway. */
  cloud_cookies_throttling_interval?: string;
  cookie_x1_app_id?: string;
  cookie_accept_policy?: string;
  site_id?: string;
  proxy?: string;
}

export interface LaunchAppOutput {
  deeplink?: string;
  app_url?: string;
}

/** proto `bytes image` — serialized as a base64 string over the gateway. */
export interface ScreenshotOutput {
  image?: string;
}

// ---------------------------------------------------------------------------
// Request inputs (path fields org/device_id are passed separately, not here)
// ---------------------------------------------------------------------------

/** OwnerSpec — a `oneof`; set exactly one of `user`/`group`. Omit to act as the API key's own identity. */
export interface OwnerSpec {
  user?: string;
  group?: string;
}

export interface GetDevicesQuery {
  verbose?: boolean;
  include_rack_data?: boolean;
}

export interface GetDeviceQuery {
  include_rack_data?: boolean;
  owner?: OwnerSpec;
}

export interface QueryDevicesQuery {
  verbose?: boolean;
  include_rack_data?: boolean;
  query?: string;
  filter?: Record<string, string>;
}

export interface CheckAliveQuery {
  owner?: OwnerSpec;
}

export interface LaunchAppBody {
  reservation_secret?: string;
  enable_debug_mode?: boolean;
  additional_params?: Record<string, string>;
  additional_params_json?: Record<string, string>;
  disable_voice_out?: boolean;
  voice_guidance_mode?: string;
  not_stackable?: boolean;
  dry_run?: boolean;
  app_config?: AppConfig;
  enable_screensaver?: boolean;
  scene_name?: string;
  owner?: OwnerSpec;
  // deprecated chariot_params intentionally omitted
}

export interface LockDeviceBody {
  duration_seconds?: number;
  reservation_secret?: string;
  owner?: OwnerSpec;
}

export interface UnlockDeviceBody {
  reservation_secret?: string;
  owner?: OwnerSpec;
}

export interface PressKeyBody {
  key: string;
  reservation_secret?: string;
  owner?: OwnerSpec;
}
