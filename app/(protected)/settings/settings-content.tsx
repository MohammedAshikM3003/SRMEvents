'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { NotificationContact, Settings } from '@/lib/types'
import { sendOtp, verifyOtp, sendMasterVerification, verifyMasterOtp, sendMasterReminder } from '@/app/actions/otp'
import { motion } from 'framer-motion'
import { ShieldCheck, Mail, Bell, Settings2, Trash2, TerminalSquare, Languages } from 'lucide-react'
import { useTranslation } from '@/components/language-provider'
import { LanguageToggle } from '@/components/language-toggle'

interface SettingsContentProps {
  contacts: NotificationContact[]
  settings: Settings | null
  userId: string
}

export function SettingsContent({ contacts, settings, userId }: SettingsContentProps) {
  const { t } = useTranslation()
  const [reminderDays, setReminderDays] = useState(settings?.reminder_days_before ?? 7)
  const [reminderTime, setReminderTime] = useState(settings?.reminder_time ?? '09:00')
  const [newContactValue, setNewContactValue] = useState('')
  const [isAddingContact, setIsAddingContact] = useState(false)
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [showOtpDialog, setShowOtpDialog] = useState(false)
  const [otp, setOtp] = useState('')
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [otpError, setOtpError] = useState<string | null>(null)
  const [masterStatus, setMasterStatus] = useState<'unverified' | 'verifying' | 'verified'>('unverified')
  const [masterOtp, setMasterOtp] = useState('')
  const [masterError, setMasterError] = useState<string | null>(null)
  const [isSendingMasterReminder, setIsSendingMasterReminder] = useState(false)
  const router = useRouter()

  const handleSendMasterVerification = async () => {
    setMasterStatus('verifying')
    setMasterError(null)
    const res = await sendMasterVerification(userId)
    if (!res.success) {
      setMasterError(res.error || 'Failed to send master OTP')
      setMasterStatus('unverified')
    }
  }

  const handleVerifyMasterOtp = async () => {
    if (masterOtp.length !== 6) return
    setMasterError(null)
    const res = await verifyMasterOtp(masterOtp, userId)
    if (res.success) {
      setMasterStatus('verified')
      setMasterOtp('')
    } else {
      setMasterError(res.error || 'Invalid OTP')
    }
  }

  const handleSendMasterReminder = async () => {
    setIsSendingMasterReminder(true)
    setMasterError(null)
    const res = await sendMasterReminder(userId)
    if (!res.success) {
      setMasterError(res.error || 'Failed to send reminder')
    } else {
      alert('Mock Reminder Sent Successfully!')
    }
    setIsSendingMasterReminder(false)
  }

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newContactValue.trim()) return

    setIsAddingContact(true)
    setOtpError(null)

    const result = await sendOtp('email', newContactValue.trim(), userId)
    
    setIsAddingContact(false)

    if (result.success) {
      setShowOtpDialog(true)
    } else {
      setOtpError(result.error || 'Failed to send OTP')
    }
  }

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return
    setIsVerifyingOtp(true)
    setOtpError(null)

    const result = await verifyOtp('email', newContactValue.trim(), otp, userId)
    
    setIsVerifyingOtp(false)

    if (result.success) {
      setShowOtpDialog(false)
      setNewContactValue('')
      setOtp('')
      router.refresh()
    } else {
      setOtpError(result.error || 'Invalid OTP')
    }
  }

  const handleToggleContact = async (contact: NotificationContact) => {
    const supabase = createClient()
    await supabase
      .from('notification_contacts')
      .update({ is_active: !contact.is_active })
      .eq('id', contact.id)
    router.refresh()
  }

  const handleDeleteContact = async (contactId: string) => {
    const supabase = createClient()
    await supabase.from('notification_contacts').delete().eq('id', contactId)
    router.refresh()
  }

  const handleSaveSettings = async () => {
    setIsSavingSettings(true)
    const supabase = createClient()

    try {
      if (settings) {
        await supabase
          .from('settings')
          .update({ 
            reminder_days_before: reminderDays,
            reminder_time: reminderTime
          })
          .eq('id', settings.id)
      } else {
        await supabase.from('settings').insert({
          user_id: userId,
          reminder_days_before: reminderDays,
          reminder_time: reminderTime
        })
      }
      router.refresh()
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setIsSavingSettings(false)
    }
  }

  const emailContacts = contacts.filter(c => c.contact_type === 'email')

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.3, duration: 0.4 } }
  }

  const hours = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0')
    return {
      label: `${hour}:00`,
      value: `${hour}:00`
    }
  })

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-8 relative z-10"
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-black to-black/60">
            {t('system_settings')}
          </h1>
          <p className="text-black/60 mt-2 text-lg">{t('manage_notifications')}</p>
        </div>
      </motion.div>

      <div className="flex flex-col gap-8">
        
        {/* Reminder Settings */}
        <motion.div variants={itemVariants} className="glass-card">
          <div className="p-6 border-b border-black/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-black">{t('reminders')}</h2>
                <p className="text-black/60 text-sm">Configure your alert timing</p>
              </div>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="grid gap-3">
              <Label htmlFor="reminder_days" className="text-black/80">{t('days_before_event')}</Label>
              <Select
                value={reminderDays.toString()}
                onValueChange={(value) => setReminderDays(parseInt(value))}
              >
                <SelectTrigger className="bg-black/5 border-black/10 text-black h-12 rounded-xl focus:ring-primary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-black/10 text-black">
                  <SelectItem value="1">1 day prior</SelectItem>
                  <SelectItem value="3">3 days prior</SelectItem>
                  <SelectItem value="5">5 days prior</SelectItem>
                  <SelectItem value="7">1 week prior</SelectItem>
                  <SelectItem value="14">2 weeks prior</SelectItem>
                  <SelectItem value="30">1 month prior</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="reminder_time" className="text-black/80">{t('preferred_time')}</Label>
                <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-black/10 text-black/40">Hobby Plan: Daily @ 7AM UTC</Badge>
              </div>
              <Select
                value={reminderTime}
                onValueChange={setReminderTime}
                disabled // Disabling since it's fixed on Hobby
              >
                <SelectTrigger className="bg-black/5 border-black/10 text-black h-12 rounded-xl focus:ring-primary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-black/10 text-black">
                  {hours.map((h) => (
                    <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="p-6 pt-0">
            <Button onClick={handleSaveSettings} disabled={isSavingSettings} className="w-full sm:w-auto h-12 rounded-xl bg-black/5 hover:bg-black/10 text-black border border-black/10">
              {isSavingSettings ? t('saving_preferences') : t('save_preferences')}
            </Button>
          </div>
        </motion.div>

        {/* Compact Language Bar */}
        <motion.div 
          variants={itemVariants} 
          className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 px-6 py-4 md:h-20 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center">
              <Languages className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-lg font-bold text-black leading-tight">{t('language')}</h2>
              <p className="text-black/40 text-xs">{t('select_language')}</p>
            </div>
          </div>
          <LanguageToggle />
        </motion.div>

        {/* Add Contact */}
        <motion.div variants={itemVariants} className="glass-card">
          <div className="p-6 border-b border-black/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-black">{t('add_contact')}</h2>
                <p className="text-black/60 text-sm">Add emails for notifications</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <form onSubmit={handleAddContact} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-black/80">{t('email_address')}</Label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={newContactValue}
                  onChange={(e) => setNewContactValue(e.target.value)}
                  className="bg-black/5 border-black/10 text-black h-12 rounded-xl focus-visible:ring-primary/50"
                />
                {otpError && !showOtpDialog && <p className="text-sm text-red-600 mt-1">{otpError}</p>}
              </div>
              <Button type="submit" disabled={isAddingContact || !newContactValue.trim()} className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 mt-2">
                {isAddingContact ? 'Sending Verification...' : t('add_email')}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>

      {/* Email Contacts List */}
      <motion.div variants={itemVariants} className="glass-card">
        <div className="p-6 border-b border-black/5">
          <h2 className="text-2xl font-bold text-black">{t('active_contacts')}</h2>
          <p className="text-black/60 text-sm">Manage where notifications are sent</p>
        </div>
        <div className="p-6">
          {emailContacts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center mx-auto mb-4">
                <Settings2 className="w-8 h-8 text-black/20" />
              </div>
              <p className="text-black/60 text-lg">
                {t('no_contacts')}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {emailContacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-3 sm:p-5 rounded-2xl bg-black/5 border border-black/10 hover:bg-black/10 transition-colors group gap-2 sm:gap-4 overflow-hidden">
                  <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                    <div className="shrink-0 scale-90 sm:scale-100">
                      <Switch
                        checked={contact.is_active}
                        onCheckedChange={() => handleToggleContact(contact)}
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-4 min-w-0 overflow-hidden">
                      <span className={cn(
                        'font-medium truncate text-sm sm:text-base',
                        contact.is_active ? 'text-black' : 'text-black/40 line-through'
                      )}>
                        {contact.contact_value}
                      </span>
                      <div className="flex shrink-0">
                        {contact.is_active ? (
                          <Badge className="bg-primary/20 text-primary border-primary/20 text-[9px] sm:text-[10px] h-4 sm:h-5">Active</Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-black/10 text-black/50 text-[9px] sm:text-[10px] h-4 sm:h-5">Paused</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 text-black/40 hover:text-red-600 hover:bg-red-600/10 rounded-full transition-all">
                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white border-black/10 text-black">
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('remove_contact')}</AlertDialogTitle>
                          <AlertDialogDescription className="text-black/60">
                            {t('are_you_sure')} You will stop receiving reminders at <span className="text-black font-semibold">{contact.contact_value}</span>.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-transparent border-black/10 text-black hover:bg-black/5">{t('keep')}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteContact(contact.id)} className="bg-red-50 hover:bg-red-600 text-white">
                            {t('remove')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* OTP Verification Dialog */}
      <Dialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
        <DialogContent className="bg-white backdrop-blur-xl border-black/10 text-black sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Verify your email</DialogTitle>
            <DialogDescription className="text-black/60">
              We've sent a 6-digit code to <span className="text-black font-medium">{newContactValue}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-6 py-6">
            <InputOTP maxLength={6} value={otp} onChange={setOtp} className="gap-2">
              <InputOTPGroup className="bg-white/5 border border-white/10 rounded-xl">
                {[0,1,2,3,4,5].map(i => (
                  <InputOTPSlot key={i} index={i} className="text-black border-black/10 w-12 h-14 text-xl font-bold" />
                ))}
              </InputOTPGroup>
            </InputOTP>
            {otpError && <p className="text-sm text-red-600 bg-red-500/5 p-3 rounded-lg border border-red-500/10 w-full text-center">{otpError}</p>}
            <Button onClick={handleVerifyOtp} disabled={isVerifyingOtp || otp.length !== 6} className="w-full h-12 rounded-xl text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
              {isVerifyingOtp ? 'Verifying...' : 'Confirm & Add'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
