/**
 * Copyright (c) 2021 Hengyang Zhang
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { unref, UnwrapRef } from "vue"

import { ElDivider, ElInputNumber, ElOption, ElSelect, ElSwitch } from "element-plus"
import { t } from "@app/locale"
import { I18nKey, t as t_ } from "@i18n"
import { defineComponent, h, reactive } from "vue"
import optionService from "@service/option-service"
import { renderOptionItem, tagText } from "../common"
import { defaultPopup } from "@util/constant/option"
import { ALL_POPUP_DURATION } from "@util/constant/popup"
import { ALL_DIMENSIONS } from "@util/stat"
import { locale } from "@i18n"
import { rotate } from "@util/array"

type LocaleStyle = {
    durationSelectWidth: number
    typeSelectWidth: number
}

const STYLES: Messages<LocaleStyle> = {
    zh_CN: {
        typeSelectWidth: 85,
        durationSelectWidth: 80,
    },
    en: {
        typeSelectWidth: 115,
        durationSelectWidth: 110
    },
    ja: {
        typeSelectWidth: 85,
        durationSelectWidth: 105,
    },
    pt_PT: {
        typeSelectWidth: 155,
        durationSelectWidth: 120,
    },
    zh_TW: {
        typeSelectWidth: 85,
        durationSelectWidth: 80,
    },
}

const tStyle = (key: I18nKey<LocaleStyle>) => t_(STYLES, { key })

const mergeDomain = (option: UnwrapRef<timer.option.PopupOption>) => h(ElSwitch, {
    modelValue: option.defaultMergeDomain,
    onChange: (newVal: boolean) => {
        option.defaultMergeDomain = newVal
        optionService.setPopupOption(option)
    }
})

const popupMaxInput = (option: UnwrapRef<timer.option.PopupOption>) => h(ElInputNumber, {
    modelValue: option.popupMax,
    size: 'small',
    min: 5,
    max: 30,
    onChange: (val: number) => {
        option.popupMax = val
        optionService.setPopupOption(unref(option))
    }
})

const typeOptions = () => ALL_DIMENSIONS.map(item => h(ElOption, { value: item, label: t(msg => msg.item[item]) }))
const typeSelect = (option: UnwrapRef<timer.option.PopupOption>) => h(ElSelect, {
    modelValue: option.defaultType,
    size: 'small',
    style: { width: `${tStyle(m => m.typeSelectWidth)}px` },
    onChange: (val: timer.stat.Dimension) => {
        option.defaultType = val
        optionService.setPopupOption(unref(option))
    }
}, { default: typeOptions })

const durationOptions = () => ALL_POPUP_DURATION.map(item => h(ElOption, { value: item, label: t(msg => msg.duration[item]) }))
const durationSelect = (option: UnwrapRef<timer.option.PopupOption>) => h(ElSelect, {
    modelValue: option.defaultDuration,
    size: 'small',
    style: { width: `${tStyle(m => m.durationSelectWidth)}px` },
    onChange: (val: PopupDuration) => {
        option.defaultDuration = val
        optionService.setPopupOption(unref(option))
    }
}, { default: durationOptions })

const displaySiteName = (option: UnwrapRef<timer.option.PopupOption>) => h(ElSwitch, {
    modelValue: option.displaySiteName,
    onChange: (newVal: boolean) => {
        option.displaySiteName = newVal
        optionService.setPopupOption(option)
    }
})

const weekStartOptionPairs: [[timer.option.WeekStartOption, string]] = [
    ['default', t(msg => msg.option.popup.weekStartAsNormal)]
]
const allWeekDays = t(msg => msg.calendar.weekDays)
    .split('|')
    .map((weekDay, idx) => [idx + 1, weekDay] as [timer.option.WeekStartOption, string])
rotate(allWeekDays, locale === 'zh_CN' ? 0 : 1, true)
allWeekDays.forEach(weekDayInfo => weekStartOptionPairs.push(weekDayInfo))

const weekStartSelect = (option: UnwrapRef<timer.option.PopupOption>) => h(ElSelect, {
    modelValue: option.weekStart,
    size: 'small',
    onChange(newVal: 'default' | number) {
        option.weekStart = newVal
        optionService.setPopupOption(option)
    }
}, () => weekStartOptionPairs.map(([val, label]) => h(ElOption, { value: val, label })))

const defaultPopOptions = defaultPopup()
const defaultTypeLabel = t(msg => msg.item[defaultPopOptions.defaultType])
const defaultDurationLabel = t(msg => msg.duration[defaultPopOptions.defaultDuration])
const displayDefaultLabel = `${defaultDurationLabel}/${defaultTypeLabel}`

function copy(target: timer.option.PopupOption, source: timer.option.PopupOption) {
    target.defaultMergeDomain = source.defaultMergeDomain
    target.defaultDuration = source.defaultDuration
    target.defaultType = source.defaultType
    target.displaySiteName = source.displaySiteName
    target.popupMax = source.popupMax
    target.weekStart = source.weekStart
}

const _default = defineComponent({
    name: "PopupOptionContainer",
    setup(_props, ctx) {
        const option: UnwrapRef<timer.option.PopupOption> = reactive(defaultPopup())
        optionService.getAllOption().then(currentVal => copy(option, currentVal))
        ctx.expose({
            async reset() {
                copy(option, defaultPopup())
                await optionService.setPopupOption(unref(option))
            }
        })
        return () => h('div', [
            renderOptionItem({
                input: mergeDomain(option),
            },
                msg => msg.popup.defaultMergeDomain,
                t(msg => msg.option.no)
            ),
            h(ElDivider),
            renderOptionItem({
                duration: durationSelect(option),
                type: typeSelect(option)
            },
                msg => msg.popup.defaultDisplay,
                displayDefaultLabel
            ),
            h(ElDivider),
            renderOptionItem({
                input: weekStartSelect(option)
            }, msg => msg.popup.weekStart, t(msg => msg.option.popup.weekStartAsNormal)),
            h(ElDivider),
            renderOptionItem(popupMaxInput(option), msg => msg.popup.max, defaultPopOptions.popupMax),
            h(ElDivider),
            renderOptionItem({
                input: displaySiteName(option),
                siteName: tagText(msg => msg.option.statistics.siteName)
            }, msg => msg.popup.displaySiteName, t(msg => msg.option.yes))
        ])
    }
})

export default _default