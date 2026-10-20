import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Wand2 } from 'lucide-react'

interface Props {
  onGenerate: (sizes: { size: string; stockQuantity: number }[]) => void
}

export default function SizeRangeGenerator({ onGenerate }: Props) {
  const [from, setFrom] = useState('36')
  const [to, setTo] = useState('46')
  const [step, setStep] = useState('1')

  const handleGenerate = () => {
    const fromNum = parseFloat(from)
    const toNum = parseFloat(to)
    const stepNum = parseFloat(step)

    if (isNaN(fromNum) || isNaN(toNum) || isNaN(stepNum) || stepNum <= 0 || fromNum > toNum) return

    const sizes: { size: string; stockQuantity: number }[] = []
    for (let s = fromNum; s <= toNum + 0.001; s += stepNum) {
      const rounded = Math.round(s * 10) / 10
      sizes.push({ size: String(rounded), stockQuantity: 0 })
    }
    onGenerate(sizes)
  }

  return (
    <div className="flex gap-2 items-end p-3 bg-muted/50 rounded-md">
      <div className="space-y-1.5">
        <Label className="text-xs">Від</Label>
        <Input value={from} onChange={(e) => setFrom(e.target.value)} className="w-20 h-8" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">До</Label>
        <Input value={to} onChange={(e) => setTo(e.target.value)} className="w-20 h-8" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Крок</Label>
        <Select value={step} onValueChange={setStep}>
          <SelectTrigger className="w-20 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0.5">0.5</SelectItem>
            <SelectItem value="1">1</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="button" size="sm" variant="secondary" onClick={handleGenerate} className="h-8">
        <Wand2 size={13} className="mr-1" /> Згенерувати
      </Button>
    </div>
  )
}
