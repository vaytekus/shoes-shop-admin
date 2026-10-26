import { useQuery } from '@tanstack/react-query'
import { getUserById } from '@/api/usersApi'

export default function CustomerName({ customerId }: { customerId: string }) {
  const { data } = useQuery({
    queryKey: ['user', customerId],
    queryFn: () => getUserById(customerId),
  })

  const user = data?.data
  if (!user) return <span className="font-mono text-xs text-muted-foreground">{customerId.slice(0, 8)}...</span>

  const name = `${user.firstName} ${user.lastName}`.trim() || user.email
  return <span>{name}</span>
}
