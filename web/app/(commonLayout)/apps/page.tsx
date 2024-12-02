'use client'
import { useContextSelector } from 'use-context-selector'
import { useTranslation } from 'react-i18next'
import style from '../list.module.css'
import Apps from './Apps'
import classNames from '@/utils/classnames'
import AppContext from '@/context/app-context'
import { LicenseStatus } from '@/types/feature'

const AppList = () => {
  const { t } = useTranslation()
  const systemFeatures = useContextSelector(AppContext, v => v.systemFeatures)

  return (
    <div className='relative flex flex-col overflow-y-auto bg-gray-100 shrink-0 h-0 grow'>
      <Apps />
      {systemFeatures.license.status === LicenseStatus.NONE && <footer className='px-12 py-6 grow-0 shrink-0'>
        © {new Date().getFullYear()} Mindverse.
      </footer>}
    </div >
  )
}

export default AppList
