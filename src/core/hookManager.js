import { HOOK_TYPES } from '../constants/hookTypes.js';

export class HookManager {
	constructor() {
		this.hooks = {
			[HOOK_TYPES.PRE_SET]: [],
			[HOOK_TYPES.POST_GET]: [],
			[HOOK_TYPES.EVICTION]: [],
		};
	}

	addHook(hookType, fn) {
		if (this.hooks[hookType]) {
			this.hooks[hookType].push(fn);
		} else {
			throw new Error(`Unknown hook type: ${hookType}`);
		}
	}

	runHooks(hookType, ...args) {
		if (this.hooks[hookType]) {
			for (const hook of this.hooks[hookType]) {
				hook(...args);
			}
		}
	}
}
