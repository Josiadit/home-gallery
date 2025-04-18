import * as React from "react";
import { useState, useMemo, useEffect, useRef } from "react";

import { useEntryStore } from "../store/entry-store";
import { useEditModeStore } from '../store/edit-mode-store';

import { FluentList } from "./FluentList";
import { NavBar } from "../navbar/NavBar";
import { Scrollbar } from "./scrollbar";

import useBodyDimensions from '../utils/useBodyDimensions';
import { useDeviceType, DeviceType } from "../utils/useDeviceType";
import { fluent } from "./fluent";
import { MultiTagDialogProvider } from "../dialog/tag-dialog-provider";

const NAV_HEIGHT = 44
const BOTTOM_MARGIN = 4

const useViewHeight = (offset) => {
  const getHeight = () => (document.documentElement.clientHeight)+ offset
  const [height, setHeight] = useState(getHeight())

  const onResize = () => setHeight(getHeight())

  useEffect(() => {
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return height
}

const desktopRowHeights = {minHeight: 400, maxHeight: 1000, maxPotraitHeight: 900}
const mobileRowHeights = {minHeight: 200, maxHeight: 500, maxPotraitHeight: 450}

export const List = () => {
  const entries = useEntryStore(state => state.entries)

  const showSelected = useEditModeStore(state => state.showSelected);
  const selectedIds = useEditModeStore(state => state.selectedIds);

  const containerRef = useRef(window)

  const { width, height } = useBodyDimensions();
  const [ deviceType ] = useDeviceType();

  const viewHeight = height - NAV_HEIGHT - BOTTOM_MARGIN
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

  const topDateItems = useMemo(() => {
    return rows.map(({top, height, columns}) => ({top, height, date: columns[0].item?.date || '1970-01-01T00:00:00', dateValue: '1970'}))
  }, [rows])


  return (
    <>
      <MultiTagDialogProvider>
        <div className="bg-light-50">
          <NavBar />
          <div className="relative z-0">
            {/*<Scrollbar containerRef={containerRef}*/}
            {/*  style={{marginTop: 200, marginBottom: BOTTOM_MARGIN}}*/}
            {/*  pageHeight={viewHeight}*/}
            {/*  topDateItems={topDateItems} />*/}
            <FluentList rows={rows} padding={padding}/>
          </div>
        </div>
      </MultiTagDialogProvider>
    </>
  )
}