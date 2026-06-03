import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideExternalRouter } from '@daffodil/external-router';
import { provideMagentoDriver } from '@daffodil/driver/magento';
import { provideDaffProductMagentoDriver } from '@daffodil/product/driver/magento';
import { provideDaffNavigationMagentoDriver } from '@daffodil/navigation/driver/magento';
import { provideDaffExternalRouterMagentoDriver } from '@daffodil/external-router/driver/magento/2.4.3';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

// GraphQL endpoint differs by platform:
//  - browser: relative "/graphql" (Caddy/reverse-proxy forwards it to Magento)
//  - SSR server: no proxy + no origin, so it needs an absolute URL to Magento.
//    Defaults to the devcontainer service "nginx:8000"; override with the
//    MAGENTO_SSR_GRAPHQL_URL env var at deploy time.
declare const process: any;
const graphqlUri =
  typeof window === 'undefined'
    ? ((typeof process !== 'undefined' && process.env && process.env['MAGENTO_SSR_GRAPHQL_URL'])
        || 'http://nginx:8000/graphql')
    : '/graphql';

export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideExternalRouter(),
    provideMagentoDriver({
				uri: graphqlUri
			}),
    provideDaffProductMagentoDriver(),
    provideDaffNavigationMagentoDriver(),
    provideDaffExternalRouterMagentoDriver(), provideClientHydration(withEventReplay())]
};
