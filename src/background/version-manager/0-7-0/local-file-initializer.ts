/**
 * Copyright (c) 2022 Hengyang Zhang
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import MergeRuleDatabase from "@db/merge-rule-database"
import { JSON_HOST, LOCAL_HOST_PATTERN, MERGED_HOST, PDF_HOST, PIC_HOST, TXT_HOST } from "@util/constant/remain-host"
import { t2Chrome } from "@i18n/chrome/t"
import siteService from "@service/site-service"

const storage: chrome.storage.StorageArea = chrome.storage.local
const mergeRuleDatabase = new MergeRuleDatabase(storage)

/**
 * Process the host of local files
 * 
 * @since 0.7.0
 */
export default class LocalFileInitializer implements VersionProcessor {
    since(): string {
        return '0.7.0'
    }

    process(): void {
        // Add merged rules
        mergeRuleDatabase.add({
            origin: LOCAL_HOST_PATTERN,
            merged: MERGED_HOST,
        }).then(() => console.log('Local file merge rules initialized'))
        // Add site name
        siteService.saveAlias(
            { host: PDF_HOST },
            t2Chrome(msg => msg.initial.localFile.pdf),
            'DETECTED'
        )
        siteService.saveAlias(
            { host: JSON_HOST },
            t2Chrome(msg => msg.initial.localFile.json),
            'DETECTED'
        )
        siteService.saveAlias(
            { host: PIC_HOST },
            t2Chrome(msg => msg.initial.localFile.pic),
            'DETECTED'
        )
        siteService.saveAlias(
            { host: TXT_HOST },
            t2Chrome(msg => msg.initial.localFile.txt),
            'DETECTED'
        )
    }
}