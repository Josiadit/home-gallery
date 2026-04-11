import * as React from "react";
import {
  useNavigate
} from "react-router-dom";
import * as icons from '@fortawesome/free-solid-svg-icons'

import { useSearchStore } from "../store/search-store";
import { useEditModeStore, ViewMode } from "../store/edit-mode-store";

import useListLocation from '../utils/useListLocation'
import { useAppConfig } from "../utils/useAppConfig";
import { NavItem } from "./NavItem";

export const ViewNavBar = ({disableEdit}) => {
  const search = useSearchStore(state => state.search);
  const viewMode = useEditModeStore(state => state.viewMode);
  const setViewMode = useEditModeStore(actions => actions.setViewMode);
  const navigate = useNavigate();
  const listLocation = useListLocation()
  const appConfig = useAppConfig()

  const disabledPages = appConfig.pages?.disabled || []

  const items = [
    {
      icon: icons.faGlobe,
      text: 'Show All',
      action: () => {
        navigate('/')
        search({type: 'none'});
      },
      disabled: disabledPages.includes('showall'),
    },
    {
      icon: icons.faClock,
      text: 'Years',
      action: () => navigate('/years'),
      disabled: disabledPages.includes('years'),
    },
    {
      icon: icons.faPlay,
      text: 'Videos',
      action: () => navigate('/search/type:video'),
      disabled: disabledPages.includes('video'),
    },
    {
      icon: icons.faPen,
      text: 'Edit',
      action: () => {
        if (disableEdit || appConfig.disabledEdit) {
          return
        }
        setViewMode(viewMode === ViewMode.VIEW ? ViewMode.EDIT : ViewMode.VIEW)
      },
      disabled: disableEdit || appConfig.disabledEdit || disabledPages.includes('edit'),
    },
    {
      icon: icons.faTags,
      text: 'Tags',
      action: () => {
        if (disableEdit || appConfig.disabledEdit) {
          return
        }
        navigate('/tags')
      },
      disabled: disableEdit || appConfig.disabledEdit || disabledPages.includes('tag'),
    },
    {
      icon: icons.faMap,
      text: 'Map',
      action: () => navigate('/map', {state: {listLocation}}),
      disabled: disabledPages.includes('map'),
    },
  ]

  return (
    <>
      {items
          .filter(item => !item.disabled)
          .map((item, key) => (
        <NavItem key={key} onClick={item.action} icon={item.icon} text={item.text} disabled={item.disabled}/>
      ))}
    </>
  )
}
