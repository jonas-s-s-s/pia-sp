/// <reference path="./.astro/types.d.ts" />

declare namespace App {
    // Note: 'import {} from ""' syntax does not work in .d.ts files.
    interface Locals {
        user: import("./auth").User | null;
        session: import("./auth").Session | null;
        realIp: string;
    }
}
