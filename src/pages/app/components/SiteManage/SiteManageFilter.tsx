/**
 * Copyright (c) 2021 Hengyang Zhang
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */
import ButtonFilterItem from "@app/components/common/ButtonFilterItem"
import InputFilterItem from "@app/components/common/InputFilterItem"
import { useCategories } from "@app/context"
import { t } from "@app/locale"
import { ArrowDown, Connection, Delete, Grid, Plus } from "@element-plus/icons-vue"
import { useState } from "@hooks"
import Flex from "@pages/components/Flex"
import { ElButton, ElDropdown, ElDropdownItem, ElDropdownMenu, ElLink } from "element-plus"
import { computed, defineComponent, type PropType, ref, watch } from "vue"
import MultiSelectFilterItem, { type MultiSelectFilterItemInstance } from "../common/MultiSelectFilterItem"
import { ALL_TYPES } from "./common"

export type FilterOption = {
    host?: string,
    alias?: string,
    types?: timer.site.Type[],
    cateIds?: number[],
}

const _default = defineComponent({
    props: {
        defaultValue: Object as PropType<FilterOption>,
    },
    emits: {
        change: (_option: FilterOption) => true,
        create: () => true,
        batchDelete: () => true,
        batchChangeCate: () => true,
        batchDisassociate: () => true,
    },
    setup(props, ctx) {
        const { categories } = useCategories()

        const defaultOption = props.defaultValue
        const [host, setHost] = useState(defaultOption?.host)
        const [alias, setAlias] = useState(defaultOption?.alias)
        const [types, setTypes] = useState(defaultOption?.types)

        const cateDisabled = computed(() => !!types.value?.length && !types.value?.includes?.('normal'))
        watch([cateDisabled], () => cateDisabled.value && cateSelect.value?.updateValue?.([]))

        const [cateIds, setCateIds] = useState(defaultOption?.cateIds)

        watch(categories, () => {
            const allCateIds = categories.value?.map(c => c.id) || []
            const newVal = cateIds.value?.filter(cid => allCateIds.includes(cid))
            if (newVal?.length !== cateIds.value?.length) {
                // Selected category is deleted, so reset the select value
                cateSelect.value?.updateValue?.(newVal)
            }
        })

        watch([host, alias, types, cateIds], () => ctx.emit("change", {
            host: host.value,
            alias: alias.value,
            types: types.value,
            cateIds: cateIds.value,
        }))

        const cateSelect = ref<MultiSelectFilterItemInstance>()

        return () => <>
            <InputFilterItem
                placeholder={t(msg => msg.siteManage.hostPlaceholder)}
                onSearch={setHost}
            />
            <InputFilterItem
                placeholder={t(msg => msg.siteManage.aliasPlaceholder)}
                onSearch={setAlias}
            />
            <MultiSelectFilterItem
                placeholder={t(msg => msg.siteManage.column.type)}
                options={ALL_TYPES.map(type => ({ value: type, label: t(msg => msg.siteManage.type[type].name) }))}
                defaultValue={types.value}
                onChange={setTypes}
            />
            <MultiSelectFilterItem
                disabled={cateDisabled.value}
                ref={cateSelect}
                placeholder={t(msg => msg.siteManage.column.cate)}
                options={categories.value?.map(cate => ({ value: cate.id, label: cate.name }))}
                defaultValue={cateIds.value}
                onChange={setCateIds}
            />
            <Flex align="center" class="filter-item-right" gap={3}>
                <ElButton
                    link
                    type="primary"
                    icon={<Grid />}
                    onClick={() => ctx.emit('batchChangeCate')}
                >
                    {t(msg => msg.siteManage.cate.batchChange)}
                </ElButton>
                <ElDropdown v-slots={{
                    default: () => <ElLink type="primary" underline={false} icon={ArrowDown} />,
                    dropdown: () => (
                        <ElDropdownMenu>
                            <ElDropdownItem
                                icon={<Connection />}
                                onClick={() => ctx.emit('batchDisassociate')}
                            >
                                {t(msg => msg.siteManage.cate.batchDisassociate)}
                            </ElDropdownItem>
                            <ElDropdownItem
                                icon={<Delete />}
                                onClick={() => ctx.emit('batchDelete')}
                            >
                                {t(msg => msg.button.batchDelete)}
                            </ElDropdownItem>
                        </ElDropdownMenu>
                    )
                }} />
            </Flex>
            <ButtonFilterItem
                text={t(msg => msg.button.create)}
                icon={<Plus />}
                type="success"
                onClick={() => ctx.emit("create")}
            />
        </>
    }
})

export default _default