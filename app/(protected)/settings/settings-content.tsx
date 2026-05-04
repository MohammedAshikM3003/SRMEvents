'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
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
import { ShieldCheck, Mail, Bell, Settings2, Trash2, TerminalSquare } from 'lucide-react'

interface SettingsContentProps {
  contacts: NotificationContact[]
  settings: Settings | null
  userId: string
}

export function SettingsContent({ contacts, settings, userId }: SettingsContentProps) {
  const [reminderDays, setReminderDays] = useState(settings?.reminder_days_before ?? 7)
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
          .update({ reminder_days_before: reminderDays })
          .eq('id', settings.id)
      } else {
        await supabase.from('settings').insert({
          user_id: userId,
          reminder_days_before: reminderDays,
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
            System Settings
          </h1>
          <p className="text-black/60 mt-2 text-lg">Manage notification channels and preferences</p>
        </div>
      </motion.div>

      {/* Command Center */}
      <motion.div variants={itemVariants} className="glass-card overflow-hidden relative border-indigo-500/30">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
        <div className="p-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                <TerminalSquare className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-black tracking-tight">Command Center</h2>
                <p className="text-indigo-800/70 text-sm mt-1">Verify production bridge with Master Contacts.</p>
              </div>
            </div>
            {masterStatus === 'verified' ? (
              <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border border-green-500/30 px-4 py-1.5 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                <ShieldCheck className="w-4 h-4 mr-2" /> System Armed
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-black/5 text-black/50 border border-black/10 px-4 py-1.5">
                Unverified
              </Badge>
            )}
          </div>

          {masterStatus === 'unverified' && (
            <Button onClick={handleSendMasterVerification} className="bg-indigo-600 hover:bg-indigo-500 text-white w-full md:w-auto h-12 px-6 rounded-xl shadow-lg shadow-indigo-500/20">
              Verify System Connection
            </Button>
          )}

          {masterStatus === 'verifying' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex flex-col gap-4">
              <p className="text-sm text-indigo-800">A 6-digit code has been sent to the Master Email.</p>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <InputOTP maxLength={6} value={masterOtp} onChange={setMasterOtp} className="gap-2">
                  <InputOTPGroup className="bg-black/5 border border-black/10 rounded-xl">
                    {[0,1,2,3,4,5].map(i => (
                      <InputOTPSlot key={i} index={i} className="text-black border-black/10 w-12 h-14 text-xl" />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
                <div className="flex gap-2">
                  <Button onClick={handleVerifyMasterOtp} disabled={masterOtp.length !== 6} className="bg-indigo-600 hover:bg-indigo-500 text-white h-14 px-6 rounded-xl">
                    Authorize
                  </Button>
                  <Button variant="ghost" onClick={() => setMasterStatus('unverified')} className="text-black/50 hover:text-black hover:bg-black/10 h-14 rounded-xl">
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {masterStatus === 'verified' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-6 border-t border-black/10 mt-6">
              <Button onClick={handleSendMasterReminder} disabled={isSendingMasterReminder} className="bg-green-600 hover:bg-green-500 text-white w-full md:w-auto h-12 px-6 rounded-xl shadow-lg shadow-green-900/20">
                <Mail className="w-4 h-4 mr-2" />
                {isSendingMasterReminder ? 'Sending Mock Reminder...' : 'Trigger Test Reminder Email'}
              </Button>
            </motion.div>
          )}

          {masterError && <p className="text-sm text-red-600 mt-4 bg-red-500/5 p-3 rounded-lg border border-red-500/10">{masterError}</p>}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Reminder Settings */}
        <motion.div variants={itemVariants} className="glass-card">
          <div className="p-6 border-b border-black/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-black">Reminders</h2>
                <p className="text-black/60 text-sm">Configure your alert timing</p>
              </div>
            </div>
          </div>
          <div className="p-6 flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="reminder_days" className="text-black/80">Days Before Event to Notify</Label>
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
            <Button onClick={handleSaveSettings} disabled={isSavingSettings} className="w-full sm:w-auto h-12 rounded-xl bg-black/5 hover:bg-black/10 text-black border border-black/10">
              {isSavingSettings ? 'Saving Preferences...' : 'Save Preferences'}
            </Button>
          </div>
        </motion.div>

        {/* Add Contact */}
        <motion.div variants={itemVariants} className="glass-card">
          <div className="p-6 border-b border-black/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-black">Add Contact</h2>
                <p className="text-black/60 text-sm">Add emails for notifications</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <form onSubmit={handleAddContact} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-black/80">Email Address</Label>
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
                {isAddingContact ? 'Sending Verification...' : 'Add Email Contact'}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>

      {/* Email Contacts List */}
      <motion.div variants={itemVariants} className="glass-card">
        <div className="p-6 border-b border-black/5">
          <h2 className="text-2xl font-bold text-black">Active Contacts</h2>
          <p className="text-black/60 text-sm">Manage where notifications are sent</p>
        </div>
        <div className="p-6">
          {emailContacts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center mx-auto mb-4">
                <Settings2 className="w-8 h-8 text-black/20" />
              </div>
              <p className="text-black/60 text-lg">
                No active contacts. Add an email above.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {emailContacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-black/5 border border-black/10 hover:bg-black/10 transition-colors group">
                  <div className="flex items-center gap-4">
                    <Switch
                      checked={contact.is_active}
                      onCheckedChange={() => handleToggleContact(contact)}
                      className="data-[state=checked]:bg-primary"
                    />
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <span className={contact.is_active ? 'text-black font-medium' : 'text-black/40 line-through'}>
                        {contact.contact_value}
                      </span>
                      {contact.is_active ? (
                        <Badge className="bg-primary/20 text-primary border-primary/20 w-fit">Active</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-black/10 text-black/50 w-fit">Paused</Badge>
                      )}
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-black/40 hover:text-red-600 hover:bg-red-600/10 rounded-full opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-white border-black/10 text-black">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Contact</AlertDialogTitle>
                        <AlertDialogDescription className="text-black/60">
                          Are you sure? You will stop receiving reminders at <span className="text-black font-semibold">{contact.contact_value}</span>.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-black/10 text-black hover:bg-black/5">Keep</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteContact(contact.id)} className="bg-red-500 hover:bg-red-600 text-white">
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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
