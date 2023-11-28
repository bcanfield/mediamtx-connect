/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface Error {
  error?: string;
}

export interface GlobalConf {
  logLevel?: string;
  logDestinations?: string[];
  logFile?: string;
  readTimeout?: string;
  writeTimeout?: string;
  writeQueueSize?: number;
  udpMaxPayloadSize?: number;
  externalAuthenticationURL?: string;
  api?: boolean;
  apiAddress?: string;
  metrics?: boolean;
  metricsAddress?: string;
  pprof?: boolean;
  pprofAddress?: string;
  runOnConnect?: string;
  runOnConnectRestart?: boolean;
  runOnDisconnect?: string;
  rtsp?: boolean;
  protocols?: string[];
  encryption?: string;
  rtspAddress?: string;
  rtspsAddress?: string;
  rtpAddress?: string;
  rtcpAddress?: string;
  multicastIPRange?: string;
  multicastRTPPort?: number;
  multicastRTCPPort?: number;
  serverKey?: string;
  serverCert?: string;
  authMethods?: string[];
  rtmp?: boolean;
  rtmpAddress?: string;
  rtmpEncryption?: string;
  rtmpsAddress?: string;
  rtmpServerKey?: string;
  rtmpServerCert?: string;
  hls?: boolean;
  hlsAddress?: string;
  hlsEncryption?: boolean;
  hlsServerKey?: string;
  hlsServerCert?: string;
  hlsAlwaysRemux?: boolean;
  hlsVariant?: string;
  hlsSegmentCount?: number;
  hlsSegmentDuration?: string;
  hlsPartDuration?: string;
  hlsSegmentMaxSize?: string;
  hlsAllowOrigin?: string;
  hlsTrustedProxies?: string[];
  hlsDirectory?: string;
  webrtc?: boolean;
  webrtcAddress?: string;
  webrtcEncryption?: boolean;
  webrtcServerKey?: string;
  webrtcServerCert?: string;
  webrtcAllowOrigin?: string;
  webrtcTrustedProxies?: string[];
  webrtcLocalUDPAddress?: string;
  webrtcLocalTCPAddress?: string;
  webrtcIPsFromInterfaces?: boolean;
  webrtcIPsFromInterfacesList?: string[];
  webrtcAdditionalHosts?: string[];
  webrtcICEServers2?: {
    url?: string;
    username?: string;
    password?: string;
  }[];
  srt?: boolean;
  srtAddress?: string;
  record?: boolean;
  recordPath?: string;
  recordFormat?: string;
  recordPartDuration?: string;
  recordSegmentDuration?: string;
  recordDeleteAfter?: string;
}

export interface PathConf {
  name?: string;
  source?: string;
  sourceFingerprint?: string;
  sourceOnDemand?: boolean;
  sourceOnDemandStartTimeout?: string;
  sourceOnDemandCloseAfter?: string;
  maxReaders?: number;
  srtReadPassphrase?: string;
  record?: boolean;
  publishUser?: string;
  publishPass?: string;
  publishIPs?: string[];
  readUser?: string;
  readPass?: string;
  readIPs?: string[];
  overridePublisher?: boolean;
  fallback?: string;
  srtPublishPassphrase?: string;
  rtspTransport?: string;
  rtspAnyPort?: boolean;
  rtspRangeType?: string;
  rtspRangeStart?: string;
  sourceRedirect?: string;
  rpiCameraCamID?: number;
  rpiCameraWidth?: number;
  rpiCameraHeight?: number;
  rpiCameraHFlip?: boolean;
  rpiCameraVFlip?: boolean;
  rpiCameraBrightness?: number;
  rpiCameraContrast?: number;
  rpiCameraSaturation?: number;
  rpiCameraSharpness?: number;
  rpiCameraExposure?: string;
  rpiCameraAWB?: string;
  rpiCameraDenoise?: string;
  rpiCameraShutter?: number;
  rpiCameraMetering?: string;
  rpiCameraGain?: number;
  rpiCameraEV?: number;
  rpiCameraROI?: string;
  rpiCameraHDR?: boolean;
  rpiCameraTuningFile?: string;
  rpiCameraMode?: string;
  rpiCameraFPS?: number;
  rpiCameraIDRPeriod?: number;
  rpiCameraBitrate?: number;
  rpiCameraProfile?: string;
  rpiCameraLevel?: string;
  rpiCameraAfMode?: string;
  rpiCameraAfRange?: string;
  rpiCameraAfSpeed?: string;
  rpiCameraLensPosition?: number;
  rpiCameraAfWindow?: string;
  rpiCameraTextOverlayEnable?: boolean;
  rpiCameraTextOverlay?: string;
  runOnInit?: string;
  runOnInitRestart?: boolean;
  runOnDemand?: string;
  runOnDemandRestart?: boolean;
  runOnDemandStartTimeout?: string;
  runOnDemandCloseAfter?: string;
  runOnUnDemand?: string;
  runOnReady?: string;
  runOnReadyRestart?: boolean;
  runOnNotReady?: string;
  runOnRead?: string;
  runOnReadRestart?: boolean;
  runOnUnread?: string;
  runOnRecordSegmentCreate?: string;
  runOnRecordSegmentComplete?: string;
}

