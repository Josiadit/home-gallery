import * as React from "react";
import { useMemo } from "react";

import { useEntryStore } from "../store/entry-store";
import { useEditModeStore } from '../store/edit-mode-store';

import { FluentList } from "./FluentList";
import { NavBar } from "../navbar/NavBar";

import useBodyDimensions from '../utils/useBodyDimensions';
import { useDeviceType, DeviceType } from "../utils/useDeviceType";
import { fluent } from "./fluent";
import { MultiTagDialogProvider } from "../dialog/tag-dialog-provider";
import { useAppConfig } from "../utils/useAppConfig";

// Default single-image-per-row layout configuration
const DEFAULT_DESKTOP_ROW_CONFIG = {minHeight: 400, maxHeight: 800, maxPotraitHeight: 900}
const DEFAULT_MOBILE_ROW_CONFIG = {minHeight: 200, maxHeight: 400, maxPotraitHeight: 450}
const DEFAULT_PADDING = 100  // Space between rows/images
const DEFAULT_SIDE_MARGIN = 50  // Horizontal margin on each side
const DEFAULT_TOP_PADDING = 50  // Space from navbar to first image
const DEFAULT_BOTTOM_PADDING = 100  // Space from last image to bottom

export const List = () => {
  const entries = useEntryStore(state => state.entries)
  const showSelected = useEditModeStore(state => state.showSelected);
  const selectedIds = useEditModeStore(state => state.selectedIds);
  const appConfig = useAppConfig();

  const { width } = useBodyDimensions();
  const deviceType = useDeviceType()[0];

  const listConfig = appConfig.list || {};
  const desktopConfig = listConfig.desktop || DEFAULT_DESKTOP_ROW_CONFIG;
  const mobileConfig = listConfig.mobile || DEFAULT_MOBILE_ROW_CONFIG;
  const padding = listConfig.padding ?? DEFAULT_PADDING;
  const sideMargin = listConfig.sideMargin ?? DEFAULT_SIDE_MARGIN;
  const topPadding = listConfig.topPadding ?? DEFAULT_TOP_PADDING;
  const bottomPadding = listConfig.bottomPadding ?? DEFAULT_BOTTOM_PADDING;

  const visibleEntries = useMemo(() => {
    if (!showSelected) {
      return entries
    }
    return entries.filter(entry => selectedIds[entry.id])
  }, [showSelected, selectedIds, entries])

  const rows = useMemo(() => {
    const config = deviceType === DeviceType.MOBILE ? mobileConfig : desktopConfig
    return fluent(visibleEntries, { padding, width, sideMargin, ...config });
  }, [width, visibleEntries, deviceType, desktopConfig, mobileConfig, padding, sideMargin])

  return (
    <>
      <MultiTagDialogProvider>
        <div className="bg-light-50">
          <NavBar />
          <div className="relative z-0">
            <FluentList rows={rows} padding={padding} topPadding={topPadding} bottomPadding={bottomPadding} />
          </div>
        </div>
      </MultiTagDialogProvider>
    </>
  )
}