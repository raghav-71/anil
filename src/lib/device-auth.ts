import crypto from "crypto";

export interface TrustedDevice {
  id: string;
  token: string;
  deviceName: string;
  fingerprint: string;
  enrolledAt: string;
  lastUsedAt: string;
  isRevoked: boolean;
  enrolledBy: string;
  ipAddress?: string;
}

export interface AccessAttemptLog {
  id: string;
  timestamp: string;
  deviceToken?: string;
  ipAddress: string;
  success: boolean;
  reason?: string;
}

// In-Memory & Persistent Device Store
class DeviceAuthManager {
  private devices: TrustedDevice[] = [
    {
      id: "dev-shop-counter-primary",
      token: "tok_anil_shop_primary_admin_terminal_2026_xyz982",
      deviceName: "Anil Shop Primary Admin Workstation (Dell All-in-One)",
      fingerprint: "fp_dell_admin_workstation_01",
      enrolledAt: "2026-01-10T09:00:00Z",
      lastUsedAt: new Date().toISOString(),
      isRevoked: false,
      enrolledBy: "Shop Owner",
      ipAddress: "192.168.1.100",
    },
  ];

  private accessLogs: AccessAttemptLog[] = [];
  private getOwnerMasterPasskey(): string {
    return process.env.ADMIN_PIN || process.env.ADMIN_SESSION_SECRET || "";
  }

  public isDeviceAuthorized(token?: string | null): { authorized: boolean; device?: TrustedDevice; reason?: string } {
    if (!token) {
      return { authorized: false, reason: "No device security token presented. This computer is unregistered." };
    }

    const device = this.devices.find((d) => d.token === token);
    if (!device) {
      return { authorized: false, reason: "Unrecognized device signature. Access denied by shop owner policy." };
    }

    if (device.isRevoked) {
      return { authorized: false, reason: "This device registration has been revoked by the Super Admin." };
    }

    device.lastUsedAt = new Date().toISOString();
    return { authorized: true, device };
  }

  public enrollDevice(params: {
    masterPasskey: string;
    deviceName: string;
    enrolledBy: string;
    ipAddress?: string;
  }): { success: boolean; token?: string; device?: TrustedDevice; error?: string } {
    const validKey = this.getOwnerMasterPasskey();
    if (!validKey || params.masterPasskey.trim() !== validKey) {
      return { success: false, error: "Invalid Owner Master Passkey. Device enrollment refused." };
    }

    const token = `tok_${crypto.randomBytes(24).toString("hex")}`;
    const device: TrustedDevice = {
      id: `dev-${Date.now()}`,
      token,
      deviceName: params.deviceName.trim() || "Shop Billing Computer",
      fingerprint: `fp_${crypto.randomBytes(8).toString("hex")}`,
      enrolledAt: new Date().toISOString(),
      lastUsedAt: new Date().toISOString(),
      isRevoked: false,
      enrolledBy: params.enrolledBy,
      ipAddress: params.ipAddress || "127.0.0.1",
    };

    this.devices.push(device);
    this.logAttempt({
      deviceToken: token,
      ipAddress: params.ipAddress || "127.0.0.1",
      success: true,
      reason: `New device enrolled: ${device.deviceName}`,
    });

    return { success: true, token, device };
  }

  public revokeDevice(deviceId: string): boolean {
    const dev = this.devices.find((d) => d.id === deviceId);
    if (!dev) return false;
    dev.isRevoked = true;
    return true;
  }

  public getTrustedDevices(): TrustedDevice[] {
    return this.devices;
  }

  public getAccessLogs(): AccessAttemptLog[] {
    return this.accessLogs.slice(-50);
  }

  public logAttempt(log: Omit<AccessAttemptLog, "id" | "timestamp">) {
    this.accessLogs.unshift({
      id: `log-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toISOString(),
      ...log,
    });
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __deviceAuthManager: DeviceAuthManager | undefined;
}

export const deviceAuth: DeviceAuthManager = globalThis.__deviceAuthManager || new DeviceAuthManager();
if (process.env.NODE_ENV !== "production") {
  globalThis.__deviceAuthManager = deviceAuth;
}

