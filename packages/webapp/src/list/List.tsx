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

// Single-image-per-row layout configuration
const DESKTOP_ROW_CONFIG = {minHeight: 400, maxHeight: 1000, maxPotraitHeight: 900}
const MOBILE_ROW_CONFIG = {minHeight: 200, maxHeight: 500, maxPotraitHeight: 450}
const PADDING = 100  // Space between rows/images
const TOP_PADDING = 50  // Space from navbar to first image
const BOTTOM_PADDING = 100  // Space from last image to bottom

export const List = () => {
  const entries = useEntryStore(state => state.entries)
  const showSelected = useEditModeStore(state => state.showSelected);
  const selectedIds = useEditModeStore(state => state.selectedIds);

  const { width } = useBodyDimensions();
  const deviceType = useDeviceType()[0];

  const visibleEntries = useMemo(() => {
    if (!showSelected) {
      return entries
    }
    return entries.filter(entry => selectedIds[entry.id])
  }, [showSelected, selectedIds, entries])

  const rows = useMemo(() => {
    const config = deviceType === DeviceType.MOBILE ? MOBILE_ROW_CONFIG : DESKTOP_ROW_CONFIG
    return fluent(visibleEntries, { padding: PADDING, width, ...config });
  }, [width, visibleEntries, deviceType])

  return (
    <>
      <MultiTagDialogProvider>
        <div className="bg-light-50">
          <NavBar />
          <div className="relative z-0">
            <FluentList rows={rows} padding={PADDING} topPadding={TOP_PADDING} bottomPadding={BOTTOM_PADDING} />
          </div>
        </div>
      </MultiTagDialogProvider>
    </>
  )
}