export interface PathConfList {
  pageCount?: number;
  items?: PathConf[];
}

export interface Path {
  name?: string;
  confName?: string;
  source?: PathSource | null;
  ready?: boolean;
  readyTime?: string | null;
  tracks?: string[];
  /** @format int64 */
  bytesReceived?: number;
  /** @format int64 */
  bytesSent?: number;
  readers?: PathReader[];
}

export interface PathList {
  pageCount?: number;
  items?: Path[];
}

export interface PathSource {
  type?:
    | "hlsSource"
    | "redirect"
    | "rpiCameraSource"
    | "rtmpConn"
    | "rtmpSource"
    | "rtspSession"
    | "rtspSource"
    | "rtspsSession"
    | "srtConn"
    | "srtSource"
    | "udpSource"
    | "webRTCSession"
    | "webRTCSource";
  id?: string;
}

export interface PathReader {
  type?: "hlsMuxer" | "rtmpConn" | "rtspSession" | "rtspsSession" | "srtConn" | "webRTCSession";
  id?: string;
}

export interface HLSMuxer {
  path?: string;
  created?: string;
  lastRequest?: string;
  /** @format int64 */
  bytesSent?: number;
}

export interface HLSMuxerList {
  pageCount?: number;
  items?: HLSMuxer[];
}

export interface RTMPConn {
  id?: string;
  created?: string;
  remoteAddr?: string;
  state?: "idle" | "read" | "publish";
  path?: string;
  /** @format int64 */
  bytesReceived?: number;
  /** @format int64 */
  bytesSent?: number;
}

export interface RTMPConnList {
  pageCount?: number;
  items?: RTMPConn[];
}

export interface RTSPConn {
  id?: string;
  created?: string;
  remoteAddr?: string;
  /** @format int64 */
  bytesReceived?: number;
  /** @format int64 */
  bytesSent?: number;
}

export interface RTSPConnList {
  pageCount?: number;
  items?: RTSPConn[];
}

export interface RTSPSession {
  id?: string;
  created?: string;
  remoteAddr?: string;
  state?: "idle" | "read" | "publish";
  path?: string;
  transport?: string | null;
  /** @format int64 */
  bytesReceived?: number;
  /** @format int64 */
  bytesSent?: number;
}

export interface RTSPSessionList {
  pageCount?: number;
  items?: RTSPSession[];
}

export interface SRTConn {
  id?: string;
  created?: string;
  remoteAddr?: string;
  state?: "idle" | "read" | "publish";
  path?: string;
  /** @format int64 */
  bytesReceived?: number;
  /** @format int64 */
  bytesSent?: number;
}

export interface SRTConnList {
  pageCount?: number;
  items?: SRTConn[];
}

export interface WebRTCSession {
  id?: string;
  created?: string;
  remoteAddr?: string;
  peerConnectionEstablished?: boolean;
  localCandidate?: string;
  remoteCandidate?: string;
  state?: "read" | "publish";
  path?: string;
  /** @format int64 */
  bytesReceived?: number;
  /** @format int64 */
  bytesSent?: number;
}

