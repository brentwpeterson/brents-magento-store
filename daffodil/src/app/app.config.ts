import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideExternalRouter } from '@daffodil/external-router';
import { provideMagentoDriver } from '@daffodil/driver/magento';
import { provideDaffProductMagentoDriver } from '@daffodil/product/driver/magento';
import { provideDaffNavigationMagentoDriver } from '@daffodil/navigation/driver/magento';
import { provideDaffExternalRouterMagentoDriver } from '@daffodil/external-router/driver/magento/2.4.3';

export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideExternalRouter(),
    provideMagentoDriver({
				uri: "/graphql"
			}),
    provideDaffProductMagentoDriver(),
    provideDaffNavigationMagentoDriver(),
    provideDaffExternalRouterMagentoDriver()]
};
