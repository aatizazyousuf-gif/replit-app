import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { Alert, AuthResponse, Conversation, CreateEmergencyContactInput, CustomerLinkInput, Device, DeviceInput, DeviceUpdate, Dispatch, DispatchInput, DispatchUpdate, EmergencyContact, GetAlertsParams, GetMessagesParams, GetRevenueAnalyticsParams, GetUsageAnalyticsParams, HealthStatus, HomeownerSummary, InventoryItem, InventoryItemInput, InventoryItemUpdate, LinkedSupplier, Message, MessageInput, RefillOrder, RefillOrderInput, RefillOrderUpdate, RegisterPushTokenInput, RevenueDataPoint, SensorReading, SensorReadingInput, SupplierCustomer, SupplierSummary, UsageDataPoint, User, UserLogin, UserRegistration } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * @summary Health check
 */
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getRegisterUrl: () => string;
/**
 * @summary Register a new user
 */
export declare const register: (userRegistration: UserRegistration, options?: RequestInit) => Promise<AuthResponse>;
export declare const getRegisterMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof register>>, TError, {
        data: BodyType<UserRegistration>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof register>>, TError, {
    data: BodyType<UserRegistration>;
}, TContext>;
export type RegisterMutationResult = NonNullable<Awaited<ReturnType<typeof register>>>;
export type RegisterMutationBody = BodyType<UserRegistration>;
export type RegisterMutationError = ErrorType<void>;
/**
* @summary Register a new user
*/
export declare const useRegister: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof register>>, TError, {
        data: BodyType<UserRegistration>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof register>>, TError, {
    data: BodyType<UserRegistration>;
}, TContext>;
export declare const getLoginUrl: () => string;
/**
 * @summary Login
 */
export declare const login: (userLogin: UserLogin, options?: RequestInit) => Promise<AuthResponse>;
export declare const getLoginMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<UserLogin>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<UserLogin>;
}, TContext>;
export type LoginMutationResult = NonNullable<Awaited<ReturnType<typeof login>>>;
export type LoginMutationBody = BodyType<UserLogin>;
export type LoginMutationError = ErrorType<void>;
/**
* @summary Login
*/
export declare const useLogin: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<UserLogin>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<UserLogin>;
}, TContext>;
export declare const getLogoutUrl: () => string;
/**
 * @summary Logout
 */
export declare const logout: (options?: RequestInit) => Promise<void>;
export declare const getLogoutMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
export type LogoutMutationResult = NonNullable<Awaited<ReturnType<typeof logout>>>;
export type LogoutMutationError = ErrorType<unknown>;
/**
* @summary Logout
*/
export declare const useLogout: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
export declare const getGetMeUrl: () => string;
/**
 * @summary Get current user
 */
export declare const getMe: (options?: RequestInit) => Promise<User>;
export declare const getGetMeQueryKey: () => readonly ["/api/auth/me"];
export declare const getGetMeQueryOptions: <TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMeQueryResult = NonNullable<Awaited<ReturnType<typeof getMe>>>;
export type GetMeQueryError = ErrorType<void>;
/**
 * @summary Get current user
 */
export declare function useGetMe<TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetDevicesUrl: () => string;
/**
 * @summary List devices for current homeowner
 */
export declare const getDevices: (options?: RequestInit) => Promise<Device[]>;
export declare const getGetDevicesQueryKey: () => readonly ["/api/devices"];
export declare const getGetDevicesQueryOptions: <TData = Awaited<ReturnType<typeof getDevices>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDevices>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDevices>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDevicesQueryResult = NonNullable<Awaited<ReturnType<typeof getDevices>>>;
export type GetDevicesQueryError = ErrorType<unknown>;
/**
 * @summary List devices for current homeowner
 */
export declare function useGetDevices<TData = Awaited<ReturnType<typeof getDevices>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDevices>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateDeviceUrl: () => string;
/**
 * @summary Register a new ESP32 device
 */