export interface WebRTCSessionList {
  pageCount?: number;
  items?: WebRTCSession[];
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (securityData: SecurityDataType | null) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "http://localhost:9997";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter((key) => "undefined" !== typeof query[key]);
    return keys
      .map((key) => (Array.isArray(query[key]) ? this.addArrayQueryParam(query, key) : this.addQueryParam(query, key)))
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string") ? JSON.stringify(input) : input,
    [ContentType.Text]: (input: any) => (input !== null && typeof input !== "string" ? JSON.stringify(input) : input),
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
            ? JSON.stringify(property)
            : `${property}`,
        );
        return formData;
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(`${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`, {
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type && type !== ContentType.FormData ? { "Content-Type": type } : {}),
      },
      signal: (cancelToken ? this.createAbortSignal(cancelToken) : requestParams.signal) || null,
      body: typeof body === "undefined" || body === null ? null : payloadFormatter(body),
    }).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title MediaMTX API
 * @version 1.0.0
 * @license MIT (https://opensource.org/licenses/MIT)
 * @baseUrl http://localhost:9997
 *
 * API of MediaMTX, a server and proxy that supports various protocols.
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  v3 = {
    /**
     * No description
     *
     * @name ConfigGlobalGet
     * @summary returns the global configuration.
     * @request GET:/v3/config/global/get
     */
    configGlobalGet: (params: RequestParams = {}) =>
      this.request<GlobalConf, Error>({
        path: `/v3/config/global/get`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description all fields are optional.
     *
     * @name ConfigGlobalSet
     * @summary patches the global configuration.
     * @request PATCH:/v3/config/global/patch
     */
    configGlobalSet: (data: GlobalConf, params: RequestParams = {}) =>
      this.request<void, Error>({
        path: `/v3/config/global/patch`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @name ConfigPathDefaultsGet
     * @summary returns the default path configuration.
     * @request GET:/v3/config/pathdefaults/get
     */
    configPathDefaultsGet: (params: RequestParams = {}) =>
      this.request<PathConf, Error>({
        path: `/v3/config/pathdefaults/get`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description all fields are optional.
     *
     * @name ConfigPathDefaultsPatch
     * @summary patches the default path configuration.
     * @request PATCH:/v3/config/pathdefaults/patch
     */
    configPathDefaultsPatch: (data: PathConf, params: RequestParams = {}) =>
      this.request<void, Error>({
        path: `/v3/config/pathdefaults/patch`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @name ConfigPathsList
     * @summary returns all path configurations.
     * @request GET:/v3/config/paths/list
     */
    configPathsList: (
      query?: {
        /**
         * page number.
         * @default 0
         */
        page?: number;
        /**
         * items per page.
         * @default 100
         */
        itemsPerPage?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<PathConfList, Error>({
        path: `/v3/config/paths/list`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name ConfigPathsGet
     * @summary returns a path configuration.
     * @request GET:/v3/config/paths/get/{name}
     */
    configPathsGet: (name: string, params: RequestParams = {}) =>
      this.request<PathConf, Error>({
        path: `/v3/config/paths/get/${name}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description all fields are optional.
     *
     * @name ConfigPathsAdd
     * @summary adds a path configuration.
     * @request POST:/v3/config/paths/add/{name}
     */
    configPathsAdd: (name: string, data: PathConf, params: RequestParams = {}) =>
      this.request<void, Error>({
        path: `/v3/config/paths/add/${name}`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description all fields are optional.
     *
     * @name ConfigPathsPatch
     * @summary patches a path configuration.
     * @request PATCH:/v3/config/paths/patch/{name}
     */
    configPathsPatch: (name: string, data: PathConf, params: RequestParams = {}) =>
      this.request<void, Error>({
        path: `/v3/config/paths/patch/${name}`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description all fields are optional.
     *
     * @name ConfigPathsReplace
     * @summary replaces all values of a path configuration.
     * @request POST:/v3/config/paths/replace/{name}
     */
    configPathsReplace: (name: string, data: PathConf, params: RequestParams = {}) =>
      this.request<void, Error>({
        path: `/v3/config/paths/replace/${name}`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @name ConfigPathsDelete
     * @summary removes a path configuration.
     * @request DELETE:/v3/config/paths/delete/{name}
     */
    configPathsDelete: (name: string, params: RequestParams = {}) =>
      this.request<void, Error>({
        path: `/v3/config/paths/delete/${name}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * No description
     *
     * @name HlsMuxersList
     * @summary returns all HLS muxers.
     * @request GET:/v3/hlsmuxers/list
     */
    hlsMuxersList: (
      query?: {
        /**
         * page number.
         * @default 0
         */
        page?: number;
        /**
         * items per page.
         * @default 100
         */
        itemsPerPage?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<HLSMuxerList, Error>({
        path: `/v3/hlsmuxers/list`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name HlsMuxersGet
     * @summary returns a HLS muxer.
     * @request GET:/v3/hlsmuxers/get/{name}
     */
    hlsMuxersGet: (name: string, params: RequestParams = {}) =>
      this.request<HLSMuxer, Error>({
        path: `/v3/hlsmuxers/get/${name}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name PathsList
     * @summary returns all paths.
     * @request GET:/v3/paths/list
     */
    pathsList: (
      query?: {
        /**
         * page number.
         * @default 0
         */
        page?: number;
        /**
         * items per page.
         * @default 100
         */
        itemsPerPage?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<PathList, Error>({
        path: `/v3/paths/list`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name PathsGet
     * @summary returns a path.
     * @request GET:/v3/paths/get/{name}
     */
    pathsGet: (name: string, params: RequestParams = {}) =>
      this.request<Path, Error>({
        path: `/v3/paths/get/${name}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name RtspConnsList
     * @summary returns all RTSP connections.
     * @request GET:/v3/rtspconns/list
     */
    rtspConnsList: (
      query?: {
        /**
         * page number.
         * @default 0
         */
        page?: number;
        /**
         * items per page.
         * @default 100
         */
        itemsPerPage?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<RTSPConnList, Error>({
        path: `/v3/rtspconns/list`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name RtspConnsGet
     * @summary returns a RTSP connection.
     * @request GET:/v3/rtspconns/get/{id}
     */
    rtspConnsGet: (id: string, params: RequestParams = {}) =>
      this.request<RTSPConn, Error>({
        path: `/v3/rtspconns/get/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name RtspSessionsList
     * @summary returns all RTSP sessions.
     * @request GET:/v3/rtspsessions/list
     */
    rtspSessionsList: (
      query?: {
        /**
         * page number.
         * @default 0
         */
        page?: number;
        /**
         * items per page.
         * @default 100
         */
        itemsPerPage?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<RTSPSessionList, Error>({
        path: `/v3/rtspsessions/list`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name RtspSessionsGet
     * @summary returns a RTSP session.
     * @request GET:/v3/rtspsessions/get/{id}
     */
    rtspSessionsGet: (id: string, params: RequestParams = {}) =>
      this.request<RTSPSession, Error>({
        path: `/v3/rtspsessions/get/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name RtspSessionsKick
     * @summary kicks out a RTSP session from the server.
     * @request POST:/v3/rtspsessions/kick/{id}
     */
    rtspSessionsKick: (id: string, params: RequestParams = {}) =>
      this.request<void, Error>({
        path: `/v3/rtspsessions/kick/${id}`,
        method: "POST",
        ...params,
      }),

    /**
     * No description
     *
     * @name RtspsConnsList
     * @summary returns all RTSPS connections.
     * @request GET:/v3/rtspsconns/list
     */
    rtspsConnsList: (
      query?: {
        /**
         * page number.
         * @default 0
         */
        page?: number;
        /**
         * items per page.
         * @default 100
         */
        itemsPerPage?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<RTSPConnList, Error>({
        path: `/v3/rtspsconns/list`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name RtspsConnsGet
     * @summary returns a RTSPS connection.
     * @request GET:/v3/rtspsconns/get/{id}
     */
    rtspsConnsGet: (id: string, params: RequestParams = {}) =>
      this.request<RTSPConn, Error>({
        path: `/v3/rtspsconns/get/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name RtspsSessionsList
     * @summary returns all RTSPS sessions.
     * @request GET:/v3/rtspssessions/list
     */
    rtspsSessionsList: (
      query?: {
        /**
         * page number.
         * @default 0
         */
        page?: number;
        /**
         * items per page.
         * @default 100
         */
        itemsPerPage?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<RTSPSessionList, Error>({
        path: `/v3/rtspssessions/list`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name RtspsSessionsGet
     * @summary returns a RTSPS session.
     * @request GET:/v3/rtspssessions/get/{id}
     */
    rtspsSessionsGet: (id: string, params: RequestParams = {}) =>
      this.request<RTSPSession, Error>({
        path: `/v3/rtspssessions/get/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name RtspsSessionsKick
     * @summary kicks out a RTSPS session from the server.
     * @request POST:/v3/rtspssessions/kick/{id}
     */
    rtspsSessionsKick: (id: string, params: RequestParams = {}) =>
      this.request<void, Error>({
        path: `/v3/rtspssessions/kick/${id}`,
        method: "POST",
        ...params,
      }),

    /**
     * No description
     *
     * @name RtmpConnsList
     * @summary returns all RTMP connections.
     * @request GET:/v3/rtmpconns/list
     */
    rtmpConnsList: (
      query?: {
        /**
         * page number.
         * @default 0
         */
        page?: number;
        /**
         * items per page.
         * @default 100
         */
        itemsPerPage?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<RTMPConnList, Error>({
        path: `/v3/rtmpconns/list`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name RtmpConnectionsGet
     * @summary returns a RTMP connection.
     * @request GET:/v3/rtmpconns/get/{id}
     */
    rtmpConnectionsGet: (id: string, params: RequestParams = {}) =>
      this.request<RTMPConn, Error>({
        path: `/v3/rtmpconns/get/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name RtmpConnsKick
     * @summary kicks out a RTMP connection from the server.
     * @request POST:/v3/rtmpconns/kick/{id}
     */
    rtmpConnsKick: (id: string, params: RequestParams = {}) =>
      this.request<void, Error>({
        path: `/v3/rtmpconns/kick/${id}`,
        method: "POST",
        ...params,
      }),

    /**
     * No description
     *
     * @name RtmpsConnsList
     * @summary returns all RTMPS connections.
     * @request GET:/v3/rtmpsconns/list
     */
    rtmpsConnsList: (
      query?: {
        /**
         * page number.
         * @default 0
         */
        page?: number;
        /**
         * items per page.
         * @default 100
         */
        itemsPerPage?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<RTMPConnList, Error>({
        path: `/v3/rtmpsconns/list`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name RtmpsConnectionsGet
     * @summary returns a RTMPS connection.
     * @request GET:/v3/rtmpsconns/get/{id}
     */
    rtmpsConnectionsGet: (id: string, params: RequestParams = {}) =>
      this.request<RTMPConn, Error>({
        path: `/v3/rtmpsconns/get/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name RtmpsConnsKick
     * @summary kicks out a RTMPS connection from the server.
     * @request POST:/v3/rtmpsconns/kick/{id}
     */
    rtmpsConnsKick: (id: string, params: RequestParams = {}) =>
      this.request<void, Error>({
        path: `/v3/rtmpsconns/kick/${id}`,
        method: "POST",
        ...params,
      }),

    /**
     * No description
     *
     * @name SrtConnsList
     * @summary returns all SRT connections.
     * @request GET:/v3/srtconns/list
     */
    srtConnsList: (
      query?: {
        /**
         * page number.
         * @default 0
         */
        page?: number;
        /**
         * items per page.
         * @default 100
         */
        itemsPerPage?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<SRTConnList, Error>({
        path: `/v3/srtconns/list`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name SrtConnsGet
     * @summary returns a SRT connection.
     * @request GET:/v3/srtconns/get/{id}
     */
    srtConnsGet: (id: string, params: RequestParams = {}) =>
      this.request<SRTConn, Error>({
        path: `/v3/srtconns/get/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name SrtConnsKick
     * @summary kicks out a SRT connection from the server.
     * @request POST:/v3/srtconns/kick/{id}
     */
    srtConnsKick: (id: string, params: RequestParams = {}) =>
      this.request<void, Error>({
        path: `/v3/srtconns/kick/${id}`,
        method: "POST",
        ...params,
      }),

    /**
     * No description
     *
     * @name WebrtcSessionsList
     * @summary returns all WebRTC sessions.
     * @request GET:/v3/webrtcsessions/list
     */
    webrtcSessionsList: (
      query?: {
        /**
         * page number.
         * @default 0
         */
        page?: number;
        /**
         * items per page.
         * @default 100
         */
        itemsPerPage?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<WebRTCSessionList, Error>({
        path: `/v3/webrtcsessions/list`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name WebrtcSessionsGet
     * @summary returns a WebRTC session.
     * @request GET:/v3/webrtcsessions/get/{id}
     */
    webrtcSessionsGet: (id: string, params: RequestParams = {}) =>
      this.request<WebRTCSession, Error>({
        path: `/v3/webrtcsessions/get/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @name WebrtcSessionsKick
     * @summary kicks out a WebRTC session from the server.
     * @request POST:/v3/webrtcsessions/kick/{id}
     */
    webrtcSessionsKick: (id: string, params: RequestParams = {}) =>
      this.request<void, Error>({
        path: `/v3/webrtcsessions/kick/${id}`,
        method: "POST",
        ...params,
      }),
  };
}
