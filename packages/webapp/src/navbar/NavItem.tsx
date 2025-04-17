import * as React from "react"
import { MouseEventHandler } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconDefinition } from '@fortawesome/free-solid-svg-icons'

import { classNames } from '../utils/class-names'

type NavItemProps = {
  onClick: MouseEventHandler
  icon: IconDefinition
  text?: string
  smText?: string
  disabled?: boolean
}

export const NavItem = ({onClick, icon, text, smText, disabled}: NavItemProps) => {
  return (
    <a className={classNames(
      'flex gap-2 items-center justify-center px-2 py-2 rounded shadow  ',
        'bg-light-600 text-light-50 hover:bg-light-500 hover:text-light-50 hover:cursor-pointer active:bg-light-700 active:text-light-50')}
      onClick={onClick}>
      <FontAwesomeIcon icon={icon} />
      <span className="max-md:hidden whitespace-nowrap">{text}</span>
      {smText && (
        <span className="md:hidden">{smText}</span>
      )}
    </a>
  )
}