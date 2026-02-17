'use client'

import { useMemo, useState } from 'react'
import type { Plan } from '../../../lib/planRepository'

type PlanOptionsCardProps = {
  optionCard: Plan['optionCard']
}

const formatPrice = (value: number | null) =>
  typeof value === 'number'
    ? value.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      })
    : 'Add pricing info'

export default function PlanOptionsCard({ optionCard }: PlanOptionsCardProps) {
  const optionGroupIndexes = useMemo(
    () =>
      optionCard.groups.reduce<Record<number, number | null>>((acc, group, groupIndex) => {
        if (group.options?.length) {
          acc[groupIndex] = null
        }
        return acc
      }, {}),
    [optionCard.groups]
  )

  const [selectedIndexes, setSelectedIndexes] = useState<Record<number, number | null>>(optionGroupIndexes)

  const additionalCost = useMemo(
    () =>
      optionCard.groups.reduce((sum, group, groupIndex) => {
        const selectedIndex = selectedIndexes[groupIndex]
        const selectedOption = group.options?.[selectedIndex]
        return sum + (selectedOption?.priceAdjustment ?? 0)
      }, 0),
    [optionCard.groups, selectedIndexes]
  )

  const totalPrice =
    typeof optionCard.basePriceValue === 'number' ? optionCard.basePriceValue + additionalCost : null

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
                  const isSelected = selectedIndexes[groupIndex] === optionIndex

                  return (
                    <button
                      aria-pressed={isSelected}
                      className={`plan-radio-option${isSelected ? ' is-selected' : ''}`}
                      key={`${group.label}-${option.label}`}
                      onClick={() =>
                        setSelectedIndexes((current) => ({
                          ...current,
                          [groupIndex]: current[groupIndex] === optionIndex ? null : optionIndex,
                        }))
                      }
                      type="button"
                    >
                      <span className="plan-radio-circle" aria-hidden="true" />
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
          <button className="btn btn-primary" type="button">
            {optionCard.ctaLabel}
          </button>
          <p className="plan-cta-helper">{optionCard.ctaHelper}</p>
        </div>
      </div>
    </aside>
  )
}