export declare const createDevice: (deviceInput: DeviceInput, options?: RequestInit) => Promise<Device>;
export declare const getCreateDeviceMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createDevice>>, TError, {
        data: BodyType<DeviceInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createDevice>>, TError, {
    data: BodyType<DeviceInput>;
}, TContext>;
export type CreateDeviceMutationResult = NonNullable<Awaited<ReturnType<typeof createDevice>>>;
export type CreateDeviceMutationBody = BodyType<DeviceInput>;
export type CreateDeviceMutationError = ErrorType<unknown>;
/**
* @summary Register a new ESP32 device
*/
export declare const useCreateDevice: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createDevice>>, TError, {
        data: BodyType<DeviceInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createDevice>>, TError, {
    data: BodyType<DeviceInput>;
}, TContext>;
export declare const getGetDeviceUrl: (id: number) => string;
/**
 * @summary Get device by id
 */
export declare const getDevice: (id: number, options?: RequestInit) => Promise<Device>;
export declare const getGetDeviceQueryKey: (id: number) => readonly [`/api/devices/${number}`];
export declare const getGetDeviceQueryOptions: <TData = Awaited<ReturnType<typeof getDevice>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDevice>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDevice>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDeviceQueryResult = NonNullable<Awaited<ReturnType<typeof getDevice>>>;
export type GetDeviceQueryError = ErrorType<void>;
/**
 * @summary Get device by id
 */
export declare function useGetDevice<TData = Awaited<ReturnType<typeof getDevice>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDevice>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateDeviceUrl: (id: number) => string;
/**
 * @summary Update device
 */
export declare const updateDevice: (id: number, deviceUpdate: DeviceUpdate, options?: RequestInit) => Promise<Device>;
export declare const getUpdateDeviceMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateDevice>>, TError, {
        id: number;
        data: BodyType<DeviceUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateDevice>>, TError, {
    id: number;
    data: BodyType<DeviceUpdate>;
}, TContext>;
export type UpdateDeviceMutationResult = NonNullable<Awaited<ReturnType<typeof updateDevice>>>;
export type UpdateDeviceMutationBody = BodyType<DeviceUpdate>;
export type UpdateDeviceMutationError = ErrorType<unknown>;
/**
* @summary Update device
*/
export declare const useUpdateDevice: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateDevice>>, TError, {
        id: number;
        data: BodyType<DeviceUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateDevice>>, TError, {
    id: number;
    data: BodyType<DeviceUpdate>;
}, TContext>;
export declare const getDeleteDeviceUrl: (id: number) => string;
/**
 * @summary Delete device
 */
export declare const deleteDevice: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteDeviceMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteDevice>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteDevice>>, TError, {
    id: number;
}, TContext>;
export type DeleteDeviceMutationResult = NonNullable<Awaited<ReturnType<typeof deleteDevice>>>;
export type DeleteDeviceMutationError = ErrorType<unknown>;
/**
* @summary Delete device
*/
export declare const useDeleteDevice: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteDevice>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteDevice>>, TError, {
    id: number;
}, TContext>;
export declare const getGetReadingsUrl: (deviceId: number) => string;
/**
 * @summary Get last 24 sensor readings for a device
 */
export declare const getReadings: (deviceId: number, options?: RequestInit) => Promise<SensorReading[]>;
export declare const getGetReadingsQueryKey: (deviceId: number) => readonly [`/api/devices/${number}/readings`];
export declare const getGetReadingsQueryOptions: <TData = Awaited<ReturnType<typeof getReadings>>, TError = ErrorType<unknown>>(deviceId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getReadings>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getReadings>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetReadingsQueryResult = NonNullable<Awaited<ReturnType<typeof getReadings>>>;
export type GetReadingsQueryError = ErrorType<unknown>;
/**
 * @summary Get last 24 sensor readings for a device
 */
export declare function useGetReadings<TData = Awaited<ReturnType<typeof getReadings>>, TError = ErrorType<unknown>>(deviceId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getReadings>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateReadingUrl: (deviceId: number) => string;
/**
 * @summary Submit a sensor reading (from ESP32)
 */
export declare const createReading: (deviceId: number, sensorReadingInput: SensorReadingInput, options?: RequestInit) => Promise<SensorReading>;
export declare const getCreateReadingMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createReading>>, TError, {
        deviceId: number;
        data: BodyType<SensorReadingInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createReading>>, TError, {
    deviceId: number;
    data: BodyType<SensorReadingInput>;
}, TContext>;
export type CreateReadingMutationResult = NonNullable<Awaited<ReturnType<typeof createReading>>>;
export type CreateReadingMutationBody = BodyType<SensorReadingInput>;
export type CreateReadingMutationError = ErrorType<unknown>;
/**
* @summary Submit a sensor reading (from ESP32)
*/
export declare const useCreateReading: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createReading>>, TError, {
        deviceId: number;
        data: BodyType<SensorReadingInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createReading>>, TError, {
    deviceId: number;
    data: BodyType<SensorReadingInput>;
}, TContext>;
export declare const getGetLatestReadingUrl: (deviceId: number) => string;
/**
 * @summary Get the most recent sensor reading
 */
export declare const getLatestReading: (deviceId: number, options?: RequestInit) => Promise<SensorReading>;
export declare const getGetLatestReadingQueryKey: (deviceId: number) => readonly [`/api/devices/${number}/readings/latest`];
export declare const getGetLatestReadingQueryOptions: <TData = Awaited<ReturnType<typeof getLatestReading>>, TError = ErrorType<void>>(deviceId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getLatestReading>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getLatestReading>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetLatestReadingQueryResult = NonNullable<Awaited<ReturnType<typeof getLatestReading>>>;
export type GetLatestReadingQueryError = ErrorType<void>;
/**
 * @summary Get the most recent sensor reading
 */
export declare function useGetLatestReading<TData = Awaited<ReturnType<typeof getLatestReading>>, TError = ErrorType<void>>(deviceId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getLatestReading>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetAlertsUrl: (params?: GetAlertsParams) => string;
/**
 * @summary Get alerts for current user
 */
export declare const getAlerts: (params?: GetAlertsParams, options?: RequestInit) => Promise<Alert[]>;
export declare const getGetAlertsQueryKey: (params?: GetAlertsParams) => readonly ["/api/alerts", ...GetAlertsParams[]];
export declare const getGetAlertsQueryOptions: <TData = Awaited<ReturnType<typeof getAlerts>>, TError = ErrorType<unknown>>(params?: GetAlertsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAlerts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAlerts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAlertsQueryResult = NonNullable<Awaited<ReturnType<typeof getAlerts>>>;
export type GetAlertsQueryError = ErrorType<unknown>;
/**
 * @summary Get alerts for current user
 */
export declare function useGetAlerts<TData = Awaited<ReturnType<typeof getAlerts>>, TError = ErrorType<unknown>>(params?: GetAlertsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAlerts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getResolveAlertUrl: (id: number) => string;
/**
 * @summary Mark alert as resolved
 */
export declare const resolveAlert: (id: number, options?: RequestInit) => Promise<Alert>;
export declare const getResolveAlertMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof resolveAlert>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof resolveAlert>>, TError, {
    id: number;
}, TContext>;
export type ResolveAlertMutationResult = NonNullable<Awaited<ReturnType<typeof resolveAlert>>>;
export type ResolveAlertMutationError = ErrorType<unknown>;
/**
* @summary Mark alert as resolved
*/
export declare const useResolveAlert: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof resolveAlert>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof resolveAlert>>, TError, {
    id: number;
}, TContext>;
export declare const getGetRefillOrdersUrl: () => string;
/**
 * @summary List refill orders (homeowner sees own; supplier sees assigned)
 */
export declare const getRefillOrders: (options?: RequestInit) => Promise<RefillOrder[]>;
export declare const getGetRefillOrdersQueryKey: () => readonly ["/api/refill-orders"];
export declare const getGetRefillOrdersQueryOptions: <TData = Awaited<ReturnType<typeof getRefillOrders>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRefillOrders>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getRefillOrders>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetRefillOrdersQueryResult = NonNullable<Awaited<ReturnType<typeof getRefillOrders>>>;
export type GetRefillOrdersQueryError = ErrorType<unknown>;
/**
 * @summary List refill orders (homeowner sees own; supplier sees assigned)
 */
export declare function useGetRefillOrders<TData = Awaited<ReturnType<typeof getRefillOrders>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRefillOrders>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateRefillOrderUrl: () => string;
/**
 * @summary Place a new refill order
 */
export declare const createRefillOrder: (refillOrderInput: RefillOrderInput, options?: RequestInit) => Promise<RefillOrder>;
export declare const getCreateRefillOrderMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createRefillOrder>>, TError, {
        data: BodyType<RefillOrderInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createRefillOrder>>, TError, {
    data: BodyType<RefillOrderInput>;
}, TContext>;
export type CreateRefillOrderMutationResult = NonNullable<Awaited<ReturnType<typeof createRefillOrder>>>;
export type CreateRefillOrderMutationBody = BodyType<RefillOrderInput>;
export type CreateRefillOrderMutationError = ErrorType<unknown>;
/**
* @summary Place a new refill order
*/
export declare const useCreateRefillOrder: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createRefillOrder>>, TError, {
        data: BodyType<RefillOrderInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createRefillOrder>>, TError, {
    data: BodyType<RefillOrderInput>;
}, TContext>;
export declare const getGetRefillOrderUrl: (id: number) => string;
/**
 * @summary Get refill order detail
 */
export declare const getRefillOrder: (id: number, options?: RequestInit) => Promise<RefillOrder>;
export declare const getGetRefillOrderQueryKey: (id: number) => readonly [`/api/refill-orders/${number}`];
export declare const getGetRefillOrderQueryOptions: <TData = Awaited<ReturnType<typeof getRefillOrder>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRefillOrder>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getRefillOrder>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetRefillOrderQueryResult = NonNullable<Awaited<ReturnType<typeof getRefillOrder>>>;
export type GetRefillOrderQueryError = ErrorType<unknown>;
/**
 * @summary Get refill order detail
 */
export declare function useGetRefillOrder<TData = Awaited<ReturnType<typeof getRefillOrder>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRefillOrder>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateRefillOrderUrl: (id: number) => string;
/**
 * @summary Update refill order status
 */
export declare const updateRefillOrder: (id: number, refillOrderUpdate: RefillOrderUpdate, options?: RequestInit) => Promise<RefillOrder>;
export declare const getUpdateRefillOrderMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateRefillOrder>>, TError, {
        id: number;
        data: BodyType<RefillOrderUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateRefillOrder>>, TError, {
    id: number;
    data: BodyType<RefillOrderUpdate>;
}, TContext>;
export type UpdateRefillOrderMutationResult = NonNullable<Awaited<ReturnType<typeof updateRefillOrder>>>;
export type UpdateRefillOrderMutationBody = BodyType<RefillOrderUpdate>;
export type UpdateRefillOrderMutationError = ErrorType<unknown>;
/**
* @summary Update refill order status
*/
export declare const useUpdateRefillOrder: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateRefillOrder>>, TError, {
        id: number;
        data: BodyType<RefillOrderUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateRefillOrder>>, TError, {
    id: number;
    data: BodyType<RefillOrderUpdate>;
}, TContext>;
export declare const getGetMessagesUrl: (params: GetMessagesParams) => string;
/**
 * @summary Get conversation messages with a user
 */
export declare const getMessages: (params: GetMessagesParams, options?: RequestInit) => Promise<Message[]>;
export declare const getGetMessagesQueryKey: (params?: GetMessagesParams) => readonly ["/api/messages", ...GetMessagesParams[]];
export declare const getGetMessagesQueryOptions: <TData = Awaited<ReturnType<typeof getMessages>>, TError = ErrorType<unknown>>(params: GetMessagesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMessages>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMessages>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMessagesQueryResult = NonNullable<Awaited<ReturnType<typeof getMessages>>>;
export type GetMessagesQueryError = ErrorType<unknown>;
/**
 * @summary Get conversation messages with a user
 */
export declare function useGetMessages<TData = Awaited<ReturnType<typeof getMessages>>, TError = ErrorType<unknown>>(params: GetMessagesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMessages>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getSendMessageUrl: () => string;
/**
 * @summary Send a message
 */
export declare const sendMessage: (messageInput: MessageInput, options?: RequestInit) => Promise<Message>;
export declare const getSendMessageMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof sendMessage>>, TError, {
        data: BodyType<MessageInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof sendMessage>>, TError, {
    data: BodyType<MessageInput>;
}, TContext>;
export type SendMessageMutationResult = NonNullable<Awaited<ReturnType<typeof sendMessage>>>;
export type SendMessageMutationBody = BodyType<MessageInput>;
export type SendMessageMutationError = ErrorType<unknown>;
/**
* @summary Send a message
*/
export declare const useSendMessage: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof sendMessage>>, TError, {
        data: BodyType<MessageInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof sendMessage>>, TError, {
    data: BodyType<MessageInput>;
}, TContext>;
export declare const getGetConversationsUrl: () => string;
/**
 * @summary List all conversations (with last message)
 */
export declare const getConversations: (options?: RequestInit) => Promise<Conversation[]>;
export declare const getGetConversationsQueryKey: () => readonly ["/api/messages/conversations"];
export declare const getGetConversationsQueryOptions: <TData = Awaited<ReturnType<typeof getConversations>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getConversations>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getConversations>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetConversationsQueryResult = NonNullable<Awaited<ReturnType<typeof getConversations>>>;
export type GetConversationsQueryError = ErrorType<unknown>;
/**
 * @summary List all conversations (with last message)
 */
export declare function useGetConversations<TData = Awaited<ReturnType<typeof getConversations>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getConversations>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetSupplierCustomersUrl: () => string;
/**
 * @summary List linked homeowner customers
 */
export declare const getSupplierCustomers: (options?: RequestInit) => Promise<SupplierCustomer[]>;
export declare const getGetSupplierCustomersQueryKey: () => readonly ["/api/supplier/customers"];
export declare const getGetSupplierCustomersQueryOptions: <TData = Awaited<ReturnType<typeof getSupplierCustomers>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSupplierCustomers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getSupplierCustomers>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetSupplierCustomersQueryResult = NonNullable<Awaited<ReturnType<typeof getSupplierCustomers>>>;
export type GetSupplierCustomersQueryError = ErrorType<unknown>;
/**
 * @summary List linked homeowner customers
 */
export declare function useGetSupplierCustomers<TData = Awaited<ReturnType<typeof getSupplierCustomers>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSupplierCustomers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getLinkCustomerUrl: () => string;
/**
 * @summary Link a homeowner as a customer
 */
export declare const linkCustomer: (customerLinkInput: CustomerLinkInput, options?: RequestInit) => Promise<SupplierCustomer>;
export declare const getLinkCustomerMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof linkCustomer>>, TError, {
        data: BodyType<CustomerLinkInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof linkCustomer>>, TError, {
    data: BodyType<CustomerLinkInput>;
}, TContext>;
export type LinkCustomerMutationResult = NonNullable<Awaited<ReturnType<typeof linkCustomer>>>;
export type LinkCustomerMutationBody = BodyType<CustomerLinkInput>;
export type LinkCustomerMutationError = ErrorType<unknown>;
/**
* @summary Link a homeowner as a customer
*/
export declare const useLinkCustomer: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof linkCustomer>>, TError, {
        data: BodyType<CustomerLinkInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof linkCustomer>>, TError, {
    data: BodyType<CustomerLinkInput>;
}, TContext>;
export declare const getUnlinkCustomerUrl: (id: number) => string;
/**
 * @summary Remove a customer link
 */
export declare const unlinkCustomer: (id: number, options?: RequestInit) => Promise<void>;
export declare const getUnlinkCustomerMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof unlinkCustomer>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof unlinkCustomer>>, TError, {
    id: number;
}, TContext>;
export type UnlinkCustomerMutationResult = NonNullable<Awaited<ReturnType<typeof unlinkCustomer>>>;
export type UnlinkCustomerMutationError = ErrorType<unknown>;
/**
* @summary Remove a customer link
*/
export declare const useUnlinkCustomer: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof unlinkCustomer>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof unlinkCustomer>>, TError, {
    id: number;
}, TContext>;
export declare const getGetInventoryUrl: () => string;
/**
 * @summary Get supplier inventory
 */
export declare const getInventory: (options?: RequestInit) => Promise<InventoryItem[]>;
export declare const getGetInventoryQueryKey: () => readonly ["/api/supplier/inventory"];
export declare const getGetInventoryQueryOptions: <TData = Awaited<ReturnType<typeof getInventory>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getInventory>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getInventory>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetInventoryQueryResult = NonNullable<Awaited<ReturnType<typeof getInventory>>>;
export type GetInventoryQueryError = ErrorType<unknown>;
/**
 * @summary Get supplier inventory
 */
export declare function useGetInventory<TData = Awaited<ReturnType<typeof getInventory>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getInventory>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateInventoryItemUrl: () => string;
/**
 * @summary Add inventory item
 */
export declare const createInventoryItem: (inventoryItemInput: InventoryItemInput, options?: RequestInit) => Promise<InventoryItem>;
export declare const getCreateInventoryItemMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createInventoryItem>>, TError, {
        data: BodyType<InventoryItemInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createInventoryItem>>, TError, {
    data: BodyType<InventoryItemInput>;
}, TContext>;
export type CreateInventoryItemMutationResult = NonNullable<Awaited<ReturnType<typeof createInventoryItem>>>;
export type CreateInventoryItemMutationBody = BodyType<InventoryItemInput>;
export type CreateInventoryItemMutationError = ErrorType<unknown>;
/**
* @summary Add inventory item
*/
export declare const useCreateInventoryItem: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createInventoryItem>>, TError, {
        data: BodyType<InventoryItemInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createInventoryItem>>, TError, {
    data: BodyType<InventoryItemInput>;
}, TContext>;
export declare const getUpdateInventoryItemUrl: (id: number) => string;
/**
 * @summary Update inventory item
 */
export declare const updateInventoryItem: (id: number, inventoryItemUpdate: InventoryItemUpdate, options?: RequestInit) => Promise<InventoryItem>;
export declare const getUpdateInventoryItemMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateInventoryItem>>, TError, {
        id: number;
        data: BodyType<InventoryItemUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateInventoryItem>>, TError, {
    id: number;
    data: BodyType<InventoryItemUpdate>;
}, TContext>;
export type UpdateInventoryItemMutationResult = NonNullable<Awaited<ReturnType<typeof updateInventoryItem>>>;
export type UpdateInventoryItemMutationBody = BodyType<InventoryItemUpdate>;
export type UpdateInventoryItemMutationError = ErrorType<unknown>;
/**
* @summary Update inventory item
*/
export declare const useUpdateInventoryItem: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateInventoryItem>>, TError, {
        id: number;
        data: BodyType<InventoryItemUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateInventoryItem>>, TError, {
    id: number;
    data: BodyType<InventoryItemUpdate>;
}, TContext>;
export declare const getGetDispatchesUrl: () => string;
/**
 * @summary List dispatches
 */
export declare const getDispatches: (options?: RequestInit) => Promise<Dispatch[]>;
export declare const getGetDispatchesQueryKey: () => readonly ["/api/supplier/dispatches"];
export declare const getGetDispatchesQueryOptions: <TData = Awaited<ReturnType<typeof getDispatches>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDispatches>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDispatches>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDispatchesQueryResult = NonNullable<Awaited<ReturnType<typeof getDispatches>>>;
export type GetDispatchesQueryError = ErrorType<unknown>;
/**
 * @summary List dispatches
 */
export declare function useGetDispatches<TData = Awaited<ReturnType<typeof getDispatches>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDispatches>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateDispatchUrl: () => string;
/**
 * @summary Create a dispatch
 */
export declare const createDispatch: (dispatchInput: DispatchInput, options?: RequestInit) => Promise<Dispatch>;
export declare const getCreateDispatchMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createDispatch>>, TError, {
        data: BodyType<DispatchInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createDispatch>>, TError, {
    data: BodyType<DispatchInput>;
}, TContext>;
export type CreateDispatchMutationResult = NonNullable<Awaited<ReturnType<typeof createDispatch>>>;
export type CreateDispatchMutationBody = BodyType<DispatchInput>;
export type CreateDispatchMutationError = ErrorType<unknown>;
/**
* @summary Create a dispatch
*/
export declare const useCreateDispatch: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createDispatch>>, TError, {
        data: BodyType<DispatchInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createDispatch>>, TError, {
    data: BodyType<DispatchInput>;
}, TContext>;
export declare const getUpdateDispatchUrl: (id: number) => string;
/**
 * @summary Update dispatch status
 */
export declare const updateDispatch: (id: number, dispatchUpdate: DispatchUpdate, options?: RequestInit) => Promise<Dispatch>;
export declare const getUpdateDispatchMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateDispatch>>, TError, {
        id: number;
        data: BodyType<DispatchUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateDispatch>>, TError, {
    id: number;
    data: BodyType<DispatchUpdate>;
}, TContext>;
export type UpdateDispatchMutationResult = NonNullable<Awaited<ReturnType<typeof updateDispatch>>>;
export type UpdateDispatchMutationBody = BodyType<DispatchUpdate>;
export type UpdateDispatchMutationError = ErrorType<unknown>;
/**
* @summary Update dispatch status
*/
export declare const useUpdateDispatch: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateDispatch>>, TError, {
        id: number;
        data: BodyType<DispatchUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateDispatch>>, TError, {
    id: number;
    data: BodyType<DispatchUpdate>;
}, TContext>;
export declare const getGetSupplierSummaryUrl: () => string;
/**
 * @summary Supplier dashboard summary (active dispatches, pending orders, revenue)
 */
export declare const getSupplierSummary: (options?: RequestInit) => Promise<SupplierSummary>;
export declare const getGetSupplierSummaryQueryKey: () => readonly ["/api/supplier/summary"];
export declare const getGetSupplierSummaryQueryOptions: <TData = Awaited<ReturnType<typeof getSupplierSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSupplierSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getSupplierSummary>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetSupplierSummaryQueryResult = NonNullable<Awaited<ReturnType<typeof getSupplierSummary>>>;
export type GetSupplierSummaryQueryError = ErrorType<unknown>;
/**
 * @summary Supplier dashboard summary (active dispatches, pending orders, revenue)
 */
export declare function useGetSupplierSummary<TData = Awaited<ReturnType<typeof getSupplierSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getSupplierSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetRevenueAnalyticsUrl: (params?: GetRevenueAnalyticsParams) => string;
/**
 * @summary Revenue analytics by period
 */
export declare const getRevenueAnalytics: (params?: GetRevenueAnalyticsParams, options?: RequestInit) => Promise<RevenueDataPoint[]>;
export declare const getGetRevenueAnalyticsQueryKey: (params?: GetRevenueAnalyticsParams) => readonly ["/api/supplier/analytics/revenue", ...GetRevenueAnalyticsParams[]];
export declare const getGetRevenueAnalyticsQueryOptions: <TData = Awaited<ReturnType<typeof getRevenueAnalytics>>, TError = ErrorType<unknown>>(params?: GetRevenueAnalyticsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRevenueAnalytics>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getRevenueAnalytics>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetRevenueAnalyticsQueryResult = NonNullable<Awaited<ReturnType<typeof getRevenueAnalytics>>>;
export type GetRevenueAnalyticsQueryError = ErrorType<unknown>;
/**
 * @summary Revenue analytics by period
 */
export declare function useGetRevenueAnalytics<TData = Awaited<ReturnType<typeof getRevenueAnalytics>>, TError = ErrorType<unknown>>(params?: GetRevenueAnalyticsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getRevenueAnalytics>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetHomeownerSummaryUrl: () => string;
/**
 * @summary Homeowner dashboard summary (gas level, active alerts, active order)
 */
export declare const getHomeownerSummary: (options?: RequestInit) => Promise<HomeownerSummary>;
export declare const getGetHomeownerSummaryQueryKey: () => readonly ["/api/homeowner/summary"];
export declare const getGetHomeownerSummaryQueryOptions: <TData = Awaited<ReturnType<typeof getHomeownerSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getHomeownerSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getHomeownerSummary>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetHomeownerSummaryQueryResult = NonNullable<Awaited<ReturnType<typeof getHomeownerSummary>>>;
export type GetHomeownerSummaryQueryError = ErrorType<unknown>;
/**
 * @summary Homeowner dashboard summary (gas level, active alerts, active order)
 */
export declare function useGetHomeownerSummary<TData = Awaited<ReturnType<typeof getHomeownerSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getHomeownerSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetMySupplierUrl: () => string;
/**
 * @summary Get the supplier linked to the current homeowner (if any)
 */
export declare const getMySupplier: (options?: RequestInit) => Promise<LinkedSupplier | null>;
export declare const getGetMySupplierQueryKey: () => readonly ["/api/homeowner/supplier"];
export declare const getGetMySupplierQueryOptions: <TData = Awaited<ReturnType<typeof getMySupplier>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMySupplier>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMySupplier>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMySupplierQueryResult = NonNullable<Awaited<ReturnType<typeof getMySupplier>>>;
export type GetMySupplierQueryError = ErrorType<unknown>;
/**
 * @summary Get the supplier linked to the current homeowner (if any)
 */
export declare function useGetMySupplier<TData = Awaited<ReturnType<typeof getMySupplier>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMySupplier>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getRegisterPushTokenUrl: () => string;
/**
 * @summary Register (or update) this device's push notification token
 */
export declare const registerPushToken: (registerPushTokenInput: RegisterPushTokenInput, options?: RequestInit) => Promise<void>;
export declare const getRegisterPushTokenMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof registerPushToken>>, TError, {
        data: BodyType<RegisterPushTokenInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof registerPushToken>>, TError, {
    data: BodyType<RegisterPushTokenInput>;
}, TContext>;
export type RegisterPushTokenMutationResult = NonNullable<Awaited<ReturnType<typeof registerPushToken>>>;
export type RegisterPushTokenMutationBody = BodyType<RegisterPushTokenInput>;
export type RegisterPushTokenMutationError = ErrorType<unknown>;
/**
* @summary Register (or update) this device's push notification token
*/
export declare const useRegisterPushToken: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof registerPushToken>>, TError, {
        data: BodyType<RegisterPushTokenInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof registerPushToken>>, TError, {
    data: BodyType<RegisterPushTokenInput>;
}, TContext>;
export declare const getGetEmergencyContactsUrl: () => string;
/**
 * @summary List the current homeowner's emergency contacts
 */
export declare const getEmergencyContacts: (options?: RequestInit) => Promise<EmergencyContact[]>;
export declare const getGetEmergencyContactsQueryKey: () => readonly ["/api/homeowner/emergency-contacts"];
export declare const getGetEmergencyContactsQueryOptions: <TData = Awaited<ReturnType<typeof getEmergencyContacts>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getEmergencyContacts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getEmergencyContacts>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetEmergencyContactsQueryResult = NonNullable<Awaited<ReturnType<typeof getEmergencyContacts>>>;
export type GetEmergencyContactsQueryError = ErrorType<unknown>;
/**
 * @summary List the current homeowner's emergency contacts
 */
export declare function useGetEmergencyContacts<TData = Awaited<ReturnType<typeof getEmergencyContacts>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getEmergencyContacts>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateEmergencyContactUrl: () => string;
/**
 * @summary Add an emergency contact (notified by email on leak/low-level alerts)
 */
export declare const createEmergencyContact: (createEmergencyContactInput: CreateEmergencyContactInput, options?: RequestInit) => Promise<EmergencyContact>;
export declare const getCreateEmergencyContactMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createEmergencyContact>>, TError, {
        data: BodyType<CreateEmergencyContactInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createEmergencyContact>>, TError, {
    data: BodyType<CreateEmergencyContactInput>;
}, TContext>;
export type CreateEmergencyContactMutationResult = NonNullable<Awaited<ReturnType<typeof createEmergencyContact>>>;
export type CreateEmergencyContactMutationBody = BodyType<CreateEmergencyContactInput>;
export type CreateEmergencyContactMutationError = ErrorType<unknown>;
/**
* @summary Add an emergency contact (notified by email on leak/low-level alerts)
*/
export declare const useCreateEmergencyContact: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createEmergencyContact>>, TError, {
        data: BodyType<CreateEmergencyContactInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createEmergencyContact>>, TError, {
    data: BodyType<CreateEmergencyContactInput>;
}, TContext>;
export declare const getDeleteEmergencyContactUrl: (id: number) => string;
/**
 * @summary Remove an emergency contact
 */
export declare const deleteEmergencyContact: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteEmergencyContactMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteEmergencyContact>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteEmergencyContact>>, TError, {
    id: number;
}, TContext>;
export type DeleteEmergencyContactMutationResult = NonNullable<Awaited<ReturnType<typeof deleteEmergencyContact>>>;
export type DeleteEmergencyContactMutationError = ErrorType<unknown>;
/**
* @summary Remove an emergency contact
*/
export declare const useDeleteEmergencyContact: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteEmergencyContact>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteEmergencyContact>>, TError, {
    id: number;
}, TContext>;
export declare const getGetUsageAnalyticsUrl: (params?: GetUsageAnalyticsParams) => string;
/**
 * @summary Gas usage analytics
 */
export declare const getUsageAnalytics: (params?: GetUsageAnalyticsParams, options?: RequestInit) => Promise<UsageDataPoint[]>;
export declare const getGetUsageAnalyticsQueryKey: (params?: GetUsageAnalyticsParams) => readonly ["/api/homeowner/analytics/usage", ...GetUsageAnalyticsParams[]];
export declare const getGetUsageAnalyticsQueryOptions: <TData = Awaited<ReturnType<typeof getUsageAnalytics>>, TError = ErrorType<unknown>>(params?: GetUsageAnalyticsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUsageAnalytics>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getUsageAnalytics>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetUsageAnalyticsQueryResult = NonNullable<Awaited<ReturnType<typeof getUsageAnalytics>>>;
export type GetUsageAnalyticsQueryError = ErrorType<unknown>;
/**
 * @summary Gas usage analytics
 */
export declare function useGetUsageAnalytics<TData = Awaited<ReturnType<typeof getUsageAnalytics>>, TError = ErrorType<unknown>>(params?: GetUsageAnalyticsParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUsageAnalytics>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map