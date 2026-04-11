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

const NAV_HEIGHT = 44
const BOTTOM_MARGIN = 4

const desktopRowHeights = {minHeight: 400, maxHeight: 1000, maxPotraitHeight: 900}
const mobileRowHeights = {minHeight: 200, maxHeight: 500, maxPotraitHeight: 450}

export const List = () => {
  const entries = useEntryStore(state => state.entries)

  const showSelected = useEditModeStore(state => state.showSelected);
  const selectedIds = useEditModeStore(state => state.selectedIds);

  const { width } = useBodyDimensions();
  const [ deviceType ] = useDeviceType();

  const padding = 100

  const visibleEntries = useMemo(() => {
    if (!showSelected) {
      return entries
    }
    return entries.filter(entry => selectedIds[entry.id])
  }, [showSelected, selectedIds, entries])

  const rows = useMemo(() => {
    const rowHeights = deviceType === DeviceType.MOBILE ? mobileRowHeights : desktopRowHeights
    return fluent(visibleEntries, {padding, width, ...rowHeights});
  }, [width, visibleEntries, deviceType])

  return (
    <>
      <MultiTagDialogProvider>
        <div className="bg-light-50">
          <NavBar />
          <div className="relative z-0">
            <FluentList rows={rows} padding={padding}/>
          </div>
        </div>
      </MultiTagDialogProvider>
    </>
  )
}