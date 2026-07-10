import { useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DeviceCard } from "@/components/device/DeviceCard";
import { DevicePickerModal } from "@/components/device/DevicePickerModal";
import { LaunchSection } from "@/components/launch/LaunchSection";
import { RemotePanel } from "@/components/panels/RemotePanel";
import { ScreenPreviewPanel } from "@/components/panels/ScreenPreviewPanel";
import { OrgManagementModal, type OrgManagerRequest } from "@/components/orgs/OrgManagementModal";
import { OrgStoreProvider, useOrgStore } from "@/store/OrgStoreContext";
import { PresetStoreProvider } from "@/store/PresetStoreContext";
import { loadSession, saveSession } from "@/store/session-storage";
import { useDeviceClient } from "@/lib/useDeviceClient";
import { useDeviceAlive } from "@/lib/useDeviceAlive";
import { kingfisher } from "@/lib/kingfisher/client";
import type { DeviceData } from "@/lib/kingfisher/types";
import type { Device } from "@/lib/device-client";

function App() {
  return (
    <OrgStoreProvider>
      <PresetStoreProvider>
        <AppContent />
      </PresetStoreProvider>
    </OrgStoreProvider>
  );
}

function AppContent() {
  const { selectedOrg } = useOrgStore();
  const deviceClient = useDeviceClient();
  const [orgManagerOpen, setOrgManagerOpen] = useState(false);
  const [orgManagerRequest, setOrgManagerRequest] = useState<OrgManagerRequest>({ view: "list" });
  const [deviceModalOpen, setDeviceModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [deviceDetails, setDeviceDetails] = useState<DeviceData | null>(null);
  const [url, setUrl] = useState("");
  const [appId, setAppId] = useState("");
  const prevOrgRef = useRef(selectedOrg?.id ?? null);
  const alive = useDeviceAlive(selectedDevice);

  function openOrgManager(request: OrgManagerRequest) {
    setOrgManagerRequest(request);
    setOrgManagerOpen(true);
  }

  function selectDevice(device: Device) {
    setSelectedDevice(device);
    setDeviceModalOpen(false);
    if (selectedOrg) {
      const session = loadSession(selectedOrg);
      saveSession(selectedOrg, { ...session, deviceId: device.id, deviceName: device.name });
    }
  }

  // Restore session on mount and when org changes:
  // save the previous org's session, then load the new org's session
  // (device, url, appId). Restoring the device triggers checkAlive
  // via useDeviceAlive automatically.
  useEffect(() => {
    const prevOrgId = prevOrgRef.current;
    if (prevOrgId && prevOrgId !== selectedOrg?.id && selectedDevice) {
      saveSession({ id: prevOrgId, name: "", orgId: "", apiKey: "" }, {
        deviceId: selectedDevice.id,
        deviceName: selectedDevice.name,
        url,
        appId,
      });
    }
    prevOrgRef.current = selectedOrg?.id ?? null;

    if (selectedOrg) {
      const session = loadSession(selectedOrg);
      setUrl(session.url);
      setAppId(session.appId);
      if (session.deviceId) {
        const stub: Device = {
          id: session.deviceId,
          name: session.deviceName ?? session.deviceId,
          labels: [],
        };
        setSelectedDevice(stub);
      } else {
        setSelectedDevice(null);
      }
    } else {
      setUrl("");
      setAppId("");
      setSelectedDevice(null);
    }
  }, [selectedOrg?.id]);

  // Fetch the real device list to upgrade the stub device with full data (labels/features).
  useEffect(() => {
    if (!selectedOrg || !selectedDevice) return;
    const savedId = selectedDevice.id;
    let cancelled = false;
    deviceClient.listDevices(selectedOrg).then((devices) => {
      if (cancelled) return;
      const match = devices.find((d) => d.id === savedId);
      if (match) setSelectedDevice(match);
    }).catch(() => {
      // Stub is already shown — labels won't appear but the device name/id are visible.
    });
    return () => { cancelled = true; };
  }, [selectedOrg?.id, selectedDevice?.id]);

  // Fetch full device details via getDevice whenever a device is selected
  // (catches both user selection and session restore).
  useEffect(() => {
    if (!selectedOrg || !selectedDevice) {
      setDeviceDetails(null);
      return;
    }
    let cancelled = false;
    kingfisher.getDevice(selectedOrg, selectedDevice.id).then((data) => {
      if (cancelled) return;
      setDeviceDetails(data ?? null);
    }).catch(() => {
      if (cancelled) return;
      setDeviceDetails(null);
    });
    return () => { cancelled = true; };
  }, [selectedOrg?.id, selectedDevice?.id]);

  function handleUrlChange(value: string) {
    setUrl(value);
    if (selectedOrg) {
      const session = loadSession(selectedOrg);
      saveSession(selectedOrg, { ...session, url: value });
    }
  }

  function handleAppIdChange(value: string) {
    setAppId(value);
    if (selectedOrg) {
      const session = loadSession(selectedOrg);
      saveSession(selectedOrg, { ...session, appId: value });
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      <Navbar onOpenOrgManager={openOrgManager} />

      <main className="mx-auto w-full max-w-[760px] flex-1 px-6 pt-14 pb-20">
        <div className="mb-8.5 text-center">
          <h1 className="mb-2 text-[30px] font-extrabold tracking-[-0.03em] text-navy">
            Launch an app on a device
          </h1>
          <p className="text-[15px] text-muted-foreground-strong">
            Select a device from{" "}
            <span className="font-semibold text-navy">
              {selectedOrg ? selectedOrg.name : "No organization"}
            </span>
            , set your target, and launch.
          </p>
        </div>

        <DeviceCard device={selectedDevice} deviceDetails={deviceDetails} alive={alive} onOpenPicker={() => setDeviceModalOpen(true)} />

        <div className="mt-5.5">
          <LaunchSection
            device={selectedDevice}
            url={url}
            appId={appId}
            onUrlChange={handleUrlChange}
            onAppIdChange={handleAppIdChange}
            onRefreshAlive={alive.refreshAlive}
          />
        </div>
      </main>

      <Footer />

      <ScreenPreviewPanel device={selectedDevice} alive={alive.state} />
      <RemotePanel />

      <OrgManagementModal
        open={orgManagerOpen}
        onOpenChange={setOrgManagerOpen}
        request={orgManagerRequest}
      />
      <DevicePickerModal
        open={deviceModalOpen}
        onOpenChange={setDeviceModalOpen}
        onSelectDevice={selectDevice}
      />
    </div>
  );
}

export default App;
