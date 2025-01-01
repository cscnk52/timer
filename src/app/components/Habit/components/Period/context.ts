/**
 * Copyright (c) 2024 Hengyang Zhang
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { useProvide, useProvider } from "@hooks"
import { type Ref } from "vue"
import { FilterOption } from "./common"

type Value = {
    curr: timer.period.Row[]
    prev: timer.period.Row[]
}

export type PeriodRange = {
    curr: timer.period.KeyRange
    prev: timer.period.KeyRange
}

type Context = {
    value: Ref<Value>
    filter: Ref<FilterOption>
    periodRange: Ref<PeriodRange>
}

const NAMESPACE = 'habitPeriod'

export const initProvider = (
    value: Ref<Value>,
    filter: Ref<FilterOption>,
    periodRange: Ref<PeriodRange>,
) => useProvide<Context>(NAMESPACE, { value, filter, periodRange })

export const usePeriodValue = (): Ref<Value> => useProvider<Context>(NAMESPACE, "value").value

export const usePeriodFilter = (): Ref<FilterOption> => useProvider<Context>(NAMESPACE, "filter").filter

export const usePeriodRange = (): Ref<PeriodRange> => useProvider<Context>(NAMESPACE, "periodRange").periodRange