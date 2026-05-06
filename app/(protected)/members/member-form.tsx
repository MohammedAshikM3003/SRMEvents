'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Member } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '@/components/language-provider'

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

interface MemberFormData {
  name: string
  date_of_birth: string
  blood_group: string
  branch: string
  phone: string
  address: string
  marital_status: string
  marriage_date: string
  number_of_children: number
  child1_name: string
  child1_dob: string
  child2_name: string
  child2_dob: string
  child3_name: string
  child3_dob: string
  has_insurance: boolean
}

interface MemberFormProps {
  initialData?: Member | null
  userId: string
  onSuccess?: () => void
  mode?: 'add' | 'edit'
}

const defaultFormData: MemberFormData = {
  name: '',
  date_of_birth: '',
  blood_group: '',
  branch: '',
  phone: '',
  address: '',
  marital_status: 'single',
  marriage_date: '',
  number_of_children: 0,
  child1_name: '',
  child1_dob: '',
  child2_name: '',
  child2_dob: '',
  child3_name: '',
  child3_dob: '',
  has_insurance: false,
}

export function MemberForm({ initialData, userId, onSuccess, mode = 'add' }: MemberFormProps) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<MemberFormData>(initialData ? {
    name: initialData.name,
    date_of_birth: initialData.date_of_birth,
    blood_group: initialData.blood_group || '',
    branch: initialData.branch || '',
    phone: initialData.phone,
    address: initialData.address || '',
    marital_status: initialData.marital_status,
    marriage_date: initialData.marriage_date || '',
    number_of_children: initialData.number_of_children,
    child1_name: initialData.child1_name || '',
    child1_dob: initialData.child1_dob || '',
    child2_name: initialData.child2_name || '',
    child2_dob: initialData.child2_dob || '',
    child3_name: initialData.child3_name || '',
    child3_dob: initialData.child3_dob || '',
    has_insurance: initialData.has_insurance,
  } : defaultFormData)
  
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()

    const memberData = {
      user_id: userId,
      name: formData.name,
      date_of_birth: formData.date_of_birth,
      blood_group: formData.blood_group || null,
      branch: formData.branch || null,
      phone: formData.phone,
      address: formData.address || null,
      marital_status: formData.marital_status,
      marriage_date: formData.marital_status === 'married' ? formData.marriage_date || null : null,
      number_of_children: formData.number_of_children,
      child1_name: formData.number_of_children >= 1 ? formData.child1_name || null : null,
      child1_dob: formData.number_of_children >= 1 ? formData.child1_dob || null : null,
      child2_name: formData.number_of_children >= 2 ? formData.child2_name || null : null,
      child2_dob: formData.number_of_children >= 2 ? formData.child2_dob || null : null,
      child3_name: formData.number_of_children >= 3 ? formData.child3_name || null : null,
      child3_dob: formData.number_of_children >= 3 ? formData.child3_dob || null : null,
      has_insurance: formData.has_insurance,
    }

    try {
      if (initialData) {
        const { error } = await supabase
          .from('members')
          .update(memberData)
          .eq('id', initialData.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('members')
          .insert(memberData)
        if (error) throw error
      }

      router.refresh()
      
      // Trigger reminder check immediately in the background
      fetch('/api/cron/reminders').catch(err => console.error('Failed to trigger immediate reminder:', err))

      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/members')
      }
    } catch (error) {
      console.error('Error saving member:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link href="/members">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-4xl font-extrabold text-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-black to-black/60">
            {mode === 'add' ? t('add_member') : t('edit')}
          </h1>
          <p className="text-black/60 mt-2 text-lg">
            {mode === 'add' ? t('manage_members') : t('update_member')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Basic Details */}
        <div className="space-y-4 p-6 rounded-2xl bg-white border border-black/5 shadow-sm">
          <h3 className="text-lg font-semibold text-black/90">{t('basic_details')}</h3>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-black/70">{t('name')} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="bg-black/5 border-black/10 focus-visible:ring-primary text-black h-12 rounded-xl"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dob" className="text-black/70">{t('date_of_birth')} *</Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  required
                  className="bg-black/5 border-black/10 focus-visible:ring-primary text-black h-12 rounded-xl"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="blood_group" className="text-black/70">{t('blood_group')}</Label>
                <Select
                  value={formData.blood_group}
                  onValueChange={(value) => setFormData({ ...formData, blood_group: value })}
                >
                  <SelectTrigger className="bg-black/5 border-black/10 text-black h-12 rounded-xl">
                    <SelectValue placeholder={t('select_blood_group')} />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-black/10 text-black">
                    {bloodGroups.map((bg) => (
                      <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone" className="text-black/70">{t('phone')} *</Label>
              <div className="relative flex items-center">
                <div className="absolute left-3 flex items-center pointer-events-none">
                  <span className="text-black/40 font-medium border-r border-black/10 pr-3 mr-1">+91</span>
                </div>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '') // Remove non-digits
                    if (value.startsWith('91') && value.length > 10) {
                      value = value.substring(2)
                    }
                    if (value.length > 10) {
                      value = value.substring(0, 10)
                    }
                    setFormData({ ...formData, phone: value })
                  }}
                  onPaste={(e) => {
                    e.preventDefault()
                    let pastedData = e.clipboardData.getData('text').replace(/\D/g, '')
                    if (pastedData.startsWith('91') && pastedData.length > 10) {
                      pastedData = pastedData.substring(2)
                    }
                    if (pastedData.length > 10) {
                      pastedData = pastedData.substring(0, 10)
                    }
                    setFormData({ ...formData, phone: pastedData })
                  }}
                  required
                  placeholder="10 digit mobile number"
                  className="bg-black/5 border-black/10 focus-visible:ring-primary text-black h-12 rounded-xl pl-16 w-full"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="branch" className="text-black/70">{t('branch_label')} *</Label>
              <Select
                value={formData.branch}
                onValueChange={(value) => setFormData({ ...formData, branch: value })}
                required
              >
                <SelectTrigger className="bg-black/5 border-black/10 text-black h-12 rounded-xl">
                  <SelectValue placeholder={t('select_branch')} />
                </SelectTrigger>
                <SelectContent className="bg-white border-black/10 text-black">
                  <SelectItem value="Tiruvallur (TRL)">Tiruvallur (TRL)</SelectItem>
                  <SelectItem value="oddanchatram (ODC)">Oddanchatram (ODC)</SelectItem>
                  <SelectItem value="Dindigul (DGL)">Dindigul (DGL)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address" className="text-black/70">{t('address')}</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
                className="bg-black/5 border-black/10 focus-visible:ring-primary text-black rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Marital Details */}
        <div className="space-y-4 p-6 rounded-2xl bg-white border border-black/5 shadow-sm">
          <h3 className="text-lg font-semibold text-black/90">{t('marital_details')}</h3>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label className="text-black/70">{t('marital_status')}</Label>
              <Select
                value={formData.marital_status}
                onValueChange={(value) => setFormData({ ...formData, marital_status: value })}
              >
                <SelectTrigger className="bg-black/5 border-black/10 text-black h-12 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-black/10 text-black">
                  <SelectItem value="single">{t('single')}</SelectItem>
                  <SelectItem value="married">{t('married')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.marital_status === 'married' && (
              <div className="grid gap-2 animate-in slide-in-from-top-2">
                <Label htmlFor="marriage_date" className="text-black/70">{t('marriage_date')}</Label>
                <Input
                  id="marriage_date"
                  type="date"
                  value={formData.marriage_date}
                  onChange={(e) => setFormData({ ...formData, marriage_date: e.target.value })}
                  className="bg-black/5 border-black/10 focus-visible:ring-primary text-black h-12 rounded-xl"
                />
              </div>
            )}
          </div>
        </div>

        {/* Children Details */}
        <div className="space-y-4 p-6 rounded-2xl bg-white border border-black/5 shadow-sm">
          <h3 className="text-lg font-semibold text-black/90">{t('children_details')}</h3>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label className="text-black/70">{t('number_of_children')}</Label>
              <Select
                value={formData.number_of_children.toString()}
                onValueChange={(value) => setFormData({ ...formData, number_of_children: parseInt(value) })}
              >
                <SelectTrigger className="bg-black/5 border-black/10 text-black h-12 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-black/10 text-black">
                  <SelectItem value="0">0</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <AnimatePresence>
              {formData.number_of_children >= 1 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-black/5 rounded-xl border border-black/5">
                  <div className="grid gap-2">
                    <Label className="text-black/70">{t('child_name', { n: 1 })}</Label>
                    <Input
                      value={formData.child1_name}
                      onChange={(e) => setFormData({ ...formData, child1_name: e.target.value })}
                      className="bg-white border-black/10 text-black h-11 rounded-lg"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-black/70">{t('child_dob', { n: 1 })}</Label>
                    <Input
                      type="date"
                      value={formData.child1_dob}
                      onChange={(e) => setFormData({ ...formData, child1_dob: e.target.value })}
                      className="bg-white border-black/10 text-black h-11 rounded-lg"
                    />
                  </div>
                </motion.div>
              )}
              
              {formData.number_of_children >= 2 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-black/5 rounded-xl border border-black/5">
                  <div className="grid gap-2">
                    <Label className="text-black/70">{t('child_name', { n: 2 })}</Label>
                    <Input
                      value={formData.child2_name}
                      onChange={(e) => setFormData({ ...formData, child2_name: e.target.value })}
                      className="bg-white border-black/10 text-black h-11 rounded-lg"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-black/70">{t('child_dob', { n: 2 })}</Label>
                    <Input
                      type="date"
                      value={formData.child2_dob}
                      onChange={(e) => setFormData({ ...formData, child2_dob: e.target.value })}
                      className="bg-white border-black/10 text-black h-11 rounded-lg"
                    />
                  </div>
                </motion.div>
              )}
              
              {formData.number_of_children >= 3 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-black/5 rounded-xl border border-black/5">
                  <div className="grid gap-2">
                    <Label className="text-black/70">{t('child_name', { n: 3 })}</Label>
                    <Input
                      value={formData.child3_name}
                      onChange={(e) => setFormData({ ...formData, child3_name: e.target.value })}
                      className="bg-white border-black/10 text-black h-11 rounded-lg"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-black/70">{t('child_dob', { n: 3 })}</Label>
                    <Input
                      type="date"
                      value={formData.child3_dob}
                      onChange={(e) => setFormData({ ...formData, child3_dob: e.target.value })}
                      className="bg-white border-black/10 text-black h-11 rounded-lg"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Insurance */}
        <div className="flex items-center gap-3 p-6 rounded-2xl bg-white border border-black/5 shadow-sm">
          <Switch
            id="insurance"
            checked={formData.has_insurance}
            onCheckedChange={(checked) => setFormData({ ...formData, has_insurance: checked })}
          />
          <Label htmlFor="insurance" className="text-black/90 font-medium">{t('insurance_coverage')}</Label>
        </div>

        <div className="flex gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
            className="flex-1 h-12 text-lg rounded-xl border-black/10"
          >
            {t('cancel')}
          </Button>
          <Button type="submit" disabled={isLoading} className="flex-[2] h-12 text-lg rounded-xl">
            {isLoading ? t('saving') : initialData ? t('update_member') : t('add_member')}
          </Button>
        </div>
      </form>
    </div>
  )
}
