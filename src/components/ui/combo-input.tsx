import { useId } from 'react'
import { Input } from './input'
import { cn } from '@/lib/utils'

interface Props {
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder?: string
  className?: string
}

export default function ComboInput({ value, onChange, options, placeholder, className }: Props) {
  const id = useId()
  return (
    <>
      <Input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        list={id}
        className={cn('', className)}
        autoComplete="off"
      />
      <datalist id={id}>
        {options.map(o => <option key={o} value={o} />)}
      </datalist>
    </>
  )
}
