import { takeLatest, put, spawn, debounce, retry } from 'redux-saga/effects';
import { searchSkillsRequest, searchSkillsSuccess, searchSkillsFailure, emptySearchField } from '../actions/actionCreators';
import { CHANGE_SEARCH_FIELD, SEARCH_SKILLS_REQUEST } from '../actions/actionTypes';
import { searchSkills } from '../api/index';

function filterChangeSearchAction({ type }) {
    return type === CHANGE_SEARCH_FIELD // && payload.search.trim() !== ''
}

// worker
function* handleChangeSearchSaga(action) {
    console.log(action)
    yield put(searchSkillsRequest(action.payload.search));
}

// watcher
function* watchChangeSearchSaga() {
    yield debounce(100, filterChangeSearchAction, handleChangeSearchSaga);
}

// worker
function* handleSearchSkillsSaga(action) {
    if (action.payload.search.trim()) {
        try {
            const retryCount = 3;
            const retryDelay = 1 * 1000; // ms
            const data = yield retry(retryCount, retryDelay, searchSkills, action.payload.search);
            yield put(searchSkillsSuccess(data));
        } catch (e) {
            yield put(searchSkillsFailure(e.message));
        }
    } else {
        yield put(emptySearchField());
    }
}

// watcher
function* watchSearchSkillsSaga() {
    yield takeLatest(SEARCH_SKILLS_REQUEST, handleSearchSkillsSaga);
}

export default function* saga() {
    yield spawn(watchChangeSearchSaga);
    yield spawn(watchSearchSkillsSaga);
}