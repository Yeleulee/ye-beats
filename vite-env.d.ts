/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_YOUTUBE_API_KEY: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

// Support for process.env injected by Vite define
declare const process: {
    env: {
        YOUTUBE_API_KEY?: string;
        [key: string]: any;
    };
};
