import { useState } from 'react'
import { format } from 'date-fns'
import { uk } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface DateRangePickerProps {
  value: DateRange | undefined
  onChange: (range: DateRange | undefined) => void
  className?: string
}

export default function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [open, setOpen] = useState(false)

  const label = value?.from
    ? value.to
      ? `${format(value.from, 'd MMM', { locale: uk })} — ${format(value.to, 'd MMM yyyy', { locale: uk })}`
      : format(value.from, 'd MMM yyyy', { locale: uk })
    : 'Оберіть період'

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn('gap-2 font-normal', !value && 'text-muted-foreground', className)}
        >
          <CalendarIcon size={14} />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          mode="range"
          selected={value}
          onSelect={onChange}
          numberOfMonths={2}
          locale={uk}
        />
        {value && (
          <div className="border-t p-3 flex justify-end">
            <Button variant="ghost" size="sm" onClick={() => { onChange(undefined); setOpen(false) }}>
              Скинути
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
