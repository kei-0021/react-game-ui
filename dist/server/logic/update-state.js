import { deepFill } from './utils.js';
export function updateState(oldState, newState) {
    // players は参照を維持したいため除外
    deepFill(oldState, newState, ['players']);
}
