export interface Member {
  id: string
  user_id: string
  name: string
  date_of_birth: string
  blood_group: string | null
  branch: 'Tiruvallur (TRL)' | 'oddanchatram (ODC)' | 'Dindigul (DGL)' | null
  phone: string
  address: string | null
  marital_status: string
  marriage_date: string | null
  number_of_children: number
  child1_name: string | null
  child1_dob: string | null
  child2_name: string | null
  child2_dob: string | null
  child3_name: string | null
  child3_dob: string | null
  has_insurance: boolean
  created_at: string
  updated_at: string
}

export interface ReminderAcknowledgment {
  id: string
  member_id: string
  event_type: 'Birthday' | 'Wedding Anniversary' | 'Child Birthday'
  event_date: string // The actual date of the event (e.g., 2026-05-06)
  acknowledged_at: string
}

export interface NotificationContact {
  id: string
  user_id: string
  contact_type: 'email'
  contact_value: string
  is_active: boolean
  created_at: string
}

export interface Settings {
  id: string
  user_id: string
  reminder_days_before: number
  created_at: string
  updated_at: string
}

export interface OtpVerification {
  id: string
  user_id: string
  contact_type: 'email'
  contact_value: string
  otp: string
  expires_at: string
  verified: boolean
  created_at: string
}

export interface UpcomingEvent {
  id: string
  memberId: string
  memberName: string
  eventType: 'birthday' | 'anniversary' | 'child_birthday'
  eventDate: Date
  daysUntil: number
  childName?: string
  phone: string
}
