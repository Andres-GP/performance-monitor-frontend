import { StrategyDetail } from "@/components/strategies/strategy-detail"

export default async function StrategyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <StrategyDetail id={id} />
}
