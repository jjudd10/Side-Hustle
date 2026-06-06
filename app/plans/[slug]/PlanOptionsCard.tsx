'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Plan } from '../../../lib/planRepository'

type PlanOptionsCardProps = {
  optionCard: Plan['optionCard']
  planSlug: string
}

const formatPrice = (value: number | null) =>
  typeof value === 'number'
    ? value.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      })
    : 'Add pricing info'

export default function PlanOptionsCard({ optionCard, planSlug }: PlanOptionsCardProps) {
  const router = useRouter()

  const optionGroupIndexes = useMemo(
    () =>
      optionCard.groups.reduce<Record<number, number[]>>((acc, group, groupIndex) => {
        if (group.options?.length) {
          acc[groupIndex] = []
        }
        return acc
      }, {}),
    [optionCard.groups]
  )

  const [selectedIndexes, setSelectedIndexes] = useState<Record<number, number[]>>(optionGroupIndexes)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const additionalCost = useMemo(
    () =>
      optionCard.groups.reduce((sum, group, groupIndex) => {
        const selected = selectedIndexes[groupIndex] ?? []
        return sum + selected.reduce((groupSum, optionIndex) => groupSum + (group.options?.[optionIndex]?.priceAdjustment ?? 0), 0)
      }, 0),
    [optionCard.groups, selectedIndexes]
  )

  const totalPrice =
    typeof optionCard.basePriceValue === 'number' ? optionCard.basePriceValue + additionalCost : null

  const handlePurchase = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planSlug, selectedOptionsByGroup: selectedIndexes }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }

      const params = new URLSearchParams({
        clientSecret: data.clientSecret,
        amount: String(data.amount),
        planTitle: data.planTitle,
      })

      router.push(`/checkout?${params.toString()}`)
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <aside className="plan-options-card">
      <div className="plan-options-card-body">
        <h2>{optionCard.heading}</h2>
        <p>{optionCard.intro}</p>

        {optionCard.groups.map((group, groupIndex) => (
          <div className="plan-option-group" key={`${group.label}-${groupIndex}`}>
            <p className="plan-option-label">{group.label}</p>
            {group.helper && <p className="plan-option-copy">{group.helper}</p>}
            {group.options && group.options.length > 0 && (
              <div className="plan-radio-group" role="group" aria-label={group.label}>
                {group.options.map((option, optionIndex) => {
                  const isSelected = (selectedIndexes[groupIndex] ?? []).includes(optionIndex)

                  return (
                    <button
                      aria-pressed={isSelected}
                      className={`plan-radio-option${isSelected ? ' is-selected' : ''}`}
                      key={`${group.label}-${option.label}`}
                      onClick={() =>
                        setSelectedIndexes((current) => {
                          const currentGroup = current[groupIndex] ?? []
                          let newGroup: number[]
                          if (group.multiSelect) {
                            newGroup = currentGroup.includes(optionIndex)
                              ? currentGroup.filter((i) => i !== optionIndex)
                              : [...currentGroup, optionIndex]
                          } else {
                            newGroup = currentGroup.includes(optionIndex) ? [] : [optionIndex]
                          }
                          return { ...current, [groupIndex]: newGroup } as Record<number, number[]>
                        })
                      }
                      type="button"
                    >
                      <span className={group.multiSelect ? 'plan-checkbox-square' : 'plan-radio-circle'} aria-hidden="true" />
                      <span>
                        {option.label}
                        {option.priceAdjustment ? ` (+${formatPrice(option.priceAdjustment)})` : ''}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        ))}

        <div className="plan-options-totals">
          <div>
            <p className="plan-price">{formatPrice(totalPrice)}</p>
          </div>
          {error && <p style={{ color: '#b91c1c', fontSize: '0.875rem', margin: '0 0 8px' }}>{error}</p>}
          <button
            className="btn btn-primary"
            disabled={loading || totalPrice === null}
            onClick={handlePurchase}
            type="button"
          >
            {loading ? 'Please wait…' : optionCard.ctaLabel}
          </button>
          <p className="plan-cta-helper">{optionCard.ctaHelper}</p>
        </div>
      </div>
    </aside>
  )
}
