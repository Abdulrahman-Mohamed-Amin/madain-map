import { InjectionToken } from '@angular/core';

/**
 * الـ response بتاع Express — بيتوفّر من server.ts وقت الـ SSR بس (في المتصفح والـ prerender بيبقى null).
 * بنستخدمه عشان نرجّع status حقيقي (زي 404) بدل 200.
 */
export const SERVER_RESPONSE = new InjectionToken<{ status(code: number): unknown }>('SERVER_RESPONSE');
