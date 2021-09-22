import { all, call, fork, take } from "@redux-saga/core/effects";
import { restService } from "utilities";
import { GET_FARMS_ACCOUNT_DATA } from "./actions";


export function* asyncGetFarmsData({ payload }) {
    const { resolve } = payload
    try {
        const response = yield call(restService, {
            api: `https://api.annex.finance/api/v1/farming`,
            third_party: true,
            method: 'GET',
            params: {}
        });
        if (response.status === 200) {
            resolve({ error: false, ...response });
        } else {
            resolve({ error: true, ...response });
        }
    } catch (e) {
        resolve({ error: true, err: e });
    }
}

export function* watchGetFarmsData() {
    const action = yield take(GET_FARMS_ACCOUNT_DATA)
    yield* asyncGetFarmsData(action)
}

export default function* () {
    yield all([
        fork(watchGetFarmsData),
    ])
}