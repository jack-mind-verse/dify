'use client'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import type { SubmitHandler } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Loading from '../components/base/loading'
import classNames from '@/utils/classnames'
import Button from '@/app/components/base/button'
import Toast from '../components/base/toast'

import { fetchInitValidateStatus, fetchSetupStatus, setup } from '@/service/common'
import type { InitValidateStatusResponse, SetupStatusResponse } from '@/models/common'

const validPassword = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/

const accountFormSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'login.error.emailInValid' })
    .email('login.error.emailInValid'),
  name: z.string().min(1, { message: 'login.error.nameEmpty' }),
  password: z.string().min(8, {
    message: 'login.error.passwordLengthInValid',
  }).regex(validPassword, 'login.error.passwordInvalid'),
})

type AccountFormValues = z.infer<typeof accountFormSchema>

const InstallForm = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const [showPassword, setShowPassword] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: '',
      password: '',
      email: '',
    },
  })

  const onSubmit: SubmitHandler<AccountFormValues> = async (data) => {
    if (isSubmitting) return
    
    setIsSubmitting(true)
    try {
      const initStatus = await fetchInitValidateStatus()
      if (initStatus.status === 'not_started') {
        Toast.notify({
          type: 'error',
          message: t('login.error.initRequired'),
          duration: 5000,
        })
        window.location.href = '/init'
        return
      }

      const response = await setup({
        body: {
          ...data,
        },
      })
      
      if (response.result === 'success') {
        try {
          const loginResponse = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: data.email,
              password: data.password,
            }),
          })

          if (loginResponse.ok) {
            Toast.notify({
              type: 'success',
              message: t('common.actionMsg.modifiedSuccessfully'),
              duration: 3000,
            })
            setTimeout(() => {
              router.push('/signin')
            }, 2000)
          } else {
            throw new Error('Account creation failed')
          }
        } catch (loginError) {
          throw new Error(t('login.error.accountCreationFailed'))
        }
      } else {
        throw new Error(response.message || t('common.error.unknown'))
      }
    } catch (error: any) {
      console.error('Setup error:', error)
      Toast.notify({
        type: 'error',
        message: error.message || t('common.error.unknown'),
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSetting = async () => {
    handleSubmit(onSubmit)()
  }

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const initRes: InitValidateStatusResponse = await fetchInitValidateStatus()
        if (initRes.status === 'not_started') {
          window.location.href = '/init'
          return
        }
        setLoading(false)
      } catch (error) {
        console.error('Status check failed:', error)
        Toast.notify({
          type: 'error',
          message: t('common.error.unknown'),
          duration: 5000,
        })
        setLoading(false)
      }
    }

    checkStatus()
  }, [t])

  return (
    loading
      ? <Loading />
      : <>
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-[32px] font-bold text-gray-900">{t('login.setAdminAccount')}</h2>
          <p className='
          mt-1 text-sm text-gray-600
        '>{t('login.setAdminAccountDesc')}</p>
        </div>
        <div className="grow mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white ">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  {t('login.email')}
                </label>
                <div className="mt-1">
                  <input
                    {...register('email')}
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder={t('login.emailPlaceholder') || ''}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {t(errors.email.message as string)}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  {t('login.name')}
                </label>
                <div className="mt-1">
                  <input
                    {...register('name')}
                    type="text"
                    autoComplete="name"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder={t('login.namePlaceholder') || ''}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {t(errors.name.message as string)}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  {t('login.password')}
                </label>
                <div className="mt-1 relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm pr-10"
                    placeholder={t('login.passwordPlaceholder') || ''}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 px-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '👀' : '😝'}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {t(errors.password.message as string)}
                  </p>
                )}
              </div>

              <div>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full flex justify-center py-2 px-4"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t('common.loading') : t('login.installBtn')}
                </Button>
              </div>
            </form>
            <div className="block w-full mt-2 text-xs text-gray-600">
              {t('login.license.tip')}
              &nbsp;
              <Link
                className='text-primary-600'
                target='_blank' rel='noopener noreferrer'
                href={'https://docs.dify.ai/user-agreement/open-source'}
              >{t('login.license.link')}</Link>
            </div>
          </div>
        </div>
      </>
  )
}

export default InstallForm
