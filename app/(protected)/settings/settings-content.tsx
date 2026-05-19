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
import { motion, type Variants } from 'framer-motion'
import { Mail, Bell, Settings2, Trash2, Languages, Save, PlusCircle, CheckCircle2, ShieldCheck, TerminalSquare, AlertCircle } from 'lucide-react'
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
  
  // Master Control State
  const [masterStatus, setMasterStatus] = useState<'unverified' | 'verifying' | 'verified'>('unverified')
  const [masterOtp, setMasterOtp] = useState('')
  const [masterError, setMasterError] = useState<string | null>(null)
  const [isSendingMasterReminder, setIsSendingMasterReminder] = useState(false)

  const router = useRouter()

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
            reminder_days_before: reminderDays
          })
          .eq('id', settings.id)
      } else {
        await supabase.from('settings').insert({
          user_id: userId,
          reminder_days_before: reminderDays
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

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.3, duration: 0.5 } }
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
      className="max-w-4xl mx-auto flex flex-col gap-10 relative z-10 pb-20"
    >
      <motion.div variants={itemVariants} className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-black tracking-tight leading-none">
          {t('system_settings')}
        </h1>
        <p className="text-black/50 text-lg font-medium">{t('manage_notifications')}</p>
      </motion.div>

      <div className="grid gap-10">
        
        {/* Language Selection - Premium Refactored */}
        <motion.div variants={itemVariants} className="bg-white border border-black/[0.03] rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-500">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0">
                <Languages className="w-7 h-7 text-indigo-600" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-2xl font-bold text-black tracking-tight">{t('language')}</h2>
                <p className="text-black/40 text-sm font-medium">{t('select_language')}</p>
              </div>
            </div>
            <div className="w-full md:w-auto">
              <LanguageToggle />
            </div>
          </div>
        </motion.div>

        {/* Reminder Settings */}
        <motion.div variants={itemVariants} className="bg-white border border-black/[0.03] rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-500">
          <div className="p-8 border-b border-black/[0.03] bg-black/[0.01]">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
                <Bell className="w-7 h-7 text-amber-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-black tracking-tight">{t('reminders')}</h2>
                <p className="text-black/40 text-sm font-medium">Configure your alert timing and frequency</p>
              </div>
            </div>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <Label htmlFor="reminder_days" className="text-black/70 font-bold text-sm uppercase tracking-wider">{t('days_before_event')}</Label>
              <Select
                value={reminderDays.toString()}
                onValueChange={(value) => setReminderDays(parseInt(value))}
              >
                <SelectTrigger className="bg-black/5 border-transparent text-black h-14 rounded-2xl focus:ring-primary/20 hover:bg-black/[0.07] transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-black/5 text-black rounded-2xl shadow-xl p-2">
                  <SelectItem value="1" className="rounded-xl">1 day prior</SelectItem>
                  <SelectItem value="3" className="rounded-xl">3 days prior</SelectItem>
                  <SelectItem value="5" className="rounded-xl">5 days prior</SelectItem>
                  <SelectItem value="7" className="rounded-xl">1 week prior</SelectItem>
                  <SelectItem value="14" className="rounded-xl">2 weeks prior</SelectItem>
                  <SelectItem value="30" className="rounded-xl">1 month prior</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="reminder_time" className="text-black/70 font-bold text-sm uppercase tracking-wider">{t('preferred_time')}</Label>
                <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-black/5 bg-black/5 text-black/40 px-2 py-0.5 rounded-full">Hobby: 7AM UTC</Badge>
              </div>
              <Select
                value={reminderTime}
                onValueChange={setReminderTime}
                disabled 
              >
                <SelectTrigger className="bg-black/5 border-transparent text-black h-14 rounded-2xl opacity-60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-black/5 text-black rounded-2xl shadow-xl p-2">
                  {hours.map((h) => (
                    <SelectItem key={h.value} value={h.value} className="rounded-xl">{h.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="p-8 pt-0 flex justify-end">
            <Button 
              onClick={handleSaveSettings} 
              disabled={isSavingSettings} 
              className="min-w-[200px] h-14 rounded-2xl bg-black text-white hover:bg-black/90 transition-all font-bold text-base shadow-lg shadow-black/10 group"
            >
              {isSavingSettings ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                  {t('saving_preferences')}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                  {t('save_preferences')}
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Notification Contacts */}
        <motion.div variants={itemVariants} className="bg-white border border-black/[0.03] rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-500">
          <div className="p-8 border-b border-black/[0.03] bg-black/[0.01]">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                <Mail className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-black tracking-tight">{t('active_contacts')}</h2>
                <p className="text-black/40 text-sm font-medium">Manage where system notifications are delivered</p>
              </div>
            </div>
          </div>

          <div className="p-8 flex flex-col gap-8">
            {/* Add Contact Form */}
            <form onSubmit={handleAddContact} className="flex flex-col sm:flex-row gap-4 items-end bg-black/[0.02] p-6 rounded-3xl border border-black/[0.03]">
              <div className="flex-1 space-y-3 w-full">
                <Label className="text-black/70 font-bold text-sm uppercase tracking-wider ml-1">{t('add_contact')}</Label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={newContactValue}
                  onChange={(e) => setNewContactValue(e.target.value)}
                  className="bg-white border-transparent text-black h-14 rounded-2xl focus-visible:ring-primary/20 shadow-sm transition-all"
                />
              </div>
              <Button 
                type="submit" 
                disabled={isAddingContact || !newContactValue.trim()} 
                className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all shrink-0 w-full sm:w-auto"
              >
                {isAddingContact ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <PlusCircle className="w-5 h-5 mr-2" />
                    {t('add_email')}
                  </>
                )}
              </Button>
            </form>
            {otpError && !showOtpDialog && (
              <p className="text-sm font-bold text-red-500 bg-red-50 px-4 py-2 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-1">
                {otpError}
              </p>
            )}

            {/* List */}
            <div className="space-y-4">
              {emailContacts.length === 0 ? (
                <div className="text-center py-16 bg-black/[0.01] rounded-3xl border border-dashed border-black/10">
                  <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center mx-auto mb-4">
                    <Settings2 className="w-8 h-8 text-black/10" />
                  </div>
                  <p className="text-black/40 font-bold">
                    {t('no_contacts')}
                  </p>
                </div>
              ) : (
                emailContacts.map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between p-4 sm:p-6 rounded-3xl bg-white border border-black/[0.04] shadow-sm hover:shadow-md hover:border-black/[0.08] transition-all duration-300 group gap-4">
                    <div className="flex items-center gap-6 min-w-0 flex-1">
                      <div className="shrink-0 flex items-center h-full">
                        <Switch
                          checked={contact.is_active}
                          onCheckedChange={() => handleToggleContact(contact)}
                          className="data-[state=checked]:bg-primary scale-110"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className={cn(
                          'font-bold text-lg truncate transition-all',
                          contact.is_active ? 'text-black' : 'text-black/30'
                        )}>
                          {contact.contact_value}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          {contact.is_active ? (
                            <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-primary">
                              <CheckCircle2 className="w-3 h-3" />
                              Active
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-black/30">
                              Paused
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-12 w-12 text-black/20 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all shrink-0">
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white border-black/10 text-black rounded-[2rem] p-8">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-2xl font-bold">{t('remove_contact')}</AlertDialogTitle>
                          <AlertDialogDescription className="text-black/50 text-lg">
                            {t('are_you_sure')} You will stop receiving reminders at <span className="text-black font-bold">{contact.contact_value}</span>.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-8 gap-4">
                          <AlertDialogCancel className="bg-black/5 border-none text-black hover:bg-black/10 h-14 rounded-2xl font-bold px-8">{t('keep')}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteContact(contact.id)} className="bg-red-600 hover:bg-red-700 text-white border-none h-14 rounded-2xl font-bold px-8 shadow-lg shadow-red-600/20">
                            {t('remove')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* OTP Verification Dialog */}
      <Dialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
        <DialogContent className="bg-white border-black/5 text-black sm:max-w-md rounded-[2.5rem] p-10 shadow-2xl">
          <DialogHeader className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="text-3xl font-black text-center tracking-tight">Verify email</DialogTitle>
            <DialogDescription className="text-black/50 text-center text-base font-medium">
              We've sent a 6-digit verification code to <span className="text-black font-bold break-all">{newContactValue}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-10 py-8">
            <InputOTP maxLength={6} value={otp} onChange={setOtp} className="gap-3">
              <InputOTPGroup>
                {[0,1,2,3,4,5].map(i => (
                  <InputOTPSlot key={i} index={i} className="text-black border-black/5 bg-black/5 w-12 h-16 sm:w-14 sm:h-18 text-2xl font-black rounded-xl" />
                ))}
              </InputOTPGroup>
            </InputOTP>
            
            {otpError && (
              <p className="text-sm font-bold text-red-500 bg-red-50 px-4 py-2 rounded-xl border border-red-100 w-full text-center">
                {otpError}
              </p>
            )}
            
            <div className="flex flex-col gap-4 w-full">
              <Button 
                onClick={handleVerifyOtp} 
                disabled={isVerifyingOtp || otp.length !== 6} 
                className="w-full h-16 rounded-2xl text-lg font-black bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 transition-all"
              >
                {isVerifyingOtp ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Confirm & Add'
                )}
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setShowOtpDialog(false)} 
                className="h-12 text-black/40 hover:text-black font-bold"
              >
                {t('cancel')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
