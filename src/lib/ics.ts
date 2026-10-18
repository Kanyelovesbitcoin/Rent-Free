// Builds a tiny calendar file (.ics) so people get reminders like "cancel Netflix before it renews".
// Works with Apple Calendar, Google Calendar and Outlook. No account or server needed.

export interface Reminder {
  title: string
  description: string
  date: Date // all-day event on this date
}

const pad = (n: number) => String(n).padStart(2, '0')
const day = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
const escape = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')

export function buildIcs(reminders: Reminder[], now = new Date()): string {
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Rent-Free//Switch plan//EN', 'CALSCALE:GREGORIAN']
  reminders.forEach((r, i) => {
    const next = new Date(r.date)
    next.setDate(next.getDate() + 1)
    lines.push(
      'BEGIN:VEVENT',
      `UID:rent-free-${day(r.date)}-${i}@rent-free`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${day(r.date)}`,
      `DTEND;VALUE=DATE:${day(next)}`,
      `SUMMARY:${escape(r.title)}`,
      `DESCRIPTION:${escape(r.description)}`,
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escape(r.title)}`,
      'TRIGGER:-PT15H',
      'END:VALARM',
      'END:VEVENT',
    )
  })
  lines.push('END:VCALENDAR')
  return lines.join('\r\n') + '\r\n'
}

export function downloadFile(content: BlobPart, filename: string, type: string) {
  const blob = new Blob([content], { type })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}
