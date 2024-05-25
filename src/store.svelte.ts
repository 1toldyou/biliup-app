import {type Writable, writable} from "svelte/store";

export let isLoggedIn: Writable<boolean> = writable(false);
