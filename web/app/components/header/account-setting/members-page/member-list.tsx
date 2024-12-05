import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import RoleManager from './role-manager'
import { notify } from '@/app/components/base/notify'

interface Member {
  id: string
  name: string
  email: string
  role: string
  status: string
}

const MemberList = () => {
  const { t } = useTranslation()
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/workspaces/current/members')
      if (!response.ok) throw new Error('Failed to fetch members')
      
      const data = await response.json()
      setMembers(data.members)
    } catch (error) {
      notify({ type: 'error', message: t('common.actionMsg.fetchFailed') })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleChange = async (memberId: string, newRole: string) => {
    const updatedMembers = members.map(member => 
      member.id === memberId ? { ...member, role: newRole } : member
    )
    setMembers(updatedMembers)
  }

  if (isLoading) {
    return <div className="flex justify-center p-4">{t('common.loading')}</div>
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-5 sm:p-6">
        <div className="flow-root">
          <ul role="list" className="-my-5 divide-y divide-gray-200">
            {members.map((member) => (
              <li key={member.id} className="py-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-500">
                      <span className="text-sm font-medium leading-none text-white">
                        {member.name[0]}
                      </span>
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{member.name}</p>
                    <p className="truncate text-sm text-gray-500">{member.email}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <RoleManager
                      currentRole={member.role as any}
                      memberId={member.id}
                      onRoleChange={(newRole) => handleRoleChange(member.id, newRole)}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default MemberList 