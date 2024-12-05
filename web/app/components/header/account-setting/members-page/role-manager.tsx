import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { Menu } from '@headlessui/react'
import { Check, ChevronDown } from '@heroicons/react/20/solid'
import { useProviderContext } from '@/context/provider-context'
import { notify } from '@/app/components/base/notify'

type Role = 'owner' | 'admin' | 'editor' | 'normal' | 'dataset_operator'

interface RoleManagerProps {
  currentRole: Role
  memberId: string
  onRoleChange: (newRole: Role) => void
}

const RoleManager = ({ currentRole, memberId, onRoleChange }: RoleManagerProps) => {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  const { datasetOperatorEnabled } = useProviderContext()

  const roles: Role[] = [
    'owner',
    'admin',
    'editor',
    'normal',
    ...(datasetOperatorEnabled ? ['dataset_operator'] : []),
  ] as Role[]

  const handleRoleChange = async (newRole: Role) => {
    if (newRole === currentRole) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/workspaces/current/members/${memberId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        throw new Error('Failed to update role')
      }

      onRoleChange(newRole)
      notify({ type: 'success', message: t('common.actionMsg.modifiedSuccessfully') })
    } catch (error) {
      notify({ type: 'error', message: t('common.actionMsg.modificationFailed') })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Menu as="div" className="relative">
      <Menu.Button
        disabled={isLoading}
        className="flex items-center justify-between w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        {t(`common.members.${currentRole}`)}
        <ChevronDown className="w-4 h-4 ml-2" />
      </Menu.Button>

      <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
        <div className="py-1">
          {roles.map((role) => (
            <Menu.Item key={role}>
              {({ active }) => (
                <button
                  onClick={() => handleRoleChange(role)}
                  className={`
                    ${active ? 'bg-gray-100' : ''} 
                    ${currentRole === role ? 'bg-primary-50' : ''}
                    group flex w-full items-center px-4 py-2 text-sm text-gray-700
                  `}
                >
                  <span className="flex-grow">{t(`common.members.${role}`)}</span>
                  {currentRole === role && (
                    <Check className="w-4 h-4 text-primary-600" />
                  )}
                </button>
              )}
            </Menu.Item>
          ))}
        </div>
      </Menu.Items>
    </Menu>
  )
}

export default RoleManager 