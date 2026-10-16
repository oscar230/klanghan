import { env } from '$env/dynamic/private';
import { createStore } from './store';
import { createRepository } from './repository';

// Created on first use so that building the app needs no storage configuration.
let repo: ReturnType<typeof createRepository> | undefined;

export const getRepo = () => (repo ??= createRepository(createStore(env)));
