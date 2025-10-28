import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import MainLayout from '@/layouts/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field'
import { Separator } from '@/components/ui/separator'
import { Settings, Lock, Save, RotateCcw } from 'lucide-react'
import { useSettings, useUpdateSettings } from '@/hooks/useSettings'
import { useAuth } from '@/contexts/AuthContext'

const settingsSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  company_phone: z.string().min(1, 'Company phone is required'),
  company_address: z.string().min(1, 'Company address is required'),
  label_remarks: z.string().min(1, 'Label remarks are required'),
  label_company_name: z.string().min(1, 'Label company name is required'),
  label_company_phone: z.string().min(1, 'Label company phone is required'),
  label_company_address: z.string().min(1, 'Label company address is required'),
  default_delivery_fee: z.string().min(1, 'Default delivery fee is required'),
  default_cod_amount: z.string().min(1, 'Default COD amount is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  notification_email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  notification_phone: z.string().optional(),
})

type SettingsFormValues = z.infer<typeof settingsSchema>

export const Route = createFileRoute('/settings/')({
  component: SettingsPage,
})

function SettingsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { data: settings, isLoading } = useSettings()
  const updateSettingsMutation = useUpdateSettings()
  const [isAdmin, setIsAdmin] = useState(false)

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      company_name: '',
      company_phone: '',
      company_address: '',
      label_remarks: '',
      label_company_name: '',
      label_company_phone: '',
      label_company_address: '',
      default_delivery_fee: '',
      default_cod_amount: '',
      timezone: '',
      notification_email: '',
      notification_phone: '',
    },
  })

  // Check if user is admin
  useEffect(() => {
    if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
      setIsAdmin(true)
    }
  }, [user])

  // Load settings into form
  useEffect(() => {
    if (settings) {
      form.reset(settings)
    }
  }, [settings, form])

  const onSubmit = async (values: SettingsFormValues) => {
    try {
      await updateSettingsMutation.mutateAsync(values)
    } catch (error) {
      console.error('Error updating settings:', error)
    }
  }

  const handleReset = () => {
    if (settings) {
      form.reset(settings)
    }
  }

  // Show loading while checking auth
  if (authLoading || isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  // Show access denied for non-admin users
  if (!isAdmin) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center max-w-md">
            <div className="bg-destructive/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Lock className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-6">
              Sorry, you don't have permission to access this page. Only administrators can view and modify settings.
            </p>
            <Button onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            System Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your company information and system preferences
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Basic company details used throughout the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldSet>
                <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="company_name">
                      Company Name <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      id="company_name"
                      placeholder="Enter company name"
                      {...form.register('company_name')}
                    />
                    {form.formState.errors.company_name && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.company_name.message}
                      </p>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="company_phone">
                      Company Phone <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      id="company_phone"
                      placeholder="Enter company phone"
                      {...form.register('company_phone')}
                    />
                    {form.formState.errors.company_phone && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.company_phone.message}
                      </p>
                    )}
                  </Field>
                </FieldGroup>

                <Field>
                  <FieldLabel htmlFor="company_address">
                    Company Address <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Textarea
                    id="company_address"
                    placeholder="Enter company address"
                    rows={3}
                    {...form.register('company_address')}
                  />
                  {form.formState.errors.company_address && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.company_address.message}
                    </p>
                  )}
                </Field>
              </FieldSet>
            </CardContent>
          </Card>

          {/* Label Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Label Settings</CardTitle>
              <CardDescription>
                Information displayed on package labels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldSet>
                <Field>
                  <FieldLabel htmlFor="label_remarks">
                    Label Remarks <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Textarea
                    id="label_remarks"
                    placeholder="Enter remarks that appear on package labels"
                    rows={4}
                    {...form.register('label_remarks')}
                  />
                  {form.formState.errors.label_remarks && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.label_remarks.message}
                    </p>
                  )}
                </Field>

                <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="label_company_name">
                      Label Company Name <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      id="label_company_name"
                      placeholder="Company name on labels"
                      {...form.register('label_company_name')}
                    />
                    {form.formState.errors.label_company_name && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.label_company_name.message}
                      </p>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="label_company_phone">
                      Label Company Phone <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      id="label_company_phone"
                      placeholder="Company phone on labels"
                      {...form.register('label_company_phone')}
                    />
                    {form.formState.errors.label_company_phone && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.label_company_phone.message}
                      </p>
                    )}
                  </Field>
                </FieldGroup>

                <Field>
                  <FieldLabel htmlFor="label_company_address">
                    Label Company Address <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id="label_company_address"
                    placeholder="Company address on labels"
                    {...form.register('label_company_address')}
                  />
                  {form.formState.errors.label_company_address && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.label_company_address.message}
                    </p>
                  )}
                </Field>
              </FieldSet>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Default values and system configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldSet>
                <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="default_delivery_fee">
                      Default Delivery Fee ($) <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      id="default_delivery_fee"
                      placeholder="0.00"
                      {...form.register('default_delivery_fee')}
                    />
                    {form.formState.errors.default_delivery_fee && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.default_delivery_fee.message}
                      </p>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="default_cod_amount">
                      Default COD Amount ($) <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      id="default_cod_amount"
                      placeholder="0.00"
                      {...form.register('default_cod_amount')}
                    />
                    {form.formState.errors.default_cod_amount && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.default_cod_amount.message}
                      </p>
                    )}
                  </Field>
                </FieldGroup>

                <Field>
                  <FieldLabel htmlFor="timezone">
                    Timezone <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id="timezone"
                    placeholder="Asia/Phnom_Penh"
                    {...form.register('timezone')}
                  />
                  {form.formState.errors.timezone && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.timezone.message}
                    </p>
                  )}
                </Field>
              </FieldSet>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Contact information for system notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldSet>
                <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="notification_email">Notification Email</FieldLabel>
                    <Input
                      id="notification_email"
                      type="email"
                      placeholder="admin@company.com"
                      {...form.register('notification_email')}
                    />
                    {form.formState.errors.notification_email && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.notification_email.message}
                      </p>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="notification_phone">Notification Phone</FieldLabel>
                    <Input
                      id="notification_phone"
                      placeholder="+855 12 345 678"
                      {...form.register('notification_phone')}
                    />
                    {form.formState.errors.notification_phone && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.notification_phone.message}
                      </p>
                    )}
                  </Field>
                </FieldGroup>
              </FieldSet>
            </CardContent>
          </Card>

          <Separator />

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={updateSettingsMutation.isPending}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              type="submit"
              disabled={updateSettingsMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {updateSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}
