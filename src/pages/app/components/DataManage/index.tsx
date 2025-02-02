/**
 * Copyright (c) 2021 Hengyang Zhang
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import { ElCol, ElRow } from "element-plus"
import { defineComponent, ref } from "vue"
import ContentContainer from "../common/ContentContainer"
import ClearPanel from "./ClearPanel"
import MemoryInfo, { type MemoryInfoInstance } from "./MemoryInfo"
import Migration from "./Migration"
import './style.sass'

export default defineComponent(() => {
    const memoryInfo = ref<MemoryInfoInstance>()
    const refreshMemory = () => memoryInfo.value?.refresh?.()

    return () => (
        <ContentContainer class="data-manage-container">
            <ElRow gutter={20}>
                <ElCol span={8}>
                    <MemoryInfo ref={memoryInfo} />
                </ElCol>
                <ElCol span={11}>
                    <ClearPanel onDataDelete={refreshMemory} />
                </ElCol>
                <ElCol span={5}>
                    <Migration onImport={refreshMemory} />
                </ElCol>
            </ElRow>
        </ContentContainer>
    )
})