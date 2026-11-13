import { useQuery } from '@tanstack/react-query'
import { getUserById } from '@/api/usersApi'

interface Props {
  customerId: string
  firstName: string
  lastName: string
}

export default function CustomerName({ customerId, firstName, lastName }: Props) {
  const isGuest = !customerId

  const { data } = useQuery({
    queryKey: ['user', customerId],
    queryFn: () => getUserById(customerId),
    enabled: !isGuest,
  })

  if (isGuest) {
    return <span>{firstName} {lastName}</span>
  }

  const user = data?.data
  if (!user) return <span className="font-mono text-xs text-muted-foreground">{customerId.slice(0, 8)}...</span>

  const name = `${user.firstName} ${user.lastName}`.trim() || user.email
  return <span>{name}</span>
}
